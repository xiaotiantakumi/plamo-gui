# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies
bun install

# Run development server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Running the Python GUI version
```bash
python translation_gui.py
```

## Architecture Overview

This is a Japanese-English translation application using the MLX-based `plamo-2-translate` model. The project has two implementations:

1. **Web Application** (primary): React frontend + Bun.serve() backend
   - Frontend (`src/App.tsx`): React UI with real-time translation, debouncing, and language switching
   - Backend (`index.ts`): Bun.serve() API server that spawns Python processes to run MLX translation model
   - Communication: REST API with `/api/translate` endpoint

2. **Desktop Application** (alternative): Python Tkinter GUI (`translation_gui.py`)

### Key Technical Details

- **Translation Flow**: Frontend → POST /api/translate → spawn Python process → MLX model → parse output → return JSON
- **Build System**: Uses Bun's native HTML imports and bundler instead of Vite
- **Server**: Bun.serve() with route handling and built-in HMR support
- **Output Processing**: Backend filters MLX metadata and statistics, returning only translated text
- **Model**: Uses `mlx-community/plamo-2-translate` from Hugging Face
- **Runtime**: Bun is used as both package manager and runtime for better performance