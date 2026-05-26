# Gradus 

> **Step into your potential.** — Your AI-powered skill development platform.

Gradus is a full-stack web application that helps students and professionals grow their careers through personalized roadmaps, resume analysis, skill gap detection, and an AI doubt solver.

---

##  Features

- **Personalized Roadmaps** — AI-generated learning paths tailored to your target role and current skill set
- **Resume Analyzer** — Get ATS scores, strengths, weaknesses, and keyword suggestions for your resume
- **skill Gap Analyzer** — Identify what skills you're missing for your dream role and how to close the gap
- **Doubt Solver AI** — Chat with an AI mentor to get answers to any learning or career question
- **XP & Achievements** — Earn XP as you complete roadmap nodes and unlock achievements
- **User Profiles** — Track your progress, streaks, and skill growth over time

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **Auth** | NextAuth.js |
| **AI** | Google Gemini API |
| **Deployment** | Vercel |

---

##  Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gradus.git
cd gradus

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="your-postgresql-connection-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Usage Examples

### Generate a Roadmap
1. Log in and go to **Dashboard → Roadmaps**
2. Click **Generate New Roadmap**
3. Enter your target role (e.g. "Full Stack Developer") and current skills
4. Gradus generates a step-by-step learning path with XP rewards

### Analyze Your Resume
1. Go to **Resume Analyzer**
2. Upload your resume (PDF)
3. Get an instant ATS score, keyword gaps, strengths, and project suggestions

### Find Your Skill Gaps
1. Go to **Skill Gap Analyzer**
2. Enter your target role and experience level
3. See exactly which skills you're missing and how to learn them

### Ask the Doubt Solver
1. Go to **Doubt Solver**
2. Start a new conversation
3. Ask anything — concepts, career advice, code help — and get AI-powered answers

---

##  Project Structure

```
gradus/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── roadmap/         # Roadmap pages
│   │   ├── resume-analyzer/ # Resume analyzer page
│   │   ├── skill-gap/       # Skill gap analyzer page
│   │   └── doubt-solver/    # Doubt solver AI page
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utilities and helpers
└── public/                  # Static assets
```

---

##  Deployment

Gradus is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push your code to GitHub
2. Import the repo in Vercel
3. Add environment variables in **Vercel → Settings → Environment Variables**
4. Deploy!

---

##  Contributing

Contributions are welcome! Here's how to get started:

### Steps to Contribute

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/gradus.git
cd gradus

# 3. Create a new branch for your feature or fix
git checkout -b feat/your-feature-name

# 4. Make your changes, then stage and commit
git add .
git commit -m "feat: describe your change"

# 5. Push your branch
git push origin feat/your-feature-name

# 6. Open a Pull Request on GitHub
```

### Branch Naming Convention
| Type | Format | Example |
|---|---|---|
| Feature | `feat/name` | `feat/dark-mode` |
| Bug fix | `fix/name` | `fix/resume-upload` |
| Docs | `docs/name` | `docs/update-readme` |

### Commit Message Format
Follow conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code cleanup

### Reporting Bugs
Open an [issue on GitHub](https://github.com/your-username/gradus/issues) with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
---

##  License
MIT License — feel free to use and modify.

---

