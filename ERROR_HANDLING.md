# Melodic Voice — Error Handling & Safe Failure

## AI Story Generation

Melodic Voice depends on an AI service for personalized story generation.

If the AI service is unavailable, fails, or returns unusable data:

1. The application detects the failure.
2. The user is shown a friendly fallback experience.
3. Local fallback stories/practice words keep the activity usable.
4. The application does not expose the Gemini API key to the frontend.
5. The user can continue using the application instead of receiving a blank page.

## User-facing principle

The application should fail gracefully rather than leaving the child with a broken or empty experience.

## Known limitation

The current MVP's AI story service is a separate Express server and the frontend currently requests the local development endpoint. A production-grade implementation would expose the backend through a secure production API URL and keep the Gemini key as a server-side environment variable.