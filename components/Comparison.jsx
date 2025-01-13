'use client'

import { Building2, Rocket, Lock, Unlock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const ICONS = {
  "Accessibility": { traditional: Building2, web3: Rocket },
  "Liquidity": { traditional: Lock, web3: Unlock },
  "Transparency": { traditional: EyeOff, web3: Eye }
}

export default function Comparison({ traditional, web3, title }) {
  const IconTraditional = ICONS[title]?.traditional || Building2
  const IconWeb3 = ICONS[title]?.web3 || Rocket

  return (
    <div className="w-full my-12">
      <div className="relative">
        {/* Title Bar */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-2 rounded-full shadow-lg z-10">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>

        {/* Main Container */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-gray-50 to-gray-100" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-blue-100" />
          
          <div className="relative grid grid-cols-2 min-h-[200px]">
            {/* Traditional Side */}
            <div className="p-8 pr-12 border-r border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gray-200/80 rounded-2xl shadow-inner">
                  <IconTraditional className="h-8 w-8 text-gray-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Traditional Finance</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">{traditional}</p>
            </div>

            {/* Web3 Side */}
            <div className="p-8 pl-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner">
                  <IconWeb3 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900">ChainRaizer Solution</h4>
              </div>
              <p className="text-blue-800 leading-relaxed">{web3}</p>
            </div>

            {/* Center Divider */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 