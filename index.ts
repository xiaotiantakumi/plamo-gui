import index from "./index.html"
import { spawn } from 'child_process'

function translateText(text: string, fromLang: 'ja' | 'en'): Promise<string> {
  return new Promise((resolve, reject) => {
    const prompt = fromLang === 'ja' ? text : `Translate to Japanese: ${text}`
    
    const args = [
      '-m', 'mlx_lm', 'generate',
      '--model', 'mlx-community/plamo-2-translate',
      '--extra-eos-token', '<|plamo:op|>',
      '--prompt', prompt
    ]
    
    const pythonPath = process.env.VIRTUAL_ENV 
      ? `${process.env.VIRTUAL_ENV}/bin/python`
      : 'python'
    
    const proc = spawn(pythonPath, args)
    let output = ''
    let error = ''
    
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    proc.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(error || 'Translation process failed'))
        return
      }
      
      let translation = output.trim()
      
      if (translation.startsWith(prompt)) {
        translation = translation.slice(prompt.length).trim()
      }
      
      const lines = translation.split('\n')
      const cleanedLines = lines.filter(line => {
        if (line.includes('Prompt:') && line.includes('tokens')) return false
        if (line.includes('Generation:') && line.includes('tokens')) return false
        if (line.includes('Peak memory:')) return false
        if (line.includes('tokens-per-sec')) return false
        if (line.includes('==========')) return false
        if (line.includes('Translated with www.DeepL.com')) return false
        return true
      })
      
      translation = cleanedLines.join('\n').trim()
      
      if (translation.includes('Response:')) {
        translation = translation.split('Response:').pop()?.trim() || ''
      }
      
      translation = translation.replace(/^[-=]+/, '').trim()
      
      resolve(translation)
    })
  })
}

Bun.serve({
  routes: {
    "/": index,
    "/dist/*": async (req) => {
      const url = new URL(req.url)
      const filePath = `.${url.pathname}`
      const file = Bun.file(filePath)
      
      if (await file.exists()) {
        return new Response(file, {
          headers: {
            'Content-Type': file.type,
          }
        })
      }
      
      return new Response('Not found', { status: 404 })
    },
    "/api/translate": {
      POST: async (req) => {
        const body = await req.json() as { text: string; fromLang: 'ja' | 'en' }
        const { text, fromLang } = body
        
        if (!text || text.trim() === '') {
          return new Response(JSON.stringify({ translation: '' }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }

        try {
          const translation = await translateText(text, fromLang)
          return new Response(JSON.stringify({ translation }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Translation failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      },
    },
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3000,
})

console.log('Server running on http://localhost:3000')