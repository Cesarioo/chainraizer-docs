'use client'

import { CheckCircle, LucideIcon } from 'lucide-react'

export default function Feature({ children, icon: Icon = CheckCircle }) {
  return (
    <div className="flex items-start gap-3 mb-4 group">
      <div className="mt-1">
        <div className="relative">
          <Icon className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
          <div className="absolute inset-0 animate-ping-slow bg-blue-500/20 rounded-full" />
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 