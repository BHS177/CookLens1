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
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatGPTLive({ recipe, isOpen, onClose }: ChatGPTLiveProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'message' | 'phone'>('message')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

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
        content: `Bonjour ! Je suis votre assistant culinaire ChatGPT. Je peux vous aider avec la recette "${recipe.title}". Vous pouvez me poser des questions sur les ingrédients, les techniques de cuisson, les substitutions, ou tout autre aspect de cette recette. Comment puis-je vous aider ?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, recipe])

  // Effect to ensure continuous voice recognition in phone mode
  useEffect(() => {
    if (chatMode === 'phone' && isVoiceActive && !isListening && !isSpeaking && !isProcessingVoice) {
      const timeoutId = setTimeout(() => {
        if (chatMode === 'phone' && isVoiceActive && !isListening && !isSpeaking && !isProcessingVoice) {
          console.log('🎤 Auto-restarting voice recognition...')
          startVoiceRecognition()
        }
      }, 2000) // Check every 2 seconds

      return () => clearTimeout(timeoutId)
    }
  }, [chatMode, isVoiceActive, isListening, isSpeaking, isProcessingVoice])

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
          conversationHistory: messages
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
      if (isVoiceMode) {
        speakText(data.response)
      }

    } catch (error) {
      console.error('Erreur ChatGPT:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
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
    recognitionRef.current.continuous = chatMode === 'phone'
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'fr-FR'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      console.log('🎤 Voice recognition started')
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log('🎤 Transcript:', transcript)
      setInputMessage(transcript)
      
      if (chatMode === 'phone') {
        processVoiceConversation(transcript)
      } else {
        sendMessage(transcript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale:', event.error)
      setIsListening(false)
      
      // Restart recognition for phone mode
      if (chatMode === 'phone' && isVoiceActive && !isProcessingVoice) {
        setTimeout(() => {
          if (chatMode === 'phone' && isVoiceActive && !isListening) {
            startVoiceRecognition()
          }
        }, 1000)
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      console.log('🎤 Voice recognition ended')
      
      // Restart recognition for phone mode
      if (chatMode === 'phone' && isVoiceActive && !isProcessingVoice) {
        setTimeout(() => {
          if (chatMode === 'phone' && isVoiceActive && !isListening) {
            startVoiceRecognition()
          }
        }, 500)
      }
    }

    recognitionRef.current.start()
  }


  const processVoiceConversation = async (transcript: string) => {
    if (isProcessingVoice) return
    
    setIsProcessingVoice(true)
    console.log('🎤 Processing voice conversation:', transcript)
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: transcript,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Get ChatGPT response
      const response = await fetch('/api/chatgpt-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcript,
          recipe: recipe,
          conversationHistory: messages
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec ChatGPT')
      }

      const data = await response.json()
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Speak the response
      speakText(data.response)

    } catch (error) {
      console.error('Erreur conversation vocale:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessingVoice(false)
      console.log('🎤 Voice processing completed')
    }
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
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      console.log('🔊 ChatGPT speaking:', text.substring(0, 50) + '...')
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      console.log('🔊 ChatGPT finished speaking')
      
      // If in phone mode and voice is active, restart listening after a short delay
      if (chatMode === 'phone' && isVoiceActive && !isListening && !isProcessingVoice) {
        console.log('🎤 Scheduling voice recognition restart...')
        setTimeout(() => {
          if (chatMode === 'phone' && isVoiceActive && !isListening && !isProcessingVoice) {
            console.log('🎤 Restarting voice recognition after speaking')
            startVoiceRecognition()
          }
        }, 1500) // Increased delay to ensure speech is fully finished
      }
    }

    utterance.onerror = (event) => {
      console.error('Erreur de synthèse vocale:', event.error)
      setIsSpeaking(false)
      
      // Even on error, restart listening if in phone mode
      if (chatMode === 'phone' && isVoiceActive && !isListening && !isProcessingVoice) {
        setTimeout(() => {
          if (chatMode === 'phone' && isVoiceActive && !isListening) {
            console.log('🎤 Restarting voice recognition after speech error')
            startVoiceRecognition()
          }
        }, 1000)
      }
    }

    synthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const interruptAndListen = () => {
    console.log('🛑 Interrupting ChatGPT and starting to listen...')
    
    // Stop ChatGPT speaking
    stopSpeaking()
    
    // Stop any current recognition
    stopVoiceRecognition()
    
    // Start listening immediately
    if (chatMode === 'phone' && isVoiceActive) {
      setTimeout(() => {
        console.log('🎤 Starting voice recognition after interruption')
        startVoiceRecognition()
      }, 300)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const switchToMessageMode = () => {
    setChatMode('message')
    setIsVoiceActive(false)
    stopVoiceRecognition()
    stopSpeaking()
  }

  const switchToPhoneMode = () => {
    console.log('📞 Switching to phone mode...')
    setChatMode('phone')
    setIsVoiceActive(true)
    
    // Stop any current recognition first
    stopVoiceRecognition()
    
    // Start voice recognition after a short delay
    setTimeout(() => {
      console.log('🎤 Starting voice recognition in phone mode')
      startVoiceRecognition()
    }, 500)
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
                <h3 className="font-semibold text-gray-900">ChatGPT Live</h3>
                <p className="text-sm text-gray-500">Assistant culinaire</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={switchToMessageMode}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  chatMode === 'message' ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mode message (texte)"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Message</span>
              </button>
              
              <button
                onClick={switchToPhoneMode}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  chatMode === 'phone' ? 'bg-green-100 text-green-600 border-2 border-green-300 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mode téléphone (conversation vocale)"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Phone</span>
              </button>
              
              {chatMode === 'phone' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                  title={isMuted ? 'Activer le son' : 'Désactiver le son'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              
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
            {chatMode === 'message' && (
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </form>
            )}
            
            {chatMode === 'phone' && (
              <div className="mt-4 flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-4">
                  {isListening && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">J'écoute...</span>
                    </div>
                  )}
                  {isProcessingVoice && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Je traite...</span>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">ChatGPT parle...</span>
                    </div>
                  )}
                </div>
                
                {isSpeaking && (
                  <button
                    onClick={interruptAndListen}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Interrompre et parler</span>
                  </button>
                )}
                
                {!isSpeaking && !isListening && !isProcessingVoice && (
                  <div className="text-center text-gray-500">
                    <Phone className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Mode conversation vocale actif</p>
                    <p className="text-xs">Parlez naturellement, je vous écoute</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
