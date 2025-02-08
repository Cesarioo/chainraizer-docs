'use client'

import { Building2, Briefcase, GraduationCap, Github, Linkedin, Twitter, Quote } from "lucide-react"

export default function TeamMember({ member }) {
  return (
    <div className="w-full mb-12">
      <div className="relative rounded-2xl overflow-hidden bg-[#F8FAFF] hover:shadow-lg transition-all duration-300">
        {/* Header Section */}
        <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Profile Image */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Name, Role, and Bio */}
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2">{member.name}</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 mb-3">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900 font-medium">{member.role}</span>
              </div>
              <p className="text-base text-gray-600 leading-relaxed max-w-2xl">{member.bio}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Quote Section */}
          <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
            <Quote className="h-6 w-6 text-blue-600 mb-3" />
            <p className="text-base sm:text-lg text-gray-600 italic leading-relaxed">{member.quote}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Education Column */}
            <div className="bg-white rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Education</h4>
              </div>
              <div className="space-y-4">
                {member.education.map((edu, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white" />
                    <h5 className="text-base font-medium text-gray-900">{edu}</h5>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Column */}
            <div className="bg-white rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-100">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Meaningful Experience</h4>
              </div>
              {member.experience.slice(0, 1).map((exp, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white" />
                  <h5 className="text-base font-medium text-gray-900 mb-1">{exp.role}</h5>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-blue-600 font-medium">{exp.company}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{exp.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3 pt-4">
            {member.social.github && (
              <a 
                href={member.social.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-600" />
              </a>
            )}
            {member.social.linkedin && (
              <a 
                href={member.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-gray-600" />
              </a>
            )}
            {member.social.twitter && (
              <a 
                href={member.social.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Twitter className="h-5 w-5 text-gray-600" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 