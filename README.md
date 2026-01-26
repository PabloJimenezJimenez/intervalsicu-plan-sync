# Training Plan Importer

A client-side web application that extracts training plans from PDF files using AI and uploads them to Garmin watches via intervals.icu.

## Features

- 🏃 **PDF Upload**: Drag-and-drop PDF training plan files
- 🤖 **AI Extraction**: Automatically extract workouts using OpenRouter AI (Claude 3.5 Sonnet)
- ✏️ **Plan Editing**: Review and edit extracted workouts before uploading
- ☁️ **Cloud Sync**: Upload to intervals.icu for automatic Garmin synchronization
- 🎨 **Athletic Design**: Clean, performance-focused UI with smooth animations
- 🔒 **Privacy First**: 100% client-side, no backend database

## Tech Stack

- **Framework**: TanStack Start (React 19)
- **Styling**: Vanilla CSS with custom design system
- **Package Manager**: Bun
- **APIs**: 
  - intervals.icu API (workout upload & Garmin sync)
  - OpenRouter API (AI-powered PDF extraction)

## Prerequisites

1. **intervals.icu Account & API Key**
   - Sign up at [intervals.icu](https://intervals.icu)
   - Navigate to Settings → Developer Settings
   - Generate API key with `CALENDAR:WRITE` permission

2. **OpenRouter Account & API Key**
   - Create account at [openrouter.ai](https://openrouter.ai)
   - Generate API key
   - Add credits for API usage

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
   - Enter your OpenRouter API key
   - Test connections to verify

2. **Upload PDF**
   - Drag and drop your PDF training plan
   - Or click to browse and select file
   - Wait for AI extraction (10-30 seconds)

3. **Review & Edit**
   - Review extracted workouts in the table
   - Edit any fields inline (dates, types, descriptions, etc.)
   - Add or remove workouts as needed
   - Filter and search through workouts

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
│   │   └── success.tsx      # Success confirmation
│   ├── components/          # React components
│   │   ├── PDFUploader.tsx
│   │   ├── PlanPreview.tsx
│   │   ├── WorkoutRow.tsx
│   │   ├── LoadingState.tsx
│   │   ├── StatusBar.tsx
│   │   └── ErrorBoundary.tsx
│   ├── utils/               # Utility functions
│   │   ├── openrouter.ts    # OpenRouter API client
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
- OpenRouter API: [https://openrouter.ai/docs](https://openrouter.ai/docs)

## Credits

Built with:
- [TanStack Start](https://tanstack.com/start)
- [intervals.icu](https://intervals.icu)
- [OpenRouter](https://openrouter.ai)
