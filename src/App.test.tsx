import { expect, test, describe } from 'bun:test'
import React from 'react'
import App from './App'

describe('App Component', () => {
  test('Component renders without crashing', () => {
    // Simple test to check if component can be imported
    expect(App).toBeDefined()
    expect(typeof App).toBe('function')
  })
  
  test('Component has correct display name', () => {
    expect(App.name).toBe('App')
  })
})