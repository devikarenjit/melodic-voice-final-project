# Melodic Voice

Melodic Voice is an AI-enhanced speech-practice web application designed to make speaking practice playful and encouraging for children. The MVP combines personalized speech activities with stories, progress tracking, XP, streaks, and lightweight gamification.

## Live application

**Vercel:** https://melodic-voice-final-project.vercel.app/

The application includes onboarding, a personalized dashboard, speech assessment/practice, AI stories, AI songs, progress tracking, and navigation between activities.

## What the MVP does

- Collects a child's basic profile and learning preferences during onboarding.
- Uses the child's speech target and preferences to personalize activities.
- Provides a gentle speech check-in/practice experience rather than a clinical diagnosis.
- Tracks XP, goals, and streak progress in browser-side state/local storage.
- Generates personalized AI story sets around the child's speech target when the AI service is available.
- Extracts a dedicated practice-word list from the generated story activity.
- Includes AI songs as a secondary, playful activity.
- Provides parent-facing information where appropriate without clinical claims.
- Uses responsive layouts and accessible controls throughout the main experience.

## Tech stack

- **React 19** — UI and application components
- **Vite** — development server and production build
- **React Router** — client-side navigation
- **Lucide React** — interface icons
- **Express** — backend service for AI requests
- **CORS** — frontend/backend communication during local development
- **dotenv** — local environment-variable loading
- **Google Gemini** — LLM used for personalized AI story generation

## Setup & run

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

Vite will print the local development URL, normally `http://localhost:5173`.

### Start the AI server locally

Open a **second terminal** in the project folder and run:

```bash
node server/index.js
```

The Express AI server runs on `http://localhost:3001`.

Create a `.env` file in the project root for local AI generation:

```env
GEMINI_API_KEY=your_key_here
```

**Never commit `.env` or an API key to GitHub.**

### Production build

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Architecture overview

```text
melodic-voice-final-project/
├── src/
│   ├── assets/              # Images and frontend assets
│   ├── components/          # Reusable UI components
│   ├── context/             # Shared onboarding and progress state
│   ├── pages/               # Main application pages
│   │   ├── Dashboard.jsx
│   │   ├── SpeechAssessment.jsx
│   │   ├── AIStories.jsx
│   │   ├── AISongs.jsx
│   │   ├── AIChat.jsx
│   │   ├── Continue.jsx
│   │   └── Settings.jsx
│   └── ...                  # Application entry/routing files
├── server/
│   ├── index.js             # Express /chat endpoint
│   └── config.js            # Gemini model and system prompt
├── public/                  # Static files
├── package.json             # Dependencies and npm scripts
└── README.md                # Project documentation
```

### Frontend

The React frontend contains the child and parent user experience. Pages represent complete activities, while reusable components handle navigation, progress, goals, feature cards, and other common UI elements.

### Shared state

The context layer keeps onboarding information and progress available across pages so the dashboard and learning activities use the same child profile and progress data.

### Routing

React Router maps the main journeys to routes including `/dashboard`, `/speech-assessment`, `/ai-stories`, `/ai-songs`, `/chat`, `/continue`, and `/settings`.

### AI backend

The Express server exposes a `/chat` endpoint. The frontend sends activity context to the server, and the server forwards the request to Gemini. The API key stays server-side rather than being placed directly in frontend code.

## AI integration

### How the LLM fits

AI is used for the part of the product that benefits most from personalization: creating speech-practice stories for an individual child.

The frontend sends:

- Child's first name
- Speech target / difficult sound, letter, or word pattern
- Preferred story theme
- Preferred language

The server combines this request with the Melodic Voice system prompt and sends it to the Gemini model.

### Prompt design

The system prompt establishes Melodic Voice as an age-appropriate speech-practice coach and instructs the model to:

1. Use the child's actual speech target rather than an unrelated default.
2. Generate **8 practice words** related to that target.
3. Use the same target and practice words across **3 genuinely different stories**.
4. Keep vocabulary simple, familiar, encouraging, and age-appropriate.
5. Repeat target words naturally without turning the story into a clinical exercise.
6. Avoid diagnosis and clinical language in children's story content.
7. Return structured JSON when JSON output is requested.

The frontend validates the returned structure and extracts the practice words separately from the stories. If the AI service is unavailable or returns unusable data, a local fallback story/practice-word experience keeps the page usable.

### Why an LLM?

A fixed story library would become repetitive and would not adapt well to different speech targets and interests. An LLM allows the application to create different story contexts around a child's current target while keeping the experience playful.

## Progress & gamification

The MVP uses lightweight gamification:

- **XP** rewards supported learning interactions.
- **Daily goals** show activity progress.
- **Streaks** encourage returning on consecutive days.
- **Levels** provide a simple sense of progression as XP increases.

More complex character unlocking, long-form story progression, and large reward systems are intentionally future enhancements rather than core MVP requirements.

## Accessibility & performance

The deployed application was audited using Chrome Lighthouse. The recorded audit achieved:

- **Performance: 100/100**
- **Accessibility: 98/100**
- **Best Practices: 100/100**
- **SEO: 82/100**

The interface emphasizes readable text, clear hierarchy, responsive layouts, accessible controls, and useful fallback/error states.

## Known limitations

1. **AI backend deployment:** The current AI story service is a separate Express server and the frontend currently requests the local development endpoint. A production-grade implementation should expose the backend through a secure production API URL and configure the Gemini key as a server-side environment variable.
2. **AI availability:** AI generation depends on the configured Gemini service and network availability. A fallback experience is provided when generation fails.
3. **Speech recognition:** Browser speech recognition is an approximate practice aid and is not a clinical speech-language assessment or diagnosis.
4. **Progress persistence:** MVP progress is stored in browser-side state/local storage rather than a full account/database system. Clearing browser storage can reset progress.
5. **Personalization:** The MVP focuses on speech-target and preference-based personalization and does not provide clinical treatment recommendations.
6. **AI songs:** Songs are a secondary MVP feature and are intentionally less central than the speech-practice and story experience.
7. **Testing:** The project can be expanded with a larger automated unit and end-to-end test suite.

## Future improvements

- Deploy the Express AI service as a secure production backend and connect it to the Vercel frontend through an environment variable.
- Add authenticated child/parent accounts with database-backed progress history.
- Improve speech-recognition feedback with carefully designed, non-clinical practice metrics.
- Expand story generation with richer age, theme, and language personalization.
- Add stronger automated unit and end-to-end testing around the critical learning flow.
- Continue WCAG-focused testing with keyboard navigation, screen readers, axe, and Lighthouse across every major route.
- Expand gamification with additional characters, story chapters, rewards, and unlockable content after the core learning experience is stable.
- Improve AI song generation so songs have meaningful lyrics and audio rather than functioning primarily as a secondary experiment.

## Project purpose

Melodic Voice was created around the idea that **everyone deserves to be understood**. The MVP explores how AI can make repeated speech practice more engaging by turning a child's current practice target into personalized stories and activities.

## License

This project was created as a capstone project and is intended primarily as a portfolio demonstration.
