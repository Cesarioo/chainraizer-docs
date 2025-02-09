// src/components/VideoConference.tsx

'use client'

import React, { useState } from "react";
import { MessageSquare, Phone, Video, X } from 'lucide-react';
import Image from 'next/image';
import TextSupport from './TextSupport';
import CallModal from './CallModal';

const LOUISE_IMAGE = "https://pub-44b2544c34a4482595a3ab438ff68918.r2.dev/waifu/intro.jpg";

const VideoConference = ({ 
  onMessageSent, 
  onVideoStarted, 
  onCallStarted,
  usageMessages = 0,
  usageVocal = 0,
  usageVisio = 0,
  messageLimit = 100,
  vocalLimit = 100,
  visioLimit = 100
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const handleMainButtonClick = () => {
    if (isExpanded) {
      setIsExiting(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsExiting(false);
      }, 300);
    } else {
      setIsExpanded(true);
      setIsExiting(false);
    }
  };

  const handleTextClick = () => {
    if (usageMessages >= messageLimit) {
      alert('Vous avez atteint votre limite de messages.');
      return;
    }
    setIsTextModalOpen(true);
    setIsExpanded(false);
  };

  const handleCallClick = () => {
    if (usageVocal >= vocalLimit) {
      alert('You have reached your call limit.');
      return;
    }
    setIsCallModalOpen(true);
    setIsExpanded(false);
  };

  const handleMessageSent = async (increment) => {
    if (onMessageSent) {
      await onMessageSent(increment);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      <div className="relative flex flex-col items-end gap-4">
        {(isExpanded || isExiting) && (
          <>
            <button 
              className={`action-button write-button ${isExiting ? 'exit' : ''} ${
                usageMessages >= messageLimit ? '!bg-gray-400 !hover:bg-gray-400 !cursor-not-allowed' : ''
              }`}
              onClick={handleTextClick}
              disabled={usageMessages >= messageLimit}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="button-label">Write</span>
            </button>
            <button 
              className={`action-button call-button ${isExiting ? 'exit' : ''} ${
                usageVocal >= vocalLimit ? '!bg-gray-400 !hover:bg-gray-400 !cursor-not-allowed' : ''
              }`}
              onClick={handleCallClick}
              disabled={usageVocal >= vocalLimit}
              aria-label="Start call"
            >
              <Phone className="w-5 h-5" />
              <span className="button-label">Call</span>
            </button>
            <button 
              className={`action-button video-button ${isExiting ? 'exit' : ''} !bg-gray-400 !hover:bg-gray-400 !cursor-not-allowed`}
              disabled={true}
              aria-label="Video call coming soon"
              title="Coming soon"
            >
              <Video className="w-5 h-5" />
              <span className="button-label">Video</span>
            </button>
          </>
        )}

        <button 
          className={`main-button ${isExpanded ? 'expanded' : ''} flex items-center gap-2`}
          onClick={handleMainButtonClick}
          style={{
            backgroundColor: isExpanded ? '#dc2626' : '#2563eb',
            width: isExpanded ? '48px' : '150px',
            height: '48px',
            padding: isExpanded ? '0.75rem' : '0.5rem 1rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            color: 'white',
            position: 'relative'
          }}
        >
          <span style={{ 
            position: 'absolute',
            opacity: isExpanded ? 0 : 1,
            transition: 'opacity 0.15s ease-out',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            left: '1rem'
          }}>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
              <Image 
                src={LOUISE_IMAGE}
                alt="Louise"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <span>Get Help</span>
          </span>
          {isExpanded && (
            <X className="absolute w-6 h-6" style={{
              opacity: 1,
              transform: 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          )}
        </button>
      </div>

      {/* Text Support Modal */}
      <TextSupport 
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onMessageSent={handleMessageSent}
      />

      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
};

export default VideoConference;