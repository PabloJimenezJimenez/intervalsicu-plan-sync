# Training Plan Importer

> [!IMPORTANT]
> **LOCAL USE ONLY**: This project is designed for local use only. It stores API keys directly in your browser's Local Storage. Do not host this application on a public server without modifying the security implementation.

A client-side web application that extracts training plans from PDF files using AI (or imports JSON) and uploads them to Garmin watches via intervals.icu.

## Project Goal

The primary goal of this project is to simplify the process of digitizing training plans. It bridges the gap between static PDF plans and dynamic training platforms by leveraging AI for extraction and APIs for synchronization. It aims to provide a privacy-focused, client-side tool for athletes to manage their training data without the need for a backend server.

## Features

- **Multi-Format Import**: Drag-and-drop PDF training plan files or upload JSON files directly
- **AI Extraction**: Automatically extract workouts using Google Generative AI (Gemini 2.0 Flash) from PDFs
- **Plan Editing**: Review and edit extracted workouts before uploading
- **Calendar View**: Visual calendar interface for reviewing training blocks
- **Cloud Sync**: Upload to intervals.icu for automatic Garmin synchronization
- **Athletic Design**: Clean, performance-focused UI with smooth animations
- **Privacy First**: 100% client-side, no backend database

## Limitations

- **Local Storage Security**: API keys are stored in the browser's `localStorage`. This is secure for local use but unsuitable for public hosting.
- **AI Accuracy**: PDF extraction relies on LLMs. While generally accurate, it may struggle with complex or poorly formatted layouts. Always review extracted data.
- **Device Sync**: Syncing to Garmin is handled via intervals.icu. You must have your Garmin account connected to intervals.icu.
- **Browser State**: Clearing browser data will reset your API keys and configuration.

## Tech Stack

- **Framework**: TanStack Start (React 19)
- **Styling**: Vanilla CSS with custom design system
- **Package Manager**: Bun
- **APIs**: 
  - intervals.icu API (workout upload & Garmin sync)
  - Google Generative AI via AI SDK (AI-powered PDF extraction)

## Prerequisites

1. **intervals.icu Account & API Key**
   - Sign up at [intervals.icu](https://intervals.icu)
   - Navigate to Settings -> Developer Settings
   - Generate API key with `CALENDAR:WRITE` permission

2. **Google AI Studio API Key**
   - Create account at [Google AI Studio](https://aistudio.google.com/)
   - Generate API key (Free tier available)

3. **Bun Installed**
   ```bash
   # Install Bun (if not already installed)
   curl -fsSL https://bun.sh/install | bash
   ```

## Installation

1. **Clone or navigate to the repository**
   ```bash
   cd app-import-plan-garmin
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Create environment file (optional)**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (or configure via UI)
   ```

## Usage

### Development Server

```bash
bun dev
```

The app will be available at `http://localhost:3000`

### Application Flow

1. **Setup** (First time only)
   - Click "Go to Setup" if API keys aren't configured
   - Enter your intervals.icu API key
   - Enter your Google AI Studio API key
   - Test connections to verify

2. **Upload Plan**
   - **PDF**: Drag and drop your PDF training plan. The AI will extract the workouts (10-30 seconds).
   - **JSON**: Upload a pre-formatted JSON file for instant loading.

3. **Review & Edit**
   - Review extracted workouts in the list or **Calendar View**.
   - Edit any fields inline (dates, types, descriptions, etc.).
   - Configure pace settings if needed.

4. **Upload to intervals.icu**
   - Click "Upload to intervals.icu"
   - Wait for batch upload to complete
   - Workouts will automatically sync to your Garmin device

5. **Verify on Garmin**
   - Check intervals.icu calendar to see your plan
   - Sync your Garmin device
   - Workouts should appear on your watch

## Project Structure

```
app-import-plan-garmin/
├── src/
│   ├── routes/              # Application pages
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Landing/upload page
│   │   ├── setup.tsx        # API key configuration
│   │   ├── preview.tsx      # Plan review & editing
│   │   ├── success.tsx      # Success confirmation
│   ├── components/          # React components
│   │   ├── PDFUploader.tsx  # PDF Drag & Drop
│   │   ├── JSONUploader.tsx # JSON File Upload
│   │   ├── PlanPreview.tsx  # Plan Review Container
│   │   ├── CalendarView.tsx # Visual Calendar Grid
│   │   ├── WorkoutRow.tsx   # Row Item Component
│   │   ├── Header.tsx       # Navigation Header
│   │   ├── StatusBar.tsx    # Status Indicator
│   │   ├── DatePicker.tsx   # Date Selection Util
│   │   ├── PaceConfiguration.tsx # Pace Settings
│   │   ├── LoadingState.tsx # Loading Spinner
│   │   └── ErrorBoundary.tsx# Error Catcher
│   ├── utils/               # Utility functions
│   │   ├── google-ai.ts     # Google AI extraction client
│   │   ├── intervals-icu.ts # intervals.icu API client
│   │   ├── pdf-parser.ts    # PDF processing
│   │   ├── storage.ts       # LocalStorage helpers
│   │   └── workout-validator.ts
│   ├── types/               # TypeScript definitions
│   │   ├── workout.ts
│   │   └── api.ts
│   ├── styles.css           # Design system
│   └── animations.css       # Motion design
├── public/                  # Static assets
├── package.json
└── README.md
```

## API Keys Storage

API keys are stored in your browser's localStorage for convenience. They are:
- Never sent to any server except the respective APIs
- Only accessible by this application
- Can be cleared at any time via browser settings

## Troubleshooting

### PDF Upload Fails
- Ensure PDF is under 10MB
- Check that the PDF contains readable text (not just images)
- Try a different AI model if extraction fails repeatedly

### intervals.icu Upload Fails
- Verify your API key has `CALENDAR:WRITE` permission
- Check that workout dates are in the future or recent past
- Ensure no duplicate external IDs exist

### Garmin Sync Issues
- Verify intervals.icu is connected to your Garmin Connect account
- Manual sync may be required on some Garmin devices
- Check intervals.icu documentation for Garmin integration setup

## Development

### Type Checking
```bash
bun run typecheck
```

### Build (for validation)
```bash
bun run build
```

### Preview Build
```bash
bun run preview
```

## Design Philosophy

This app follows a refined, athletic design aesthetic:
- **Typography**: Bebas Neue (display) + DM Sans (body)
- **Colors**: Deep navy primary with energetic orange accents
- **Motion**: Smooth animations for state transitions
- **Layout**: Clean data-focused interfaces with generous spacing

## License

MIT

## Support

For issues or questions:
- intervals.icu API: [https://intervals.icu/api-docs](https://intervals.icu/api-docs)
- Google Gen AI SDK: [https://sdk.vercel.ai/docs/reference/ai-sdk-google](https://sdk.vercel.ai/docs/reference/ai-sdk-google)

## Credits

Built with:
- [TanStack Start](https://tanstack.com/start)
- [intervals.icu](https://intervals.icu)
- [Google AI SDK](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai)
