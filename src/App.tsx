import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [sourceText, setSourceText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [sourceLang, setSourceLang] = useState<'ja' | 'en'>('ja')
  const [status, setStatus] = useState('準備完了')
  const [isTranslating, setIsTranslating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (sourceText.trim() === '') {
      setTargetText('')
      setStatus('準備完了')
      return
    }

    timerRef.current = setTimeout(() => {
      translateText(sourceText, sourceLang)
    }, 500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [sourceText, sourceLang])

  const translateText = async (text: string, fromLang: 'ja' | 'en') => {
    setIsTranslating(true)
    setStatus('翻訳中...')

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, fromLang }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      setTargetText(data.translation)
      setStatus('翻訳完了')
      
      setTimeout(() => {
        setStatus('準備完了')
      }, 2000)
    } catch (error) {
      setTargetText('エラーが発生しました')
      setStatus('エラー')
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const switchLanguages = () => {
    setSourceLang(sourceLang === 'ja' ? 'en' : 'ja')
    setSourceText(targetText)
    setTargetText(sourceText)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Plamo Translation
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-4 gap-4">
            <span className="text-lg font-medium">{sourceLang === 'ja' ? '日本語' : 'English'}</span>
            <button
              onClick={switchLanguages}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="言語を切り替え"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <span className="text-lg font-medium">{sourceLang === 'ja' ? 'English' : '日本語'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <textarea
                className="w-full h-96 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={sourceLang === 'ja' ? "翻訳したいテキストを入力してください..." : "Enter text to translate..."}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
              />
            </div>
            
            <div>
              <div className="w-full h-96 p-4 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto whitespace-pre-wrap">
                {targetText}
              </div>
            </div>
          </div>
          
          <div className={`mt-6 py-2 px-4 text-center rounded-md text-sm font-medium ${
            isTranslating ? 'bg-blue-500 text-white' :
            status === 'エラー' ? 'bg-red-500 text-white' :
            status === '翻訳完了' ? 'bg-green-500 text-white' :
            'bg-gray-200 text-gray-700'
          }`}>
            {status}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App