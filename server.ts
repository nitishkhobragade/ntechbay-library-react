import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// High-availability candidate model pool to handle temporary 503 capacity spikes
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

const NITISH_SYSTEM_INSTRUCTION = `You are Er. Nitish Khobragade (NK), the Founder, Developer, and Chief Academic Mentor of NTechBay Library (ntechbay.com).
Your Personality & Identity:
- Name: Er. Nitish Khobragade (NK)
- Role: Founder of NTechBay Library & Senior Engineering Mentor
- Tone: Highly welcoming, warm, friendly, brotherly (bhaiya/sir), smart, supportive, and professional.
- Language style: Seamlessly bilingual. Use natural Hinglish (e.g. "Arre bilkul! Main aapki help karta hoon..."), Pure Hindi when addressed in Hindi, and English when addressed in English. Always match the student's chosen language.
- Formatting: Use structured Markdown with bold highlights, bullet points, and clean spacing so answers are very easy to read on mobile and desktop.

Domain Knowledge & Portal Navigation:
- Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV) & Technical Education: Expert advice on B.Tech, Polytechnic Diploma, M.Tech, and MBA schemes, branches, semester exams, passing strategies, toppers' tips, and previous years' question patterns.
- Portal Materials Available on NTechBay:
  1. Syllabus: Latest officially updated PDF schemes for all semesters & branches.
  2. PYQs (Previous Year Papers): Real exam papers from past 5-10 years.
  3. Notes: Clean handwritten and faculty lecture notes.
  4. Study Books: Standard textbook references and PDFs.
  5. Important Questions: High-yield questions per unit for semester exams.
  6. Video Tutorials: Curated video lectures.
- How to Navigate on the Website:
  - Students can choose their Course (B.Tech / Polytechnic / M.Tech / MBA), Semester, and Branch from the top selector.
  - Click on any category card (e.g., "Syllabus", "Previous Year Papers", "Notes") to view drive links and download.
  - Use the "Quick Drive" button in the navigation bar to directly browse organized cloud folders.
- Contact & Official Support:
  - If a student asks for notes that aren't listed, or has website issues, or wants to connect with you directly: Politely guide them to WhatsApp support (+91 89823 24497) or the Contact Us form on the portal.

Guidelines:
- Keep responses concise, practical, motivating, and cheerful.
- If asking about exam dates, advise checking rgpv.ac.in for the official timetable and focus on preparation.`;

/**
 * Intelligent contextual fallback response when upstream model capacity is temporarily unavailable
 */
function getSmartContextualFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('syllabus') || q.includes('download')) {
    return `**Syllabus download karne ka aasan tareeka:**

1. Homepage ke top selector me apna **Course** (jaise B.Tech ya Polytechnic) chuniye.
2. Apna **Semester** aur **Branch** select karein.
3. Neeche diye gaye **"Syllabus"** card par click karein.
4. Drive PDF view ya download karne ka direct option mil jayega!

Agar kisi specific subject ka syllabus nahi mil raha, toh aap WhatsApp support (+91 89823 24497) par message bhej sakte hain.`;
  }

  if (q.includes('pyq') || q.includes('paper') || q.includes('previous') || q.includes('old')) {
    return `**Previous Year Question Papers (PYQs):**

NTechBay Library par RGPV ke last 5-10 saal ke papers uplabdh hain:
- Top selector me apna **Course, Semester aur Branch** set karein.
- **"Previous Year Papers"** card par click karein.
- Har semester ke unit-wise aur subject-wise papers drive folders me mil jayenge.

Exam me maximum marks ke liye pichle 3 saal ke questions zarur solve karein!`;
  }

  if (q.includes('m.tech') || q.includes('polytechnic') || q.includes('mba') || q.includes('b.tech')) {
    return `**NTechBay All Courses Material:**

Hamare portal par 4 mukhya categories hain:
- **B.Tech:** CSE, IT, AIML, Data Science, Civil, ME, EC, EE sabhi branches.
- **Polytechnic Diploma:** Core branches aur common first-year syllabus/notes.
- **M.Tech:** Advanced engineering reference books aur specialized topics.
- **MBA:** Management notes, syllabus aur PYQs.

Header me diye dropdown se apna course select karein aur resources access karein!`;
  }

  if (q.includes('contact') || q.includes('admin') || q.includes('help') || q.includes('whatsapp')) {
    return `Aap mujhse ya NTechBay team se direct connect kar sakte hain:

- **WhatsApp Support:** [+91 89823 24497](https://wa.me/918982324497)
- **Contact Page:** Website header me diye "Contact" button par click karein.
- **Admin Portal:** Admin privileges ke liye secure login option menu me uplabdh hai.`;
  }

  return `Abhi AI network par thoda temporary load hai, lekin main aapki madad ke liye tayyar hoon!

Aap portal par **Course, Semester aur Branch** select karke **Notes, Syllabus, PYQs** aur **Books** aasaani se download kar sakte hain. Kisi bhi direct help ke liye aap WhatsApp support ([+91 89823 24497](https://wa.me/918982324497)) use kar sakte hain.`;
}

async function startServer() {
  const app = express();

  // Enable CORS for all incoming requests (supports Firebase Hosting and external clients)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Gemini Chatbot route for Er. Nitish (AI Mentor)
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackReply = getSmartContextualFallback(message);
      return res.json({ reply: fallbackReply });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          if (item && (item.role === 'user' || item.role === 'model')) {
            const txt =
              typeof item.text === 'string'
                ? item.text
                : item.parts && Array.isArray(item.parts) && item.parts[0]?.text
                ? item.parts[0].text
                : '';
            if (txt.trim()) {
              contents.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: txt }],
              });
            }
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Try candidate models in order of resilience
      let generatedText: string | null = null;
      let lastErr: any = null;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: NITISH_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          if (response?.text) {
            generatedText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} unavailable (${modelErr?.status || modelErr?.code || modelErr?.message}). Trying next candidate...`);
          lastErr = modelErr;
          // Short delay between retries
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      if (generatedText) {
        return res.json({ reply: generatedText });
      }

      // If all candidate models experienced temporary upstream demand spikes, provide smart contextual reply
      console.warn('All candidate models busy; providing contextual fallback reply. Last error:', lastErr?.message);
      const smartFallback = getSmartContextualFallback(message);
      return res.json({ reply: smartFallback });
    } catch (err: any) {
      console.error('Er. Nitish Chat API error:', err);
      const fallback = getSmartContextualFallback(message);
      return res.json({ reply: fallback });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NTechBay Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
