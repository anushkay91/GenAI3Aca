# ReflectJournal - Cloud Run Deployment & Configuration Guide

ReflectJournal is a secure, private AI-assisted reflection and journaling web application built with React, Vite, Express, Google Cloud Firestore, and Google Cloud Gemini AI.

---

## 1. Environment & Prerequisites

Ensure you have installed the required CLI tools and enabled the necessary Google Cloud services in your Google Cloud project (`genai3-506610`):

```bash
# Set your active GCP project
gcloud config set project genai3-506610

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Cloud Run Environment Variables Checklist

When configuring or updating your Cloud Run service (`reflectai`):

| Variable Name | Required Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **CRITICAL**: Ensures the compiled production server runs without launching Vite dev server. |
| `PORT` | `3000` | Container port (Cloud Run automatically routes traffic to this port). |
| `GEMINI_API_KEY` | *(from Secret Manager or environment variable)* | Required for server-side Gemini AI content generation. |
| `APP_URL` | `https://reflectai-705231995245.asia-southeast1.run.app` | Public application URL for callbacks and routing. |
| `SQL_DB_NAME` | **NOT NEEDED (DELETE THIS)** | This app uses **Cloud Firestore**, not SQL. Remove `SQL_DB_NAME` from your Cloud Run settings. |

> **Important note on "Container image URL"**: Never enter `scratch` as the Container image URL. In Google Cloud Run, container image URLs must point to a real container image (for example, deployed automatically from AI Studio or built via `gcloud run deploy --source .`).

---

## 3. Secret Management Setup (Zero-Hardcoding)

Store your Gemini API key in Google Cloud Secret Manager instead of hardcoding it in files or committing it to repositories.

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the Cloud Run runtime service account access to read the secret
# Replace 705231995245 with your GCP Project Number
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:705231995245-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Firestore Database & Security Rules

The application uses Google Cloud Firestore for persistent storage with owner-bound access control rules.

### Firestore Security Rules (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 5. Cloud Run Deployment Flow

To deploy directly from source using Google Cloud Build and Cloud Run:

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

## 6. Required Campaign Verification Binding

Apply the mandatory verification label to register the Cloud Run service for automated challenge verification:

```bash
gcloud run services update reflectai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

