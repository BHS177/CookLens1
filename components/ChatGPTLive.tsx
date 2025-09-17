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
  const [isRestarting, setIsRestarting] = useState(false)
  const [lastProcessedTime, setLastProcessedTime] = useState(0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  
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

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      console.log('🔊 Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })))
    }

    // Load voices immediately
    loadVoices()

    // Load voices when they become available (some browsers load them asynchronously)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  // No auto-restart - user must click Retalk manually

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up voice activities...')
      // Stop all voice activities when component unmounts
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée sur votre navigateur')
      return
    }

    // Prevent multiple simultaneous recognitions
    if (isListening || isRestarting || isProcessingVoice || isSpeaking) {
      console.log('🎤 Already listening, restarting, processing, or speaking, skipping...', {
        isListening,
        isRestarting,
        isProcessingVoice,
        isSpeaking
      })
      return
    }

    // Re-enable voice recognition when user clicks Retalk
    setIsVoiceActive(true)

    // Clear any pending input before starting
    setInputMessage('')
    
    // Reset the last processed time to ensure fresh start
    setLastProcessedTime(Date.now())

    console.log('🎤 Starting voice recognition...')
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false // Always false for better control
    recognitionRef.current.interimResults = false // Disable interim results for better final results
    recognitionRef.current.lang = 'fr-FR'
    recognitionRef.current.maxAlternatives = 1 // Use only the best result

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setIsRestarting(false)
      console.log('🎤 Voice recognition started')
    }

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎤 Raw results:', event.results)
      
      // Get the final result
      const finalResults = Array.from(event.results).filter((result: any) => result.isFinal)
      
      if (finalResults.length > 0) {
        const result = finalResults[0]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        
        console.log('🎤 Final transcript:', transcript)
        console.log('🎤 Confidence:', confidence)
        
        // Process any meaningful transcript with reasonable confidence
        if (transcript && transcript.trim().length > 2 && confidence > 0.3) {
          console.log('🎤 Processing transcript:', transcript)
          
          // Stop recognition immediately
          if (recognitionRef.current) {
            recognitionRef.current.stop()
          }
          
          // Set input message and process
          setInputMessage(transcript)
          
          if (chatMode === 'phone') {
            processVoiceConversation(transcript)
          } else {
            sendMessage(transcript)
          }
        } else {
          console.log('🎤 Low confidence or empty transcript, ignoring...', { transcript, confidence })
        }
      } else {
        console.log('🎤 No final results yet, waiting...')
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale:', event.error)
      setIsListening(false)
      setIsRestarting(false)
      
      // No auto-restart - user must click Retalk manually
      console.log('🎤 Voice recognition stopped due to error:', event.error)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setIsRestarting(false)
      console.log('🎤 Voice recognition ended')
      
      // No auto-restart - user must click Retalk manually
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsListening(false)
    }
  }


  const processVoiceConversation = async (transcript: string) => {
    if (isProcessingVoice) {
      console.log('🎤 Already processing voice, skipping...')
      return
    }
    
    // Check if this is a duplicate of recent messages (last 5 messages)
    const recentMessages = messages.slice(-5).filter(msg => msg.type === 'user')
    const isDuplicate = recentMessages.some(msg => msg.content === transcript)
    
    if (isDuplicate) {
      console.log('🎤 Duplicate message detected, skipping...', { transcript })
      return
    }
    
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
    } finally {
      setIsProcessingVoice(false)
      setLastProcessedTime(Date.now()) // Update last processed time
      console.log('🎤 Voice processing completed')
      
      // No auto-restart - user must click Retalk manually
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Function to enhance text for natural human-like speech with proper pauses
  const enhanceTextForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/^\d+\.\s*/gm, '') // Remove numbered list markers
      .replace(/^[-*+]\s*/gm, '') // Remove bullet points
      // Enhanced pause handling for natural speech flow
      .replace(/\.\s+/g, ', ') // Convert periods to commas for natural pauses
      .replace(/,\s+/g, ', ') // Single space after commas
      .replace(/;\s+/g, ', ') // Convert semicolons to commas for natural pauses
      .replace(/:\s+/g, ', ') // Convert colons to commas for natural pauses
      .replace(/!\s+/g, '! ') // Keep exclamations with space
      .replace(/\?\s+/g, '? ') // Keep questions with space
      // Add natural pauses for better comprehension
      .replace(/\.\s*\.\s*\./g, '... ') // Ellipsis with pause
      .replace(/\n\s*\n/g, ', ') // Replace multiple newlines with comma pause
      .replace(/\n/g, ' ') // Replace single newlines with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?;:()\-'àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/g, '') // Keep only letters, numbers, punctuation and French accents
      .replace(/\s*\.\s*\.\s*\./g, '...') // Clean up multiple dots
      .replace(/\s*,\s*,\s*/g, ', ') // Clean up multiple commas
      // Ensure the last sentence ends with a period for natural conclusion
      .replace(/,\s*$/, '.') // Replace trailing comma with period
      .trim()
  }

  const speakText = async (text: string) => {
    if (isMuted) return

    // Arrêter la lecture précédente
    window.speechSynthesis.cancel()

    // Enhanced text processing for natural human-like speech
    const cleanText = enhanceTextForSpeech(text)

    console.log('🔊 Original text:', text.substring(0, 100) + '...')
    console.log('🔊 Cleaned text:', cleanText.substring(0, 100) + '...')

    try {
      // Use Google Cloud Text-to-Speech API
      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          language: 'fr-FR',
          voice: 'fr-FR-Wavenet-A', // High-quality French female voice
          speakingRate: 0.9,
          pitch: 0.0,
          volumeGainDb: 0.0
        })
      })

      if (!response.ok) {
        throw new Error('Google TTS API error')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      // Store audio reference for stopping
      synthesisRef.current = audio
      
      audio.onplay = () => {
        setIsSpeaking(true)
        console.log('🔊 Google TTS speaking:', cleanText.substring(0, 50) + '...')
      }
      
      audio.onended = () => {
        setIsSpeaking(false)
        console.log('🔊 Google TTS finished speaking')
        URL.revokeObjectURL(audioUrl) // Clean up
        synthesisRef.current = null
      }
      
      audio.onerror = (error) => {
        console.error('Google TTS audio error:', error)
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl) // Clean up
        synthesisRef.current = null
      }
      
      await audio.play()
      
    } catch (error) {
      console.error('Google TTS error, falling back to browser TTS:', error)
      
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'fr-FR'
      
      // Human-like voice settings for natural speech
      utterance.rate = 0.85  // Slower for more natural, human-like pace
      utterance.pitch = 1.0  // Natural pitch
      utterance.volume = 1
    
      // Try to use the best available French voice for human-like speech
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices()
      const frenchVoices = voices.filter(voice => 
        voice.lang.startsWith('fr') && 
        (voice.name.includes('Google') || 
         voice.name.includes('Microsoft') || 
         voice.name.includes('Alex') ||
         voice.name.includes('Amélie') ||
         voice.name.includes('Thomas') ||
         voice.name.includes('Marie') ||
         voice.name.includes('Virginie') ||
         voice.name.includes('Paul') ||
         voice.name.includes('Julie'))
      )
      
      if (frenchVoices.length > 0) {
        // Prefer the most natural and human-like voices in this order
        const preferredVoice = frenchVoices.find(voice => 
          voice.name.includes('Amélie') && voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Thomas') && voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Virginie') && voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Paul') && voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Julie') && voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Amélie')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Thomas')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Virginie')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Paul')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Julie')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Google')
        ) || frenchVoices.find(voice => 
          voice.name.includes('Microsoft')
        ) || frenchVoices[0]
        
        utterance.voice = preferredVoice
        console.log('🔊 Using fallback voice:', preferredVoice.name, 'Language:', preferredVoice.lang)
      } else {
        console.log('🔊 No French voices found, using default')
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        console.log('🔊 Browser TTS speaking:', cleanText.substring(0, 50) + '...')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        console.log('🔊 Browser TTS finished speaking')
      }

      utterance.onerror = (event) => {
        console.error('Erreur de synthèse vocale:', event.error)
        setIsSpeaking(false)
      }

      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    console.log('🛑 Stopping ChatGPT speech...')
    
    // Stop Google TTS audio if playing
    if (synthesisRef.current && synthesisRef.current.pause) {
      synthesisRef.current.pause()
      synthesisRef.current.currentTime = 0
      synthesisRef.current = null
    }
    
    // Stop all audio elements as backup
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    
    // Stop speech synthesis immediately
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    
    // Stop any current recognition to prevent capturing ChatGPT's speech
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    
    // Clear any pending input and processing states
    setInputMessage('')
    setIsProcessingVoice(false)
    setIsRestarting(false)
    
    // Reset the last processed time to prevent immediate processing
    setLastProcessedTime(Date.now())
    
    // Clear any pending timeouts
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    // Disable voice recognition completely until user clicks Retalk
    setIsVoiceActive(false)
    
    console.log('🛑 ChatGPT speech stopped, voice recognition disabled until Retalk')
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

  const handleClose = () => {
    console.log('🚪 Closing chat, stopping all voice activities...')
    
    // Stop all voice activities
    stopVoiceRecognition()
    stopSpeaking()
    
    // Reset all states
    setIsVoiceActive(false)
    setIsListening(false)
    setIsSpeaking(false)
    setIsProcessingVoice(false)
    setIsRestarting(false)
    setChatMode('message')
    
    // Clear any pending timeouts
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    // Close the chat
    onClose()
  }

  const switchToPhoneMode = () => {
    console.log('📞 Switching to phone mode...')
    setChatMode('phone')
    setIsVoiceActive(true)
    setIsRestarting(false)
    
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
        onClick={handleClose}
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
                          onClick={handleClose}
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
                  <div className="flex space-x-3">
                    <button
                      onClick={stopSpeaking}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                      <span>Stop</span>
                    </button>
                  </div>
                )}
                
                {!isSpeaking && !isListening && !isProcessingVoice && (
                  <button
                    onClick={startVoiceRecognition}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Retalk</span>
                  </button>
                )}
                
                {!isSpeaking && !isListening && !isProcessingVoice && (
                  <div className="text-center text-gray-500">
                    <Phone className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Mode conversation vocale actif</p>
                    <p className="text-xs">Parlez naturellement, je vous écoute</p>
                    {availableVoices.length > 0 && (
                      <p className="text-xs text-blue-500 mt-1">
                        🔊 Voix: {availableVoices.find(v => v.lang.startsWith('fr'))?.name || 'Par défaut'}
                      </p>
                    )}
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
