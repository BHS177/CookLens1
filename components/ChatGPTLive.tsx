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
  VolumeX,
  Crown,
  Lock
} from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { SignInButton } from '@clerk/nextjs'
import SubscriptionPrompt from './SubscriptionPrompt'

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
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('')
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false)
  
  const { isSubscribed } = useSubscription()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | HTMLAudioElement | null>(null)

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
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }
    
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
      if (isVoiceActive) {
        speakText(data.response)
      }

    } catch (error) {
      console.error('Erreur ChatGPT:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée sur votre navigateur')
      return
    }

    // Safari-specific: Check if we're in a secure context
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      alert('La reconnaissance vocale nécessite HTTPS sur Safari. Veuillez utiliser HTTPS ou localhost.')
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
    setAccumulatedTranscript('')
    
    // Reset the last processed time to ensure fresh start
    setLastProcessedTime(Date.now())

    console.log('🎤 Starting voice recognition...')
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    // Safari-specific configuration
    recognitionRef.current.continuous = true // Safari works better with continuous
    recognitionRef.current.interimResults = true // Enable interim results for better feedback
    recognitionRef.current.lang = 'fr-FR'
    recognitionRef.current.maxAlternatives = 1 // Safari works better with 1 alternative
    
    // Safari-specific: Use continuous mode for longer speech
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      console.log('🎤 Safari mode: Using continuous mode for longer speech')
    }
    
    // Safari-specific: Add serviceURI for better recognition
    if ('serviceURI' in recognitionRef.current) {
      recognitionRef.current.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up'
    }
    
    // Safari-specific: Set grammars for better recognition
    if ('grammars' in recognitionRef.current) {
      recognitionRef.current.grammars = new (window as any).SpeechGrammarList()
    }
    
    // Safari-specific: Add abort timeout to prevent hanging
    const abortTimeout = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        console.log('🎤 Safari timeout - aborting recognition')
        recognitionRef.current.abort()
      }
    }, 30000) // 30 second timeout

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setIsRestarting(false)
      clearTimeout(abortTimeout) // Clear abort timeout when started
      console.log('🎤 Voice recognition started')
    }

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎤 Raw results:', event.results)
      console.log('🎤 Result index:', event.resultIndex)
      console.log('🎤 Results length:', event.results.length)
      
      // Handle both interim and final results for Safari
      let finalTranscript = ''
      let maxConfidence = 0
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as any
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        
        console.log(`🎤 Result ${i}:`, { transcript, confidence, isFinal: result.isFinal })
        
        if (result.isFinal) {
          finalTranscript = transcript
          maxConfidence = confidence
          console.log('🎤 Final transcript:', transcript, 'Confidence:', confidence)
        } else {
          interimTranscript = transcript
          console.log('🎤 Interim transcript:', transcript)
        }
      }
      
      // For Safari: Handle interim and final results properly
      if (interimTranscript) {
        console.log('🎤 Showing interim transcript:', interimTranscript)
        // For interim results, show accumulated + current interim
        setAccumulatedTranscript(prev => {
          const words = prev.split(' ')
          const lastWord = words[words.length - 1]
          const baseTranscript = interimTranscript.includes(lastWord) ? words.slice(0, -1).join(' ') : prev
          return baseTranscript + (baseTranscript ? ' ' : '') + interimTranscript
        })
      }
      
      if (finalTranscript && finalTranscript.trim().length > 0) {
        console.log('🎤 Processing final transcript:', finalTranscript)
        // For final results, add to the existing transcript
        setAccumulatedTranscript(prev => {
          const newTranscript = prev + (prev ? ' ' : '') + finalTranscript
          console.log('🎤 Final accumulated transcript:', newTranscript)
          return newTranscript
        })
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Voice recognition error:', event.error)
      console.error('🎤 Error details:', event)
      setIsListening(false)
      setIsRestarting(false)
      
      // Handle Safari-specific errors
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.')
      } else if (event.error === 'no-speech') {
        console.log('🎤 No speech detected')
        // Safari: Auto-retry for no-speech errors
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          setTimeout(() => {
            if (isVoiceActive && !isListening) {
              console.log('🎤 Safari - Retrying after no-speech error...')
              startVoiceRecognition()
            }
          }, 1000)
        }
        return
      } else if (event.error === 'audio-capture') {
        alert('Microphone not found. Please check your microphone connection.')
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection.')
      } else if (event.error === 'aborted') {
        console.log('🎤 Recognition aborted (normal)')
        return
      } else {
        console.log('🎤 Voice recognition stopped due to error:', event.error)
        alert(`Voice recognition error: ${event.error}`)
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setIsRestarting(false)
      clearTimeout(abortTimeout) // Clear abort timeout when ended
      console.log('🎤 Voice recognition ended')
      
      // Safari: Auto-restart continuously for longer speech
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && 
          chatMode === 'phone' && isVoiceActive) {
        console.log('🎤 Safari - Auto-restarting recognition for continuous speech...')
        setTimeout(() => {
          if (isVoiceActive && !isListening) {
            startVoiceRecognition()
          }
        }, 100) // Very short delay for continuous recognition
      }
    }

    try {
      recognitionRef.current.start()
      
      // Safari timeout mechanism - if recognition doesn't start within 3 seconds, show error
      setTimeout(() => {
        if (!isListening) {
          console.log('🎤 Recognition timeout - restarting...')
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop()
              setTimeout(() => {
                if (recognitionRef.current) {
                  recognitionRef.current.start()
                }
              }, 100)
            } catch (e) {
              console.error('Error restarting recognition:', e)
            }
          }
        }
      }, 3000)
      
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsListening(false)
      
      // Safari-specific: Try again after a short delay
      if (error instanceof Error && error.message && error.message.includes('already started')) {
        console.log('🎤 Recognition already started, trying again...')
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.error('Error restarting recognition:', e)
            }
          }
        }, 100)
      }
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
    if (synthesisRef.current && 'pause' in synthesisRef.current) {
      (synthesisRef.current as HTMLAudioElement).pause()
      ;(synthesisRef.current as HTMLAudioElement).currentTime = 0
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

  const switchToPhoneMode = async () => {
    if (!isSubscribed) {
      setShowSubscriptionPrompt(true)
      return
    }
    
    console.log('📞 Switching to phone mode...')
    setChatMode('phone')
    setIsVoiceActive(true)
    setIsRestarting(false)
    
    // Stop any current recognition first
    stopVoiceRecognition()
    
    // Safari-specific: Request microphone permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('🎤 Requesting microphone permission...')
        await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('🎤 Microphone permission granted')
      }
    } catch (error) {
      console.error('🎤 Microphone permission denied:', error)
      alert('Microphone access is required for voice recognition. Please allow microphone access and try again.')
      return
    }
    
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
      {showSubscriptionPrompt && (
        <SubscriptionPrompt onClose={() => setShowSubscriptionPrompt(false)} />
      )}
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col mx-2 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">ChatGPT Live</h3>
                <p className="text-xs sm:text-sm text-gray-500">Assistant culinaire</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                onClick={switchToMessageMode}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  chatMode === 'message' ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mode message (texte)"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Message</span>
              </button>
              
              <button
                onClick={switchToPhoneMode}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  chatMode === 'phone' ? 'bg-green-100 text-green-600 border-2 border-green-300 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mode téléphone (conversation vocale) - Pro"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Phone</span>
                <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-500" />
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
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`px-3 sm:px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
              <div className="mt-2 sm:mt-4 flex flex-col items-center space-y-2 sm:space-y-3 p-2 sm:p-0">
                <div className="flex items-center space-x-4">
                  {isListening && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">J&apos;écoute...</span>
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
                
                {/* Safari-specific instructions */}
                <div className="text-center text-xs sm:text-sm text-gray-600 bg-blue-50 p-2 sm:p-3 rounded-lg w-full">
                  <p className="font-medium mb-1">🎤 Mode vocal activé</p>
                  <p className="text-xs sm:text-sm">
                    {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') 
                      ? 'Parlez maintenant - cliquez sur "Transcrire" quand vous avez fini'
                      : 'Parlez maintenant - votre voix sera transcrit et envoyée automatiquement'
                    }
                  </p>
                  <p className="text-xs mt-1 text-gray-500">
                    {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') 
                      ? 'Safari: Assurez-vous que le microphone est autorisé et que vous êtes sur HTTPS'
                      : 'Assurez-vous que le microphone est autorisé'
                    }
                  </p>
                </div>
                
                {/* Show accumulated transcript for Safari */}
                {(isListening || accumulatedTranscript) && (
                  <div className="w-full bg-gray-50 p-2 sm:p-3 rounded-lg border">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      {isListening 
                        ? (accumulatedTranscript ? 'Transcription en cours :' : 'Écoute en cours...')
                        : 'Transcription terminée :'
                      }
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                      {accumulatedTranscript || 'Parlez maintenant...'}
                    </p>
                    {isListening && !accumulatedTranscript && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Manual transcribe button for Safari */}
                {accumulatedTranscript && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full">
                    <button
                      onClick={() => {
                        console.log('🎤 Manual transcribe triggered')
                        if (recognitionRef.current) {
                          recognitionRef.current.stop()
                        }
                        
                        // Process accumulated transcript
                        if (accumulatedTranscript && accumulatedTranscript.trim().length > 2) {
                          console.log('🎤 Processing accumulated transcript:', accumulatedTranscript)
                          setInputMessage(accumulatedTranscript)
                          
                          // Always use sendMessage for consistency
                          sendMessage(accumulatedTranscript)
                          
                          // Clear transcript after processing
                          setAccumulatedTranscript('')
                        } else {
                          console.log('🎤 No accumulated transcript to process')
                        }
                      }}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base"
                    >
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>Transcrire</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log('🎤 Restarting voice recognition...')
                        setAccumulatedTranscript('')
                        startVoiceRecognition()
                      }}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base"
                    >
                      <span>Recommencer</span>
                    </button>
                  </div>
                )}
                
                {isSpeaking && (
                  <div className="flex justify-center w-full">
                    <button
                      onClick={stopSpeaking}
                      className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                      <span>Stop</span>
                    </button>
                  </div>
                )}
                
                 {!isSpeaking && !isListening && !isProcessingVoice && !accumulatedTranscript && (
                   <div className="flex flex-col items-center space-y-2 w-full">
                     <button
                       onClick={() => {
                         console.log('🎤 Starting voice recognition...')
                         // Reset all voice states
                         setIsVoiceActive(true)
                         setIsRestarting(false)
                         setAccumulatedTranscript('')
                         setInputMessage('')
                         // Stop any existing recognition
                         if (recognitionRef.current) {
                           recognitionRef.current.stop()
                         }
                         // Start fresh recognition
                         setTimeout(() => {
                           startVoiceRecognition()
                         }, 100)
                       }}
                       className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base"
                     >
                       <Mic className="w-4 h-4" />
                       <span>🎤 Parler</span>
                     </button>
                     
                     {/* Safari-specific retry button */}
                     {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && (
                       <div className="flex flex-col space-y-2">
                         <button
                           onClick={async () => {
                             console.log('🔄 Safari retry - requesting permissions again')
                             try {
                               if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                 await navigator.mediaDevices.getUserMedia({ audio: true })
                                 console.log('🎤 Safari permission granted, starting recognition')
                                 startVoiceRecognition()
                               }
                             } catch (error) {
                               console.error('🎤 Safari permission still denied:', error)
                               alert('Permission refusée. Veuillez autoriser le microphone dans les paramètres Safari.')
                             }
                           }}
                           className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                         >
                           🔄 Réessayer Safari
                         </button>
                         
                         <button
                           onClick={() => {
                             console.log('🔍 Safari Debug Info:')
                             console.log('- User Agent:', navigator.userAgent)
                             console.log('- Speech Recognition Support:', 'webkitSpeechRecognition' in window)
                             console.log('- Media Devices:', !!navigator.mediaDevices)
                             console.log('- Current State:', { isListening, isVoiceActive, accumulatedTranscript })
                             console.log('- Recognition Ref:', recognitionRef.current)
                             alert('Debug info logged to console. Check browser console for details.')
                           }}
                           className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                         >
                           🔍 Debug Safari
                         </button>
                       </div>
                     )}
                   </div>
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
