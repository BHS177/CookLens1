'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  X,
  Bot,
  User,
  Volume2,
  VolumeX
} from 'lucide-react'

interface ChatGPTLiveProps {
  recipe: any
  isOpen: boolean
  onClose: () => void
  language?: 'fr' | 'en'
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatGPTLive({ recipe, isOpen, onClose, language = 'fr' }: ChatGPTLiveProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isCallMode, setIsCallMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Translations
  const t = {
    fr: {
      welcome: `Bonjour ! Je suis votre assistant culinaire ChatGPT. Je peux vous aider avec la recette "${recipe?.title}". Vous pouvez me poser des questions sur les ingrédients, les techniques de cuisson, les substitutions, ou tout autre aspect de cette recette. Comment puis-je vous aider ?`,
      placeholder: {
        text: "Tapez votre message...",
        voice: "Mode vocal activé - cliquez sur le micro",
        call: "Mode appel activé - parlez directement"
      },
      send: "Envoyer",
      chatTitle: "ChatGPT Live",
      assistant: "Assistant culinaire",
      voiceMode: "Mode vocal",
      callMode: "Mode appel",
      mute: "Désactiver le son",
      unmute: "Activer le son",
      speaking: "ChatGPT parle...",
      callActive: "Mode appel actif",
      stop: "Arrêter",
      error: "Désolé, je rencontre un problème technique. Veuillez réessayer."
    },
    en: {
      welcome: `Hello! I'm your culinary assistant ChatGPT. I can help you with the recipe "${recipe?.title}". You can ask me questions about ingredients, cooking techniques, substitutions, or any other aspect of this recipe. How can I help you?`,
      placeholder: {
        text: "Type your message...",
        voice: "Voice mode activated - click the microphone",
        call: "Call mode activated - speak directly"
      },
      send: "Send",
      chatTitle: "ChatGPT Live",
      assistant: "Culinary Assistant",
      voiceMode: "Voice mode",
      callMode: "Call mode",
      mute: "Mute sound",
      unmute: "Unmute sound",
      speaking: "ChatGPT is speaking...",
      callActive: "Call mode active",
      stop: "Stop",
      error: "Sorry, I'm experiencing a technical issue. Please try again."
    }
  }

  const texts = t[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && recipe) {
      // Message de bienvenue avec contexte de la recette
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: texts.welcome,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, recipe, texts.welcome])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatgpt-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          recipe: recipe,
          conversationHistory: messages,
          language: language
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec ChatGPT')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Lecture vocale automatique si activée
      if (isVoiceMode || isCallMode) {
        speakText(data.response)
      }

    } catch (error) {
      console.error('Erreur ChatGPT:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: texts.error,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée sur votre navigateur')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = language === 'fr' ? 'fr-FR' : 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      sendMessage(transcript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale:', event.error)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.start()
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if (isMuted) return

    // Arrêter la lecture précédente
    if (synthesisRef.current) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    synthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (isCallMode) setIsCallMode(false)
  }

  const toggleCallMode = () => {
    setIsCallMode(!isCallMode)
    if (isVoiceMode) setIsVoiceMode(false)
  }

  // Debug log
  console.log('ChatGPTLive render:', { isOpen, recipe: !!recipe })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{texts.chatTitle}</h3>
                <p className="text-sm text-gray-500">{texts.assistant}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceMode}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={texts.voiceMode}
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleCallMode}
                className={`p-2 rounded-lg transition-colors ${
                  isCallMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={texts.callMode}
              >
                <Phone className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={isMuted ? texts.unmute : texts.mute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isVoiceMode ? texts.placeholder.voice :
                    isCallMode ? texts.placeholder.call :
                    texts.placeholder.text
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                
                {(isVoiceMode || isCallMode) && (
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{texts.send}</span>
              </button>
            </form>
            
            {(isSpeaking || isCallMode) && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gray-600">
                {isSpeaking && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{texts.speaking}</span>
                  </div>
                )}
                {isCallMode && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{texts.callActive}</span>
                  </div>
                )}
                <button
                  onClick={stopSpeaking}
                  className="text-red-500 hover:text-red-700"
                >
                  {texts.stop}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
