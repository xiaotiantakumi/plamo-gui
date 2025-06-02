import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { spawn } from 'child_process'

const app = new Hono()

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/', serveStatic({ path: './dist/index.html' }))

app.post('/api/translate', async (c) => {
  const { text, fromLang } = await c.req.json()
  
  if (!text || text.trim() === '') {
    return c.json({ translation: '' })
  }

  try {
    const translation = await translateText(text, fromLang)
    return c.json({ translation })
  } catch (error) {
    return c.json({ error: 'Translation failed' }, 500)
  }
})

function translateText(text: string, fromLang: 'ja' | 'en'): Promise<string> {
  return new Promise((resolve, reject) => {
    // Prepare prompt based on language direction
    const prompt = fromLang === 'ja' ? text : `Translate to Japanese: ${text}`
    
    const args = [
      '-m', 'mlx_lm', 'generate',
      '--model', 'mlx-community/plamo-2-translate',
      '--extra-eos-token', '<|plamo:op|>',
      '--prompt', prompt
    ]
    
    // Use the Python from the virtual environment if available
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
      
      // Extract translation from output
      let translation = output.trim()
      
      // Remove the prompt from the beginning
      if (translation.startsWith(prompt)) {
        translation = translation.slice(prompt.length).trim()
      }
      
      // Clean up the output - remove generation stats
      const lines = translation.split('\n')
      const cleanedLines = lines.filter(line => {
        // Remove lines that contain generation statistics
        if (line.includes('Prompt:') && line.includes('tokens')) return false
        if (line.includes('Generation:') && line.includes('tokens')) return false
        if (line.includes('Peak memory:')) return false
        if (line.includes('tokens-per-sec')) return false
        if (line.includes('==========')) return false
        if (line.includes('Translated with www.DeepL.com')) return false
        return true
      })
      
      translation = cleanedLines.join('\n').trim()
      
      // Additional cleanup for common patterns
      if (translation.includes('Response:')) {
        translation = translation.split('Response:').pop()?.trim() || ''
      }
      
      // Remove leading separators
      translation = translation.replace(/^[-=]+/, '').trim()
      
      resolve(translation)
    })
  })
}

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server running on http://localhost:3000')