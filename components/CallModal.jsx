import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const CallModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add global styles to force widget positioning
      const style = document.createElement('style');
      style.textContent = `
        elevenlabs-convai {
          position: static !important;
          bottom: auto !important;
          right: auto !important;
          margin: 0 !important;
        }
      `;
      document.head.appendChild(style);

      const script = document.createElement('script');
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);

      return () => {
        if (script) {
          document.body.removeChild(script);
        }
        if (style) {
          document.head.removeChild(style);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[1001] bg-black/50"
        onClick={onClose}
      />
      <div 
        className="fixed inset-0 z-[1002] flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          style={{ 
            pointerEvents: 'auto',
            position: 'relative',
            width: 'auto',
            height: 'auto'
          }}
        >
          <elevenlabs-convai 
            agent-id="oWGu8ycycPcom7JO1Xsi"
            style={{
              position: 'static',
              bottom: 'auto',
              right: 'auto',
              margin: 0
            }}
          />
        </div>
      </div>
    </>,
    document.body
  );
};

export default CallModal; 