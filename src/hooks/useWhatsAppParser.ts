// T052: Custom hook for WhatsApp list parsing

import { useState, useCallback } from 'react'
import { parseWhatsAppList } from '@/utils/parsers'

interface UseWhatsAppParserReturn {
  rawText: string
  setRawText: (text: string) => void
  parsedNames: string[]
  parse: () => string[]
  clear: () => void
}

export function useWhatsAppParser(): UseWhatsAppParserReturn {
  const [rawText, setRawText] = useState('')
  const [parsedNames, setParsedNames] = useState<string[]>([])

  const parse = useCallback((): string[] => {
    const names = parseWhatsAppList(rawText)
    setParsedNames(names)
    return names
  }, [rawText])

  const clear = useCallback(() => {
    setRawText('')
    setParsedNames([])
  }, [])

  return { rawText, setRawText, parsedNames, parse, clear }
}
