'use client'

import React from 'react'
import { Brain } from 'lucide-react'

export interface LoadingQuizButtonProps {
  isLoading: boolean
  onClick: () => void
}

const LoadingQuizButton = ({ isLoading, onClick }: LoadingQuizButtonProps) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`
      relative overflow-hidden
      px-8 py-4 rounded-2xl
      text-base font-medium
      transition-all duration-300
      min-w-[280px] h-[64px]
      group
      ${isLoading 
        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-gradient cursor-wait shadow-xl shadow-indigo-500/25' 
        : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20'
      }
      disabled:opacity-90
      transform hover:scale-[1.03] active:scale-[0.98]
      motion-safe:animate-bounce-subtle
    `}
  >
    <div className="relative flex items-center justify-center gap-3">
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-white animate-pulse" />
          <span className="text-white text-lg">Generating Quiz</span>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          <Brain className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform duration-200 group-hover:animate-pulse" />
          <span className="text-gray-700 group-hover:text-gray-900 text-lg">
            Start Knowledge Check
          </span>
        </>
      )}
    </div>
    <div className="absolute -z-10 inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110" />
  </button>
)

export default LoadingQuizButton 