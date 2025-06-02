import { $ } from "bun"

// Build CSS with PostCSS
await $`bunx postcss ./src/index.css -o ./dist/output.css`

console.log('CSS built successfully!')