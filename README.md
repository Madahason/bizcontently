# BizContently

AI-Powered Content Creation & Distribution Platform

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
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up Firebase:

   - Create a new project in the [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google Sign-in)
   - Create a web app in your Firebase project
   - Copy the Firebase configuration from your project settings
   - Create a `.env.local` file in the root directory with the following variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration

Required for authentication and database functionality:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

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
