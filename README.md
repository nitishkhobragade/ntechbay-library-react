# 📚 NTechBay-Library

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)

**A high-performance, password-protected digital academic portal and e-library designed for RGPV engineering students (B.Tech, Polytechnic, MBA, and M.Tech).**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Curriculum Structure](#-curriculum-structure) • [Admin Control Center](#-admin-control-center) • [Getting Started](#-getting-started) • [Creator](#-creator--contact)

</div>

---

## 🌟 Overview

**NTechBay-Library** is a modern web-based academic resource portal built by **Er. Nitish Khobragade**. It streamlines access to university study materials, syllabus copies, handwritten lecture notes, recommended textbooks, video playlists, and previous year question papers (PYQs). 

The platform features a **two-tier security gate** (student entrance password + master admin authentication), interactive 3D/parallax floating elements, and a dedicated **Admin Control Center** allowing administrators to dynamically update Google Drive links and post university broadcast announcements in real-time.

---

## 🚀 Key Features

- 🔐 **Dual-Tier Authentication System**
  - **Student Access Gate:** Protects academic materials with custom entrance security.
  - **Master Admin Portal:** Dedicated administrative dashboard accessible with secure credentials to manage site settings.

- 🎓 **Comprehensive Multi-Program Curriculum**
  - **B.Tech:** 8 Semesters across Civil, Computer Science, Information Technology, Mechanical, Electronics & Communication, and Electrical Engineering.
  - **Polytechnic (Diploma):** 6 Semesters with specialized technical branches.
  - **MBA:** 4 Semesters of core and elective management disciplines.
  - **M.Tech:** Postgraduate advanced engineering curriculum.
  - **Intelligent Branch Routing:** Automatically adapts between common foundational semesters (Sem 1 & 2 for B.Tech/Polytechnic) and departmental specializations.

- 📂 **6 Core Resource Pillars**
  - 📋 **Syllabus:** Up-to-date university scheme and curriculum outlines.
  - 📚 **Study Books:** Recommended reference textbooks and standard author editions.
  - 📝 **Lecture Notes:** Handwritten and curated unit-wise subject notes.
  - ❓ **Question Banks:** Important topic questions and exam preparation sets.
  - 🎥 **Video Lectures:** Curated YouTube playlists and conceptual tutorials.
  - 📄 **Previous Year Papers (PYQs):** 5+ years of solved and unsolved university exam papers.

- ⚡ **Direct Cloud Integration**
  - Seamless one-click redirection to Google Drive collections.
  - Base64 encoded link protection with dynamic client-side decoders.

- 🛠️ **Real-Time Admin Management**
  - **Link Modification Suite:** Update or override Google Drive links for any program, semester, or branch on the fly without changing source code.
  - **Password Manager:** Update student access password and master admin key at any time.
  - **Broadcast Announcements:** Post dynamic notice banners (exam alerts, timetable updates) visible on the student dashboard.

- ✨ **Interactive Visuals & Responsiveness**
  - Floating logo elements with real-time mouse parallax effect.
  - Mobile-first, fully responsive design adhering to modern UI/UX principles.

---

## 💻 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Build Tool & Bundler**| [Vite](https://vitejs.dev/) |
| **Iconography** | [Lucide React](https://lucide.dev/) |
| **Animations** | Motion / Hardware-accelerated CSS3 & RAF Canvas Logic |
| **Storage & Overrides** | Browser LocalStorage & SessionStorage State Engine |

---

## 📊 Curriculum Structure

```text
NTechBay-Library
├── B.Tech (8 Semesters)
│   ├── Sem 1 & 2 (Common Engineering Foundation)
│   └── Sem 3 to 8 (CIVIL, CS, IT, ME, EC, EE, EX)
├── Polytechnic (6 Semesters)
│   ├── Sem 1 & 2 (Common Polytechnic Foundation)
│   └── Sem 3 to 6 (CIVIL, CS, ME, EC, EE)
├── MBA (4 Semesters - General Management)
└── M.Tech (4 Semesters - Advanced Post-Graduate Engineering)
```

---

## ⚙️ Admin Control Center

The application includes an internal Admin Portal triggered via the **Admin** button (located on the top navigation bar and footers):
1. **Master Login:** Securely prompts for administrator credentials.
2. **Modify Links Tab:** Allows selecting any course, semester, and branch to edit or test destination Google Drive URLs with immediate effect.
3. **Password Controls Tab:** Allows changing the student entrance access key or the admin master password.
4. **Broadcast Notice Tab:** Enables/disables library announcement banners.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/ntechbay-library.git
   cd ntechbay-library
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for Production:**
   ```bash
   npm run build
   ```
   The production-ready artifacts will be generated in the `dist/` directory.

---

## 📁 Project Structure

```text
├── index.html                   # Application entry point
├── src/
│   ├── components/
│   │   ├── AdminPanelModal.tsx  # Master administrative console & link manager
│   │   ├── ContactModal.tsx     # Creator profile & direct contact modal
│   │   ├── CourseSelector.tsx   # Top program pill tabs (B.Tech, Poly, MBA, M.Tech)
│   │   ├── FilterSection.tsx    # Semester & branch selection engine
│   │   ├── Navbar.tsx           # Sticky top navigation bar with admin trigger
│   │   ├── PasswordGate.tsx     # Interactive student entrance security gate
│   │   ├── QuickDriveModal.tsx  # Direct folder search & launcher modal
│   │   ├── ResourceCard.tsx     # Interactive category card component
│   │   └── ResourceModal.tsx    # Modal displaying categorized items
│   ├── data/
│   │   ├── courseData.ts        # Comprehensive university curriculum link map
│   │   ├── linkStore.ts         # Persistent overrides & settings manager
│   │   └── mockResources.ts     # Metadata, branch definitions, and resource resolver
│   ├── utils/
│   │   └── codec.ts             # Base64 encode/decode URL utilities
│   ├── App.tsx                  # Root application controller
│   ├── main.tsx                 # React DOM mount point
│   └── types.ts                 # TypeScript types and data models
├── package.json                 # Project configuration and dependencies
└── vite.config.ts               # Vite configuration
```

---

## 👨‍💻 Creator & Contact

**Er. Nitish Khobragade (NK)**  
Creator & Administrator • NTechBay Platform

- **Email:** [djnitish97@gmail.com](mailto:djnitish97@gmail.com)
- **LinkedIn:** [linkedin.com/in/nitishkhobragade](https://in.linkedin.com/in/nitishkhobragade)
- **GitHub:** [github.com/nitishkhobragade](https://github.com/nitishkhobragade/)
- **Instagram:** [@nitish_khobragade](https://www.instagram.com/nitish_khobragade)
- **Portfolio:** [nitishkhobragade.github.io/portfolio.nitish](https://nitishkhobragade.github.io/portfolio.nitish/)
- **WhatsApp:** [Chat on WhatsApp](https://wa.me/918982324497?text=Hello%20Admin%20Nitish%20Sir%2C%20I%20have%20contacted%20you%20from%20RGPV%20E%20Library%20Website%20Online)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
