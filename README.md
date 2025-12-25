# AI Christmas Gift Card Generator

A modern web application that creates beautiful Christmas gift cards using AI. Upload your images, let Gemini Flash analyze them and suggest creative layouts, then generate stunning cards with FAL.ai's image generation.

## Features

- **Image Upload**: Upload up to 5 images/elements for your card
- **AI Layout Analysis**: Gemini Flash analyzes your images and suggests creative layouts
- **Title Suggestions**: Get AI-generated title options or write your own
- **Card Generation**: Generate beautiful Christmas cards using FAL.ai
- **Download**: Save your generated cards instantly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (no Tailwind)
- **AI Analysis**: Google Gemini 1.5 Flash
- **Image Generation**: FAL.ai (Recraft V3)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- FAL.ai API key ([Get one here](https://fal.ai/))

### Installation

1. Clone the repository and navigate to the project:

```bash
cd AI-Gift-Card
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and add your API keys:

```bash
cp env.template .env.local
```

Then edit `.env.local` and fill in your API keys:

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Google Gemini 1.5 Flash for image analysis | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `FAL_KEY` | FAL.ai for image generation | [FAL Dashboard](https://fal.ai/dashboard/keys) |

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Images**: Drop or select images containing elements you want in your card (photos, decorations, etc.)

2. **Generate Layouts**: Click "Generate Layout Ideas" to have AI analyze your images and suggest creative layouts

3. **Choose Layout**: Select one of the suggested layout options

4. **Pick Title**: Choose from AI-suggested titles or write your own custom title

5. **Generate Card**: Click the generate button to create your Christmas card

6. **Download**: Save your generated card as a PNG file

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/      # Gemini Flash analysis endpoint
│   │   └── generate/     # FAL.ai image generation endpoint
│   ├── globals.css       # Global styles and CSS variables
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── page.module.css   # Page styles
└── components/
    ├── ImageUploader/    # Drag & drop image upload
    ├── LayoutSuggestions/# Layout options from AI
    ├── TitleInput/       # Title selection/input
    └── CardGenerator/    # Card generation & download
```

## Design Philosophy

- **Minimalist**: Clean, focused interface with no clutter
- **Dark Theme**: Elegant dark color scheme with gold accents
- **Typography**: Cormorant Garamond for display, Instrument Sans for UI
- **Animations**: Subtle, purposeful animations for better UX

## License

MIT
