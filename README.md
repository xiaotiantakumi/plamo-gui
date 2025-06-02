# Plamo GUI - Japanese-English Translation App

A modern web application for Japanese-English translation powered by the MLX-based `plamo-2-translate` model.

## Features

- Real-time translation between Japanese and English
- Clean, responsive UI built with React and Tailwind CSS
- Powered by Bun for fast development and runtime performance
- Uses MLX models for efficient on-device translation
- Automatic language detection and switching
- Debounced input for optimal performance

## Prerequisites

- [Bun](https://bun.sh) runtime
- Python 3.8+ with MLX support
- macOS (for MLX model support)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/xiaotiantakumi/plamo-gui.git
cd plamo-gui
```

2. Install dependencies:

```bash
bun install
```

3. Install the MLX translation model:

```bash
pip install mlx-lm
```

## Development

Run the development server with hot reload:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

Build the application:

```bash
bun run build
```

Run the production server:

```bash
bun run preview
```

## Testing

Run tests:

```bash
bun test
```

Run tests in watch mode:

```bash
bun test:watch
```

## Architecture

The project uses a modern web stack:

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Server**: Bun.serve() with built-in routing
- **Translation Engine**: MLX-based plamo-2-translate model
- **Build System**: Bun's native bundler and HTML imports

### Project Structure

```
plamo-gui/
├── index.ts          # Main server file with Bun.serve()
├── index.html        # HTML entry point
├── build.ts          # CSS build script
├── src/
│   ├── App.tsx       # Main React component
│   ├── App.test.tsx  # Component tests
│   ├── main.tsx      # React entry point
│   └── index.css     # Tailwind CSS source
├── dist/             # Build output
│   └── output.css    # Compiled CSS
└── package.json      # Project configuration
```

## API Endpoints

### POST /api/translate

Translates text between Japanese and English.

Request body:

```json
{
  "text": "こんにちは",
  "fromLang": "ja"
}
```

Response:

```json
{
  "translation": "Hello"
}
```

## Configuration

The application uses the following configuration:

- **Port**: 3000 (default)
- **Model**: mlx-community/plamo-2-translate
- **Hot Reload**: Enabled in development mode

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MLX Community](https://github.com/ml-explore/mlx) for the translation model
- [Bun](https://bun.sh) for the runtime and build tools
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
