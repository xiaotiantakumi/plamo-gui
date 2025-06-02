import { expect, test, describe, beforeAll, afterAll } from 'bun:test'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'

describe('Translation API Integration Tests', () => {
  const baseURL = 'http://localhost:3001' // Different port to avoid conflicts
  let serverProcess: ChildProcess
  
  beforeAll(async () => {
    // Start the server for tests
    serverProcess = spawn('bun', ['index.ts'], {
      env: { ...process.env, PORT: '3001' },
      detached: false
    })
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000))
  })
  
  afterAll(() => {
    // Kill the server process
    if (serverProcess) {
      serverProcess.kill()
    }
  })
  
  test.skip('POST /api/translate - translates Japanese to English', async () => {
    const response = await fetch(`${baseURL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'こんにちは',
        fromLang: 'ja'
      })
    })

    expect(response.ok).toBe(true)
    expect(response.headers.get('content-type')).toBe('application/json')
    
    const data = await response.json()
    expect(data).toHaveProperty('translation')
    expect(typeof data.translation).toBe('string')
  })

  test.skip('POST /api/translate - returns empty string for empty input', async () => {
    const response = await fetch(`${baseURL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '',
        fromLang: 'ja'
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.translation).toBe('')
  })
})

// Unit tests for route handlers
describe('Route Handler Unit Tests', () => {
  test('HTML import exists', async () => {
    const file = Bun.file('./index.html')
    expect(await file.exists()).toBe(true)
  })
  
  test('CSS build output exists', async () => {
    const file = Bun.file('./dist/output.css')
    expect(await file.exists()).toBe(true)
  })
  
  test('index.ts exports server', async () => {
    const module = await import('./index.ts')
    expect(module).toBeDefined()
  })
})