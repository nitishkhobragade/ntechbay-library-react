import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SendMessagePayload {
  message: string;
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
}

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

const NITISH_SYSTEM_INSTRUCTION = `You are Er. Nitish Khobragade (NK), the Founder, Developer, and Chief Academic Mentor of NTechBay Library (ntechbay.com).
Your Identity & Persona:
- Name: Er. Nitish Khobragade (NK)
- Role: Founder of NTechBay Library & Senior Engineering Mentor
- Tone: Highly welcoming, enthusiastic, friendly, supportive elder brother (bhaiya/sir), and professional.
- Language style: Seamlessly bilingual. Fluently speak in natural Hinglish (e.g., "Haan bilkul! Main aapki help karta hoon..."), Pure Hindi when addressed in Hindi, and English when addressed in English. Automatically match the student's chosen language.
- Formatting: Use structured Markdown with bold highlights, bullet points, and neat spacing so responses are easy to read on mobile and desktop.

Domain Knowledge & Portal Navigation:
1. RGPV & Technical Education: Expert advice on B.Tech (CSE, IT, AIML, Data Science, Civil, ME, EC, EE, etc.), Polytechnic Diploma, M.Tech, and MBA schemes, syllabus, semester exam scoring strategies, topper study habits, and PYQs.
2. Portal Resources Available on NTechBay:
   - Syllabus: Latest official semester scheme & subject syllabus PDF links.
   - Previous Year Papers (PYQ): 5-10 years solved & unsolved university exam papers.
   - Notes: Clean handwritten topper notes & faculty lecture notes.
   - Study Books: Reference textbooks & standard author PDFs.
   - Important Questions: High-weightage unit-wise questions for exam preparation.
   - Videos: Curated playlist tutorials.
3. Portal Navigation Tips:
   - Students can choose Course -> Semester -> Branch from the top selector on the homepage.
   - Click on any resource category card to open the resource modal and view/download drive links.
   - Use the "Quick Drive" button in the navigation bar to directly browse organized cloud folders.
4. Contact & Escalation:
   - For corrections, missing notes, or direct help: Politely guide them to WhatsApp Support (+91 89823 24497) or the Contact Us form on the portal.
   - For Admin: Dedicated secure admin login is available via the Admin shield in the menu.

Guidelines:
- Keep answers practical, motivating, clear, and focused.
- If asking about external exam dates, advise checking rgpv.ac.in for the official timetable while offering study advice.`;

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

NTechBay Library par RGPV ke pichle 5-10 saal ke papers uplabdh hain:
- Top selector me apna **Course, Semester aur Branch** set karein.
- **"Previous Year Papers"** card par click karein.
- Har semester ke unit-wise papers drive folders me mil jayenge.

Exam me top karne ke liye pichle 3 saal ke questions zarur solve karein!`;
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

  return `Abhi AI network par thoda temporary load hai, lekin main aapki madad ke liye yaha hoon!

Aap portal par **Course, Semester aur Branch** select karke **Notes, Syllabus, PYQs** aur **Books** aasaani se access kar sakte hain. Kisi bhi direct help ke liye aap WhatsApp support ([+91 89823 24497](https://wa.me/918982324497)) par connect karein.`;
}

/**
 * Sends a message to the Gemini API via server-side /api/chat route first,
 * with a resilient client-side fallback if VITE_GEMINI_API_KEY is available.
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  // 1. Primary: Try relative server-side route /api/chat
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: formattedHistory }),
    });

    const contentType = res.headers.get('content-type') || '';
    // Guard against Firebase Hosting SPA fallback serving index.html (text/html) instead of API JSON
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data?.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('Local /api/chat not available or not JSON, checking fallback options...', err);
  }

  // 2. Secondary: If on Firebase Hosting or external domain, try remote Cloud Run backend URL if configured
  const remoteAppUrl = (import.meta as any).env?.VITE_APP_URL;
  if (
    remoteAppUrl &&
    typeof window !== 'undefined' &&
    !window.location.origin.includes('localhost') &&
    !window.location.origin.includes('127.0.0.1')
  ) {
    try {
      const remoteEndpoint = `${remoteAppUrl.replace(/\/$/, '')}/api/chat`;
      const remoteRes = await fetch(remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: formattedHistory }),
      });
      const remoteContentType = remoteRes.headers.get('content-type') || '';
      if (remoteRes.ok && remoteContentType.includes('application/json')) {
        const remoteData = await remoteRes.json();
        if (remoteData?.reply) {
          return remoteData.reply;
        }
      }
    } catch {
      // Continue to client GenAI fallback
    }
  }

  // 3. Client-side fallback via @google/genai SDK (bundled via Vite or configured by user)
  const clientKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('ntechbay_gemini_api_key') : null);

  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const contents = [
        ...formattedHistory,
        {
          role: 'user' as const,
          parts: [{ text: message }],
        },
      ];

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
            return response.text;
          }
        } catch (mErr: any) {
          console.warn(`Client model ${modelName} unavailable, trying next...`, mErr);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
    } catch (clientErr) {
      console.error('Client Gemini fallback error:', clientErr);
    }
  }

  // 4. Smart contextual fallback if all external endpoints are temporarily congested
  return getSmartContextualFallback(message);
}
