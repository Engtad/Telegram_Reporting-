# Telegram_Reporting-
Upload for on Filed reporting , using telegram bot 

```
field-report-bot/
├── package.json                          # PROJECT DEPENDENCIES
├── vercel.json                           # VERCEL DEPLOYMENT CONFIG
├── .env.example                          # ENVIRONMENT VARIABLES TEMPLATE
├── src/
│   ├── types/
│   │   └── index.ts                      # TYPESCRIPT INTERFACES
│   ├── utils/
│   │   ├── supabase.ts                   # SUPABASE CLIENT
│   │   ├── groq.ts                       # GROQ AI CLIENT
│   │   ├── memory.ts                     # PATTERN MEMORY SYSTEM
│   │   ├── rateLimit.ts                  # DAILY LIMITS
│   │   └── unitConversion.ts             # UNIT CONVERSIONS
│   └── agents/
│       ├── dataCleanerAgent.ts           # TEXT CLEANING
│       ├── photoOrganizerAgent.ts        # PHOTO CATEGORIZATION
│       └── reportGeneratorAgent.ts       # PDF GENERATION
├── api/
│   └── telegram-webhook.ts               # MAIN BOT HANDLER
└── supabase/
    ├── schema.sql                        # DATABASE SCHEMA
    └── policies.sql                      # ROW LEVEL SECURITY POLICIES
```
Notes + Photos → Word DOCX (with AI cleaning) → Convert to PDF  ( this is not working , dont try it again )
___
🚀 NEW WORKFLOW: Word + HTML-to-PDF
---
# 1. Create project
mkdir field-report-bot && cd field-report-bot

# 2. Create folder structure
mkdir -p src/types src/utils src/agents api supabase

# 3. Copy each file to correct location (see file paths above)

# 4. Create .env file
cp .env.example .env
# Edit .env with your API keys

# 5. Install dependencies
npm install

# 6. Set up Supabase database
# Copy schema.sql content into Supabase SQL Editor and run
# Copy policies.sql content into Supabase SQL Editor and run

# 7. Test locally
npm run dev

# 8. Deploy to Vercel
npm run deploy
