# CareerBeam AI — Your AI-Powered Career Accelerator

[![Live Application](https://img.shields.io/badge/Live_App-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://career-beam-ai.vercel.app/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **CareerBeam AI** is an intelligent, end-to-end career acceleration platform that empowers job seekers through Artificial Intelligence. Rather than offering a single resume-checking tool, CareerBeam AI brings every essential stage of the job application journey into one seamless platform. Users can analyze resumes, measure ATS compatibility, identify skill gaps, generate personalized cover letters, follow AI-generated learning roadmaps, practice mock interviews, and receive comprehensive career reports—all powered by intelligent, context-aware AI assistance. Built with modern web technologies and AI integration, CareerBeam AI helps candidates prepare smarter, improve faster, and approach every job opportunity with confidence.

🔗 **Live Production URL**: [https://career-beam-ai.vercel.app/](https://career-beam-ai.vercel.app/)

---

## 📌 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Target Users](#-target-users)
- [Application Architecture & Workflow](#-application-architecture--workflow)
- [Complete Implemented Features](#-complete-implemented-features)
- [AI Feature & System Prompts](#-ai-feature--system-prompts)
- [UI Screenshots](#-ui-screenshots)
- [Tech Stack & Tools](#-tech-stack--tools)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables](#-environment-variables)
- [Project Directory Structure](#-project-directory-structure)
- [Technical Challenges & Solutions](#-technical-challenges--solutions)
- [Key Learning Outcomes](#-key-learning-outcomes)
- [Future Improvements](#-future-improvements)
- [Author & License](#-author--license)

---

## 💡 Overview & Problem Statement

### The Real-World Problem
Modern hiring relies heavily on automated **Applicant Tracking Systems (ATS)** that filter out over **75% of qualified applicants** before a human recruiter ever sees their application. Candidates struggle with:
1. **Opaque ATS Filters**: Inability to know how well their resume matches specific job keywords.
2. **Generic Applications**: Sending out non-tailored resumes and cover letters that fail to highlight job-relevant achievements.
3. **Skill Blindspots**: Difficulty identifying exact technical or soft skill gaps required for a dream role.
4. **Interview Unpreparedness**: Lack of personalized, role-specific interview coaching and feedback.

### The Solution: CareerBeam AI
CareerBeam AI acts as a personal AI career strategist. By ingesting a candidate's resume PDF and a target job description, it leverages Google Gemini AI to analyze application competitiveness, optimize terminology for ATS algorithms, map out step-by-step learning roadmaps, generate customized cover letters, and evaluate mock interview performance in real time.

---

## 🎯 Target Users

| User Persona | Key Benefits & Use Case |
| :--- | :--- |
| 🎓 **Recent Graduates & Entry-Level** | Identify missing industry skills, optimize first resumes for ATS, and practice foundational technical interview questions. |
| 🔄 **Career Switchers** | Translate transferable skills into role-aligned keywords for new industries and generate tailored narrative cover letters. |
| 💼 **Experienced Professionals** | Executive-level match scoring, deep competitive gap analysis, and tailored high-impact application materials. |

---

## 🔄 Application Architecture & Workflow

CareerBeam AI follows a modern client-centric architecture powered by Supabase for authentication, storage, and data management, while Google Gemini 2.5 Flash enables intelligent resume analysis, ATS matching, interview coaching, cover letter generation, and personalized career recommendations.

```mermaid
flowchart TD
    A[User Logged In] --> B[Upload Resume PDF]
    B --> C[Supabase Storage Engine]
    C --> D[PDF.js In-Browser Text Extractor]
    D --> E[Extracted Text in App Context]
    
    F[User Inputs Job Description] --> G[Job Context Store]
    
    E & G --> H[Google Gemini 2.5 Flash Engine]
    
    H --> |Structured Schema| I[Resume Analysis]
    H --> |Structured Schema| J[ATS Compatibility Score]
    H --> |Structured Schema| K[Skill Gap & Learning Roadmap]
    H --> |Structured Schema| L[Tailored Cover Letter]
    H --> |Structured Schema| M[Mock Interview Coach]
    H --> |Structured Schema| N[Executive Summary & Report]
    
    I & J & K & L & M & N --> O[(Supabase Database & History Log)]
```

---

## ✨ Complete Implemented Features

### 1. 🔐 Authentication & Session Management
- **Supabase Authentication**: Secure Email/Password registration, login, session persistence, and password resets.
- **Protected Layout**: Route-level protection enforcing active user session across all career modules.

### 2. 📄 PDF Text Extraction & Resume Management
- **Client-Side PDF Shredding**: Uses `pdfjs-dist` to parse ArrayBuffers directly from Supabase Storage without relying on heavy backend server dependencies.
- **Resume Multi-Version Context**: Stores active resume state across application modules.

### 3. 💼 Job Description Targeting Engine
- Stores targeted job descriptions dynamically linked with the candidate's active profile and resume.

### 4. 🧠 AI Resume Analysis (Strengths & Weaknesses)
- Evaluates raw resume text against target job descriptions to extract high-impact strengths and specific weaknesses.

### 5. 🎯 ATS Compatibility Score & Keyword Analyzer
- Calculates an aggregate ATS match score percentage (0–100%).
- Extracts exact matching keywords present in both resume and job requirements.
- Identifies critical missing keywords to optimize resume visibility for ATS algorithms.

### 6. 🗺️ Skill Gap Analysis & Practical Action Roadmap
- Contrasts resume candidate profile against target job role requirements.
- Identifies missing technical and soft skills.
- Generates a 3-step practical roadmap featuring learning phases, tasks, portfolio project ideas, estimated completion times, and impact levels.

### 7. ✉️ Personalized AI Cover Letter Generator
- Crafts tailored, modern SaaS-tier cover letters leveraging quantifiable resume achievements under 350 words.
- Enforces custom user personalization directives on demand.

### 8. 🎙️ Interactive Mock Interview Coach & Evaluation
- Generates 10 targeted interview questions (Technical, STAR Behavioral, System Architecture, Team Collaboration).
- Evaluates candidate responses using the STAR method, rating clarity and relevance on a scale of 0 to 100 with actionable feedback.

### 9. 🏆 Executive Summary & Holistic Match Report
- Computes an aggregate competitive heuristic score displayed in a high-contrast circular score gauge.
- Generates a downloadable executive report.

### 10. ⚡ 3-Tier Subscription & Limit Manager
- **Free Plan**: Up to **2 Resumes** ($0/mo)
- **Pro Plan**: Up to **5 Resumes** ($9.99/mo)
- **Premium Plan**: Up to **10 Resumes** ($19.99/mo)
- Dynamic sidebar usage progress indicator and transparent tier management page (`/pricing`).

### 11. 📜 Activity History Audit Log
- Persists all past resume scans, ATS matches, cover letters, and reports in a queryable history stream.

---

## 🤖 AI Feature & System Prompts

> **CareerBeam AI uses carefully designed AI prompts to power its intelligent features. Each feature is guided by task-specific instructions to deliver accurate, relevant, and context-aware responses throughout the job application process.**

| AI Feature | AI Purpose & Instruction Prompt |
| :--- | :--- |
| **1. Resume Analysis** | `"Analyze this resume against the target job description. Extract core strengths and distinct weaknesses/areas to improve."` |
| **2. ATS Matcher** | `"Act as a strict Applicant Tracking System (ATS). Compare resume terminology to job requirements. Calculate integer score out of 100, matching keywords, and missing required keywords."` |
| **3. Skill Gap & Roadmap** | `"Contrast resume against job requirements. Identify missing hard technical and soft skills. Fabricate a 3-step practical learning roadmap with phase, task, project_idea, estimated_time, and impact_level."` |
| **4. Cover Letter Generator** | `"Write a compelling, professional cover letter targeted towards this exact position leveraging experience in the resume. Human, punchy, under 350 words with quantifiable achievements."` |
| **5. Interview Questions & Evaluation** | `"You are a strict technical hiring manager. Generate 10 relevant interview questions (4 technical, 3 behavioral STAR, 2 system architecture, 1 team leadership). Evaluate candidate answers 0-100 with feedback."` |
| **6. Executive Summary Report** | `"Provide a conclusive executive summary (3-4 sentences) dictating whether candidate is highly competitive, moderately aligned, or under-qualified. Include holistic match score out of 100."` |

---

## 📸 UI Screenshots

### 1. Landing Page
<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/57aa5f27-22fd-406a-968a-3fe34e9f13a9" />

**Hero section highlighting CareerBeam AI's core capabilities, features showcase, and value proposition.**

### 2. Authentication (Login / Signup)
<img width="1918" height="871" alt="image" src="https://github.com/user-attachments/assets/cd0c1756-4d63-4988-b02c-cf1929cedb52" />
<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/54404427-7338-4e38-9a79-2b02eecef78c" />
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/eeff1254-5d60-4f41-bb0f-9ad31f717f1d" />

**Secure email and password authentication powered by Supabase Auth.**

### 3. Dashboard
<img width="1917" height="874" alt="image" src="https://github.com/user-attachments/assets/30101f8e-3221-4122-b1b2-6c905153304e" />

**Overview of active resume, target job description, recent activity stream, and quick module actions.**

### 4. Resume Upload and Job Description
<img width="1918" height="869" alt="image" src="https://github.com/user-attachments/assets/aa0fd14e-e87f-4fbd-914f-34f4d457b440" />
<img width="1917" height="875" alt="image" src="https://github.com/user-attachments/assets/55bf8cb4-7a7a-4690-9f88-4e1893155116" />

**Drag-and-drop PDF resume upload with in-browser text extraction and job description saving.**

### 5. Resume Analysis
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/13dfd39c-3a63-423d-af7a-3ae942ca3782" />

**AI-driven structural analysis breaking down resume strengths and weaknesses.**

### 6. ATS Compatibility Matching
<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/6936f91a-a0a0-41a0-a652-ce057d89489f" />

**ATS compatibility gauge displaying percentage score, matching keywords, and missing keywords.**

### 7. Skill Gap & Learning Roadmap
<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/11e8d096-756b-4101-9c2d-4a9511bdbd2d" />
<img width="1660" height="875" alt="image" src="https://github.com/user-attachments/assets/357c1252-bf18-47bc-8be3-a83a3897bfb6" />

**Intelligent AI skill gap detection that compares your resume against target job requirements and generates a personalized learning roadmap with actionable recommendations to strengthen your profile.**

### 8. Cover Letter Generator
<img width="1917" height="876" alt="image" src="https://github.com/user-attachments/assets/cc42d870-de6f-47b2-bd71-cf288b7459f5" />
<img width="1656" height="865" alt="image" src="https://github.com/user-attachments/assets/ec0671d8-2a56-4cc7-9f54-5d7b2e528c0a" />


**Custom cover letter generator with multi-tone selection, instant preview, and export controls.**

### 9. AI Interview Coach
<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/e07e6a62-edf5-4d2e-b3a9-75fbed8eecf1" />
<img width="1919" height="878" alt="image" src="https://github.com/user-attachments/assets/dd1357e9-019b-4324-90db-5a856e95672f" />

**Interactive AI interview coach featuring personalized questions, instant evaluation, confidence scoring, and tailored feedback to maximize interview success.**

### 10. Executive Summary Report
<img width="1919" height="870" alt="image" src="https://github.com/user-attachments/assets/93aefc2a-1c62-4fe6-86c1-60b57e22789b" />

**Holistic match score gauge and executive summary report.**

---

## 🛠️ Tech Stack & Tools

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + Vite 6** | Single Page Application with fast HMR and optimized production bundling. |
| **Styling & Icons** | **Tailwind CSS 4 + Lucide React** | Responsive design system supporting dark/light theme modes and glassmorphism UI. |
| **Routing & State** | **React Router DOM 7 + Context API** | SPA routing with global `AppContext` for active resume/job state management. |
| **Backend & Auth** | **Supabase (PostgreSQL + Auth)** | User authentication, row-level security, and activity logging database. |
| **Cloud Storage** | **Supabase Storage** | Secure storage bucket for resume PDF files. |
| **AI / Machine Learning** | **Google Gemini 2.5 Flash** | Advanced GenAI SDK (`@google/genai`) for structured analysis & content generation. |
| **Document Shredder** | **PDF.js (`pdfjs-dist`)** | Browser-native PDF text extraction from ArrayBuffer payloads. |
| **Hosting & Deployment** | **Vercel** | Automated CI/CD production deployment linked with GitHub `main` branch. |

---

## 💻 Installation & Local Setup

Follow these steps to run CareerBeam AI locally on your computer:

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Git**

### Step-by-Step Guide

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/unsa-memon/careerbeam-ai.git
   cd careerbeam-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (see format below).

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root directory with the following structure:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=your-google-gemini-api-key-here
```

> ⚠️ **Security Warning**: Never commit your actual API keys or secrets to public repositories. `.env.local` is listed in `.gitignore`.

---

## 📂 Project Directory Structure

```text
careerbeam-ai/
├── public/                     # Static assets (favicon, logos)
├── src/
│   ├── components/             # Reusable UI components & layouts
│   │   ├── ui/                 # UI primitives (Button, Card, Badge, Progress)
│   │   ├── Layout.jsx          # Protected route master layout
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   │   └── Sidebar.jsx         # Sidebar navigation & tier usage widget
│   ├── context/                # Global React Context providers
│   │   ├── AppContext.jsx      # Resume, job, and subscription state
│   │   └── AuthContext.jsx     # Supabase auth session provider
│   ├── lib/                    # API clients and helpers
│   │   ├── gemini.js           # Google Gemini AI integration & PDF shredder
│   │   ├── supabase.js         # Supabase client initialization
│   │   └── utils.js            # Tailwind merge & utility functions
│   ├── pages/                  # Application page components
│   │   ├── AtsScore.jsx        # ATS match score page
│   │   ├── CheckEmail.jsx      # Auth confirmation page
│   │   ├── CoverLetter.jsx     # Cover letter generator page
│   │   ├── Dashboard.jsx       # Main user portal dashboard
│   │   ├── FinalReport.jsx     # Executive summary report page
│   │   ├── ForgotPassword.jsx  # Password recovery page
│   │   ├── History.jsx         # Activity history log page
│   │   ├── InterviewCoach.jsx  # AI mock interview prep page
│   │   ├── JobDescription.jsx  # Target job description input page
│   │   ├── LandingPage.jsx     # Marketing landing page
│   │   ├── Login.jsx           # Sign-in page
│   │   ├── Pricing.jsx         # 3-tier subscription management page
│   │   ├── ResumeAnalysis.jsx  # Strengths & weaknesses analysis page
│   │   ├── ResumeUpload.jsx    # PDF resume upload page
│   │   ├── Signup.jsx          # Registration page
│   │   └── SkillGap.jsx        # Skill gap & career roadmap page
│   ├── App.jsx                 # App routing definition
│   ├── index.css               # Global CSS & Tailwind setup
│   └── main.jsx                # Application entry point
├── .env.local                  # Local environment variables (Git ignored)
├── .gitignore                  # Git exclusion rules
├── package.json                # NPM dependencies & scripts
├── README.md                   # Project documentation
├── vercel.json                 # Vercel deployment routing config
└── vite.config.js              # Vite bundler configuration
```

---

## ⚡ Technical Challenges & Solutions

### Challenge 1: Extracting Clean Text from PDF Files Client-Side
- **Issue**: Standard backend PDF parsing libraries require Node.js native bindings (like `fs`), which fail in client-side Vite builds.
- **Solution**: Implemented `pdfjs-dist` to download PDF blobs directly via the Supabase Storage SDK as ArrayBuffers, iterating over PDF page canvas text streams in pure client-side JavaScript.

### Challenge 2: Unreliable LLM JSON Responses
- **Issue**: Large Language Models sometimes return conversational filler text or malformed JSON, breaking front-end React components.
- **Solution**: Configured Google GenAI SDK `responseSchema` with strict OpenAPI TypeScript/JSON types (`Type.OBJECT`, `Type.ARRAY`), enforcing 100% deterministic JSON shapes directly from Gemini.

### Challenge 3: Gemini API 429 Quota Rate Limiting
- **Issue**: Concurrent requests or rapid module switching triggered 429 Rate Limit errors from Google Gemini API.
- **Solution**: Built a universal `generateSafeContent` wrapper with Exponential Backoff Retries. Used regex to extract Google's exact `retry in X.Xs` header delay, automatically holding requests until the rate limiter cleared.

### Challenge 4: Sidebar Layout Overflow & Cut-Off UI
- **Issue**: Outer sidebar containers with `overflow-y-auto` pushed the subscription card and Logout buttons off-screen on smaller displays.
- **Solution**: Re-architected the layout to keep the sidebar header and footer fixed (`flex-shrink-0`), placing `overflow-y-auto` strictly on the middle navigation menu element.

---

## 🧠 Key Learning Outcomes

1. **Production-Grade Generative AI Integration**: Mastering structured response schemas, prompt engineering, and rate-limit handling using Google Gemini API.
2. **Full-Stack Serverless Architecture**: Building complete authentication, row-level security, and file storage workflows using Supabase.
3. **Advanced React Patterns**: Managing dynamic global state, persistent user context, and custom hooks across complex multi-page SPAs.
4. **Client-Side Binary File Processing**: Shredding PDF document streams directly in the browser via ArrayBuffers and PDF.js.
5. **Modern UI/UX Engineering**: Designing responsive interfaces with Tailwind CSS, custom scrollbars, dark/light themes, and glassmorphism.

---

## 🔮 Future Improvements

- [ ] **Voice-Driven Mock Interviews**: Integrate WebRTC and Web Speech API for real-time vocal mock interview practice.
- [ ] **Automated LinkedIn Profile Optimizer**: Extend Gemini analysis to optimize LinkedIn headlines, summaries, and experience sections.
- [ ] **Live Job Board Integration**: Fetch live job postings directly from API providers (LinkedIn, Indeed) to auto-populate job descriptions.

---

## 👥 Author & License

**Author**: Unsa Memon  
**Live Project**: [https://career-beam-ai.vercel.app/](https://career-beam-ai.vercel.app/)  
**GitHub Repository**: [https://github.com/unsa-memon/careerbeam-ai](https://github.com/unsa-memon/careerbeam-ai)

### License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p center align="center">
  Made with ❤️ by <strong>Unsa Memon</strong>.
</p>
