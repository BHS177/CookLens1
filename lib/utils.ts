import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

export function formatDifficulty(difficulty: string): string {
  const difficultyMap = {
    'facile': 'Facile',
    'moyen': 'Moyen',
    'difficile': 'Difficile'
  }
  
  return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty
}

export function formatCuisine(cuisine: string): string {
  return cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
}

export function formatDiet(diet: string): string {
  return diet.charAt(0).toUpperCase() + diet.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

