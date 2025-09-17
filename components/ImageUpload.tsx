'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, X, Image as ImageIcon, Smartphone } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  onSkipDetection?: () => void
}

export default function ImageUpload({ onImageUpload, onSkipDetection }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (10MB limit for upload, will be optimized later)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('L\'image est trop grande. Veuillez choisir une image de moins de 10MB.')
        return
      }
      
      // Optimize image quality for better detection
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        
        // Optimize the image for better ChatGPT detection
        optimizeImageForUpload(result).then(optimizedResult => {
          onImageUpload(optimizedResult)
        }).catch(error => {
          console.warn('Image optimization failed, using original:', error)
          onImageUpload(result)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Optimize image for better ChatGPT Vision detection
  const optimizeImageForUpload = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Calculate optimal dimensions for better detection
        const maxDimension = 1024 // Optimal for ChatGPT Vision
        const minDimension = 512
        
        let { width, height } = img
        
        // Scale down if too large, maintain aspect ratio
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        // Scale up if too small for better detection
        if (width < minDimension && height < minDimension) {
          const ratio = Math.max(minDimension / width, minDimension / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        // High-quality image processing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw image with high quality
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to high-quality JPEG (better for food detection)
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        resolve(optimizedDataUrl)
      }
      
      img.onerror = () => {
        reject(new Error('Could not load image for optimization'))
      }
      
      img.src = imageUrl
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCameraDialog = () => {
    cameraInputRef.current?.click()
  }

  const removeImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('home.upload.title')}
          </h2>
          <p className="text-gray-600">
            L&apos;IA détectera automatiquement les ingrédients disponibles
          </p>
        </div>

        {!preview ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-200 ${
              dragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-primary-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Glissez-déposez votre image ici
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('home.upload.subtitle')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={openCameraDialog}
                    className="btn-primary inline-flex items-center justify-center space-x-2 px-6 py-3 text-base font-medium"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>{t('home.upload.takePhoto')}</span>
                  </button>
                  
                  <button
                    onClick={openFileDialog}
                    className="btn-secondary inline-flex items-center justify-center space-x-2 px-6 py-3 text-base font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{t('home.upload.chooseImage')}</span>
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>Formats supportés: JPG, PNG, WebP (max 10MB)</p>
                <p className="text-xs text-green-600 font-medium">
                  ✨ Qualité optimisée automatiquement pour une meilleure détection
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  💡 {t('home.upload.mobileTip')}
                </p>
              </div>
              
              {/* Skip Detection Button */}
              {onSkipDetection && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Ou ajoutez vos ingrédients manuellement
                  </p>
                  <button
                    onClick={onSkipDetection}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium underline transition-colors duration-200"
                  >
                    Ajouter les ingrédients manuellement →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Frigo uploadé"
                className="w-full h-64 sm:h-80 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Image prête pour l&apos;analyse
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={openCameraDialog}
                  className="btn-primary inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t('home.upload.retakePhoto')}</span>
                </button>
                <button
                  onClick={openFileDialog}
                  className="btn-secondary inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{t('home.upload.changeImage')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
