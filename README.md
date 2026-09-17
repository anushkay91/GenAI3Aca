# ReflectJournal

A private, secure, AI-assisted personal reflection and journaling application built with React, Vite, Express, Google Cloud Firestore, and Google Cloud Gemini AI.

---

## 1. Product Overview & Purpose

ReflectJournal solves one clear problem:
> **Give a user a private place to write personal reflections and receive supportive AI perspectives with simple mood tracking, while keeping identity and journal data strictly protected.**

### Core Pillars
- **Non-Clinical Supportive AI:** Offers gentle, empathetic reflections. It is explicitly **not** a therapist, psychologist, diagnostic tool, or medical service.
- **Privacy by Design:** Identity credentials (email, name, UID) are never forwarded to the Gemini AI model. Only the reflection text is analyzed.
- **Cryptographic Security:** The backend never trusts client-supplied user IDs. All requests require a verified Firebase ID token passed in the standard `Authorization: Bearer <token>` header.
- **Owner-Scoped Firestore Persistence:** Cloud Firestore rules enforce that users can only read, create, or delete documents within their own `/users/{userId}/entries` path.
- **Accessible & Responsive:** Meets WCAG 2.2 AA accessibility standards with semantic HTML landmarks, full keyboard operability, screen-reader table alternatives for charts, high-contrast typography, and responsive mobile navigation.

---

## 2. Technical Architecture

```
                                  +---------------------------------------+
                                  |         Browser Client (SPA)          |
                                  |  React 19 + Vite + Tailwind + Context |
                                  +-------------------+-------------------+
                                                      |
                                     (1) Google Sign-In & ID Token
                                                      v
                                        +----------------------------+
                                        |    Firebase Authentication |
                                        +----------------------------+
                                                      |
                       +------------------------------+-------------------------------+
                       | (2) Direct Encrypted Reads/Writes                            | (3) POST /api/chat with
                       | (Protected by firestore.rules)                               |     Authorization: Bearer <ID_TOKEN>
                       v                                                              v
      +----------------------------------+                            +-------------------------------+
      |      Cloud Firestore             |                            |      Express Backend API      |
      |  /users/{userId}/entries/{id}    |                            |  - Helmet Security Headers    |
      |  (Owner-only access rules)       |                            |  - Firebase Token Auth        |
      +----------------------------------+                            |  - Rate Limiting (30/15min)   |
                                                                      |  - Zod Request Validation     |
                                                                      +---------------+---------------+
                                                                                      |
                                                                                      | (4) Calls Model Ladder
                                                                                      |     (gemini-3.8-flash)
                                                                                      v
                                                                      +-------------------------------+
                                                                      |  Google Cloud Gemini AI SDK   |
                                                                      |  (@google/genai Type.OBJECT)  |
                                                                      +-------------------------------+
```

---

## 3. Security Architecture & Threat Defense

### Authentication Flow (Zero-Trust)
1. **Client Acquisition:** When signed in with Google via Firebase Auth, the frontend client obtains an ephemeral ID token (`user.getIdToken()`).
2. **Bearer Header:** Every call to `/api/chat` attaches `Authorization: Bearer <ID_TOKEN>`.
3. **Backend Cryptographic Verification:** `authenticateFirebaseUser` middleware uses Firebase Admin SDK to decode and cryptographically verify the token's signature, audience, and expiration.
4. **Authority Binding:** The verified UID is bound to `req.user.uid`. Any client-supplied `userId` in the body is discarded.
5. **No Token or Text Logging:** Sensitive tokens and private diary drafts are never printed to server logs.

### API Hardening
- **Rate Limiting:** Express rate limiter restricts `/api/chat` calls to 30 requests per 15-minute window per IP to prevent financial abuse and denial-of-service.
- **Request Size Ceilings:** Express payload parser limits body size to `1mb`.
- **Runtime Schema Validation:** Zod enforces strict string length constraints on drafts (1–4000 characters) and context history (max 10 items).
- **Prompt Injection Defense:** User entries are demarcated in clear boundary tags (`<<<USER_JOURNAL_CONTENT_START>>> ... <<<USER_JOURNAL_CONTENT_END>>>`) with explicit system instructions prohibiting command execution.

### Cloud Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Default deny
    }

    match /users/{userId}/entries/{entryId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;

      allow create, update: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 10000
        && (request.resource.data.aiResponse is string)
        && (!('score' in request.resource.data) || (request.resource.data.score is number && request.resource.data.score >= 1 && request.resource.data.score <= 100))
        && (!('mood' in request.resource.data) || (request.resource.data.mood is string && request.resource.data.mood.size() <= 100))
        && (!('category' in request.resource.data) || (request.resource.data.category is string && request.resource.data.category.size() <= 100));
    }
  }
}
```

---

## 4. API Endpoints

### `GET /api/health`
Returns system status.
- **Auth:** Public
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "ReflectJournal Backend API",
    "time": "2026-09-17T12:00:00.000Z"
  }
  ```

### `POST /api/chat`
Submits a reflection draft to receive supportive AI perspectives.
- **Auth:** `Authorization: Bearer <FIREBASE_ID_TOKEN>` (Required)
- **Request Body:**
  ```json
  {
    "prompt": "Felt accomplished completing the sprint today.",
    "history": [
      {
        "text": "Struggling with focus yesterday.",
        "aiResponse": "Be kind to yourself during high workloads.",
        "mood": "Overwhelmed",
        "score": 38,
        "category": "Work"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "response": "Celebrating milestones is essential. Acknowledge your hard work and let your mind unwind tonight.",
    "mood": "Accomplished",
    "score": 82,
    "category": "Work"
  }
  ```
- **Status Codes:**
  - `200 OK`: Valid reflection generated.
  - `400 Bad Request`: Payload validation error (empty prompt or prompt >4000 characters).
  - `401 Unauthorized`: Missing, expired, or invalid Firebase ID token.
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Sanitized error message without leaking stack traces or credentials.

---

## 5. Development & Quality Gate Commands

```bash
# Run development server with tsx and Vite middleware
npm run dev

# Run TypeScript typechecking without emitting
npm run typecheck

# Run full Vitest automated test suite (backend integration + frontend accessibility)
npm run test

# Run Vitest in interactive watch mode
npm run test:watch

# Run linter
npm run lint

# Production build (Vite SPA + esbuild Node server bundle)
npm run build

# Start production server
npm start
```

---

## 6. Continuous Integration (CI)

A GitHub Actions workflow is located at `.github/workflows/ci.yml`. On every push and pull request to `main`, the pipeline automatically executes:
1. `npm ci`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

---

## 7. Cloud Run Deployment

Deploy directly to Google Cloud Run from source:

```bash
gcloud run deploy reflectai \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,APP_URL=https://reflectai-705231995245.asia-southeast1.run.app \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 8. Disclaimer & Safety Notice

ReflectJournal is a self-reflection companion for mindful journaling. It is **not** a therapist, psychologist, healthcare professional, or crisis counselor. It does not provide medical advice or psychological diagnosis.

If you or someone you know is in severe distress or experiencing an emotional crisis:
- **US / Canada:** Call or text **988** for the free, confidential Suicide & Crisis Lifeline.
- **UK:** Call **111** (NHS) or **116 123** (Samaritans).
- **International:** Visit **findahelpline.com** for confidential support in your country.
