# SpecSort — Construction Document Organizer

AI-powered PDF analyzer for construction specs and submittals. Organizes documents by CSI division, priority, trade, and document type.

## Deploy to Vercel

### 1. Upload this project
Either drag this folder into [vercel.com/new](https://vercel.com/new) or push to GitHub and import.

### 2. Add your Anthropic API key as an environment variable
In your Vercel project dashboard:
- Go to **Settings → Environment Variables**
- Add a new variable:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** `sk-ant-api03-...` (your key from console.anthropic.com)
- Click **Save**

### 3. Redeploy
After adding the environment variable, trigger a redeploy from the Vercel dashboard.

That's it — the app will be live and no API key is needed in the browser.

## Project Structure

```
specsort/
├── api/
│   └── analyze.js        # Serverless function — holds API key securely
├── public/
│   └── index.html        # Frontend app
├── vercel.json           # Vercel routing config
└── README.md
```

## How it works

1. User uploads one or more construction PDFs
2. Browser sends the PDF (as base64) to `/api/analyze`
3. The serverless function calls Anthropic's API using the secret key
4. Claude analyzes the document and returns structured JSON
5. The frontend displays results organized by topic, priority, and type

## Features

- CSI MasterFormat division & section identification
- Document type classification (Spec, Submittal, Shop Drawing, RFI, etc.)
- Priority assessment (Critical / High / Medium / Low)
- Trade & discipline tagging
- Export to JSON, CSV, and HTML report
