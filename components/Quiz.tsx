'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Trophy, Brain } from 'lucide-react'
import { cn } from "../lib/utils"
import LoadingQuizButton from './LoadingQuizButton'
import confetti from 'canvas-confetti'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthModal } from './AuthModal'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

interface QuizProps {
  content: string
  lesson: number
  onComplete?: (score: number) => void
}

export default function Quiz({ content, lesson, onComplete }: QuizProps) {
  const supabase = createClientComponentClient()
  const [isQuizLoading, setIsQuizLoading] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true)
  const [canAccessQuiz, setCanAccessQuiz] = useState(false)
  const [previousQuizCompleted, setPreviousQuizCompleted] = useState(false)

  useEffect(() => {
    const checkUserAndCompletion = async () => {
      setIsCheckingCompletion(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check if user has completed this quiz
        const { data: currentQuizData, error: currentQuizError } = await supabase
          .from('documentation_completion')
          .select()
          .eq('id', user.id)
          .eq('quizz_part', lesson)
          .eq('completed', true)
          .single()

        if (currentQuizData) {
          setHasCompletedQuiz(true)
        } else {
          setHasCompletedQuiz(false)
        }

        // Check if previous quiz was completed
        if (lesson > 1) {
          const { data: previousQuizData, error: previousQuizError } = await supabase
            .from('documentation_completion')
            .select()
            .eq('id', user.id)
            .eq('quizz_part', lesson - 1)
            .eq('completed', true)
            .single()

          setPreviousQuizCompleted(!!previousQuizData)
          setCanAccessQuiz(!!previousQuizData)
        } else {
          // For lesson 1, there's no previous quiz required
          setPreviousQuizCompleted(true)
          setCanAccessQuiz(true)
        }
      }
      setIsCheckingCompletion(false)
    }

    checkUserAndCompletion()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkUserAndCompletion()
      } else {
        setUser(null)
        setHasCompletedQuiz(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, lesson])

  const fireConfetti = () => {
    const end = Date.now() + 3000
    const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      })
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
      })
    }, 2000)
  }

  const handleGenerateQuiz = async () => {
    // Check if we already have a user session
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }

    if (isQuizLoading) return
    
    setIsQuizLoading(true)
    setError(null)

    const MAX_RETRIES = 3
    let currentRetry = 0
    let success = false

    while (!success && currentRetry < MAX_RETRIES) {
      try {
        const response = await fetch("/api/generate-quizz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            transcript: content,
            lesson: lesson 
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate quiz')
        }

        const data = await response.json()

        // Validate the response format
        if (data.questions && 
            Array.isArray(data.questions.questions) && 
            data.questions.questions.length > 0 &&
            data.questions.questions.every(q => 
              q.question && 
              Array.isArray(q.options) && 
              q.options.length > 0 && 
              q.correctAnswer
            )) {
          setQuizQuestions(data.questions.questions)
          setShowQuiz(true)
          setIsOpen(true)
          setIsCompleted(false)
          success = true
        } else {
          throw new Error('Invalid quiz format received')
        }
      } catch (error) {
        console.error(`Attempt ${currentRetry + 1} failed:`, error)
        currentRetry++
        
        if (currentRetry === MAX_RETRIES) {
          setError(error instanceof Error ? error.message : 'Failed to generate quiz after multiple attempts')
          setQuizQuestions([])
        } else {
          // Wait for a short time before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry)))
        }
      }
    }

    setIsQuizLoading(false)
  }

  const handleQuizCompletion = async (finalScore: number) => {
    setIsCompleted(true)
    if (onComplete) {
      onComplete(finalScore)
    }
    
    // Calculate pass threshold (80% or 4 out of 5)
    const passThreshold = quizQuestions.length * 0.8

    // If user passed the quiz
    if (finalScore >= passThreshold) {
      // Show confetti immediately for the achievement
      fireConfetti()
      
      // Then update the database
      try {
        console.log('Attempting to update completion status for:', {
          userId: user?.id,
          lesson,
          score: finalScore
        })

        if (!user?.id) {
          console.error('No user ID found')
          return
        }

        const { data, error } = await supabase
          .from('documentation_completion')
          .insert({
            id: user.id,
            quizz_part: lesson,
            completed: true
          })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Successfully updated completion status:', data)
      } catch (error) {
        console.error('Error updating completion status:', error)
        if (error instanceof Error) {
          setError(`Failed to save progress: ${error.message}`)
        }
      }
    }
  }

  const handleAnswerSelection = async (selectedOption: string) => {
    setSelectedAnswer(selectedOption)
    setShowAnswer(true)
    const correct = selectedOption === quizQuestions[currentQuestionIndex].correctAnswer
    setIsCorrect(correct)

    let finalScore = score
    if (correct) {
      finalScore = score + 1
      setScore(finalScore)
    }

    // Wait briefly before moving to next question
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Slide out current question
    setSlideDirection('left')
    await new Promise(resolve => setTimeout(resolve, 300))

    // If quiz is complete
    if (currentQuestionIndex === quizQuestions.length - 1) {
      await handleQuizCompletion(finalScore)
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1)
      setSlideDirection('right')
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowAnswer(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setShowQuiz(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setQuizQuestions([])
    setShowAnswer(false)
    setIsCompleted(false)
  }

  const handleAuthSuccess = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      setUser(currentUser)
      // Check if user has completed this quiz
      const { data, error } = await supabase
        .from('documentation_completion')
        .select()
        .eq('id', currentUser.id)
        .eq('quizz_part', lesson)
        .eq('completed', true)
        .single()

      if (data) {
        setHasCompletedQuiz(true)
      }
      setShowAuthModal(false)
      handleGenerateQuiz()
    }
  }

  return (
    <>
      <div className="flex justify-center my-8">
        {isCheckingCompletion ? (
          <div className="flex items-center gap-2 px-8 py-4 bg-gray-50 text-gray-700 rounded-2xl border-2 border-gray-200">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse" />
            <span className="text-lg font-medium">Checking completion status...</span>
          </div>
        ) : hasCompletedQuiz ? (
          <div className="flex items-center gap-2 px-8 py-4 bg-green-50 text-green-700 rounded-2xl border-2 border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-lg font-medium">Quiz Completed</span>
          </div>
        ) : !user ? (
          <LoadingQuizButton 
            isLoading={isQuizLoading} 
            onClick={() => setShowAuthModal(true)}
          />
        ) : !canAccessQuiz ? (
          <div className="flex items-center gap-2 px-8 py-4 bg-yellow-50 text-yellow-700 rounded-2xl border-2 border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-lg font-medium">Complete previous quiz first</span>
          </div>
        ) : (
          <LoadingQuizButton 
            isLoading={isQuizLoading} 
            onClick={handleGenerateQuiz}
          />
        )}
        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-gray-800/75 flex items-center justify-center animate-fadeIn backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative overflow-hidden animate-scaleIn border border-gray-100 mx-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            {!isCompleted ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-600" />
                      <h2 className="text-2xl font-bold text-gray-800">Knowledge Check</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-500">
                        Question {currentQuestionIndex + 1}/{quizQuestions.length}
                      </span>
                      <span className="text-sm font-medium text-indigo-600">
                        Score: {score}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={cn(
                  "transform transition-all duration-300",
                  slideDirection === 'left' ? 'translate-x-[-100%] opacity-0' : 
                  slideDirection === 'right' ? 'translate-x-0 opacity-100' : ''
                )}>
                  <p className="text-lg font-semibold text-gray-800 mb-6">
                    {quizQuestions[currentQuestionIndex].question}
                  </p>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelection(option)}
                        disabled={showAnswer}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                          selectedAnswer === option
                            ? isCorrect
                              ? 'bg-green-50 border-green-500 text-green-700 shadow-green-100'
                              : 'bg-red-50 border-red-500 text-red-700 shadow-red-100'
                            : 'hover:bg-gray-50 hover:border-indigo-200 border-gray-200 text-gray-700 hover:shadow-lg',
                          'transform hover:scale-[1.02] active:scale-[0.98]',
                          !showAnswer && 'hover:shadow-md',
                          'disabled:cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showAnswer && selectedAnswer === option && (
                            <div className="animate-scaleIn">
                              {isCorrect ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-fadeInUp">
                <h3 className="text-2xl font-bold text-gray-800">Quiz Complete!</h3>
                <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <p className="text-5xl font-bold text-indigo-600 mb-3">
                    {score} / {quizQuestions.length}
                  </p>
                  <p className="text-gray-600 text-lg">
                    {score >= (quizQuestions.length * 0.8) ? (
                      <span className="font-medium text-green-600">
                        🎉 Excellent work! You've passed!
                      </span>
                    ) : (
                      <span className="font-medium text-indigo-600">
                        Keep going! You're almost there!
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                    transition-all duration-200 hover:shadow-lg font-medium"
                >
                  Finish Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
} 