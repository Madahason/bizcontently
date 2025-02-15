# New Bizcontently

A modern full-stack application that leverages AI capabilities to enhance business content creation and management.

## Features

- 🤖 AI-Powered Content Generation
- 🔒 Secure Authentication
- 💾 Cloud Storage
- 🔄 Real-time Database
- 🎨 Modern UI with Tailwind CSS
- 🚀 Fast and SEO-friendly with Next.js

## Tech Stack

### Frontend

- Next.js 14 with App Router
- React 18
- TailwindCSS for styling
- TypeScript for type safety

### Backend & Services

- Firebase Authentication
- Firebase Cloud Storage
- Firebase Realtime Database
- Vercel AI SDK for AI integrations

### AI Services

- OpenAI for text generation
- Anthropic for chat interactions
- Replicate for image generation
- Deepgram for audio transcription

## Getting Started

1. Clone the repository

```bash
git clone <your-repo-url>
cd new-bizcontently
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_KEY=
DEEPGRAM_API_KEY=
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request
