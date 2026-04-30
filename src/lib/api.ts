const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = {

  getMessages: async (userId: string) => {
    const res = await fetch(`${API_URL}/api/messages?userId=${userId}`)
    if (!res.ok) throw new Error('Failed to fetch messages')
    return res.json()
  },

  sendMessage: async (userId: string, role: string, content: string) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, content })
    })
    return res.json()
  },

  getAIStream: async (userId: string, content: string, onChunk: (text: string) => void) => {
    const res = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: content })
    })

    if (!res.ok) throw new Error('Stream failed')

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        onChunk(fullText) 
      }
    }
    return fullText
  }
}