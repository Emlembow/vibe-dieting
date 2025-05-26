# 🌟 Vibe Dieting - AI-Powered Nutrition Tracking

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-vibedieting.xyz-brightgreen?style=for-the-badge)](https://www.vibedieting.xyz)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Emlembow/vibe-dieting)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

A modern nutrition tracking app that uses AI to analyze your food through text or images. No barcode scanning, no database diving – just snap a pic or describe what you ate!

**[✨ Try it live at vibedieting.xyz](https://www.vibedieting.xyz)**

</div>

![Vibe Dieting Screenshot](screenshot.png)

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 📸 **AI Image Analysis** | Upload photos of your meals for instant nutrition breakdown |
| 💬 **Text Recognition** | Simply describe what you ate in natural language |
| 📊 **Macro Tracking** | Track calories, protein, carbs, and fats with precision |
| 🎯 **Goal Management** | Set and monitor daily nutrition targets |
| 📈 **Progress Analytics** | Visualize trends and patterns over time |
| 🌙 **Modern Interface** | Clean, responsive design built with shadcn/ui |

## 🛠️ Tech Stack

```
Frontend:  Next.js 15 + React + TypeScript + Tailwind CSS
Backend:   Next.js API Routes + Supabase Database
AI:        OpenAI Assistant API (GPT-4.1 Nano)
UI:        shadcn/ui Components
Auth:      Supabase Authentication
Deploy:    Vercel + Automated Database Setup
```

## 🚀 One-Click Deploy

Deploy instantly to Vercel with automated database setup:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Emlembow/vibe-dieting)

### Post-Deploy Setup
1. Create a [Supabase project](https://app.supabase.com) and add credentials to Vercel environment variables
2. Run `npm run db:push` to set up database schema
3. Create OpenAI Assistant using provided configuration files

---

## 🏗️ Local Development

### Prerequisites

- Node.js 18+ with npm/pnpm/yarn
- [Supabase account](https://supabase.com) (free tier available)
- [OpenAI API key](https://platform.openai.com) with GPT-4.1 Nano access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Emlembow/vibe-dieting.git
   cd vibe-dieting
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or pnpm install / yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # OpenAI
   OPENAI_API_KEY=sk-proj-your-api-key
   OPENAI_ASSISTANT_ID=asst_your-assistant-id
   ```

### Database Setup (Automated)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize and migrate**
   ```bash
   npm run db:init
   npm run db:link --project-ref YOUR_PROJECT_REF
   npm run db:push
   ```

> 🎉 **Automated migrations** handle all table creation and security policies!

<details>
<summary>📋 Manual Database Setup (Alternative)</summary>

If you prefer manual setup, run the SQL from `supabase/migrations/` in your Supabase SQL editor:
- `20240101000000_initial_schema.sql` - Tables and structure
- `20240101000001_rls_policies.sql` - Row Level Security policies

</details>

### OpenAI Assistant Configuration

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Create a new assistant:
   - **Model**: GPT-4.1 Nano (required for image analysis)
   - **Temperature**: 0.3
3. **Configure JSON Schema Response Format**:
   - Enable "Response format" → Select `json_schema`
   - Copy contents from `openai-assistant-schema.json` into schema field
4. **Set Instructions**:
   - Copy from `openai-assistant-prompt.md` into Instructions field
5. Save and add the assistant ID to `.env.local`

> ⚠️ **Critical**: JSON schema configuration is required for proper response parsing

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking!

## 📱 Usage Guide

1. **Account Setup**: Register or use test credentials (`test@example.com` / `password123`)
2. **Set Goals**: Configure daily calorie and macro targets
3. **Track Food**: 
   - Upload meal photos for AI analysis
   - Or describe food in natural language
4. **Monitor Progress**: View dashboard and trends analytics

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database Management
npm run db:init         # Initialize Supabase
npm run db:link         # Link to Supabase project
npm run db:push         # Apply migrations
npm run db:reset        # Reset database

# Code Quality
npm run lint            # ESLint
npm run type-check      # TypeScript check
```

## 🧪 Quick Testing

Visit `/api/create-test-user` to generate test data:
- Email: `test@example.com`
- Password: `password123`

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [OpenAI](https://openai.com) - Powerful AI capabilities  
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Deployment platform

## 📞 Support

- 🐛 **Bug reports**: [Open an issue](https://github.com/Emlembow/vibe-dieting/issues)
- 💡 **Feature requests**: [Create a discussion](https://github.com/Emlembow/vibe-dieting/discussions)
- 📧 **Questions**: Check existing issues or create a new one

---

<div align="center">

**Built as a portfolio project showcasing modern web development practices**

Made with 💜 and clean code

</div>