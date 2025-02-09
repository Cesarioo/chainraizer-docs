import React, { useState, useRef, useEffect } from 'react';
import { Send, X, ChevronDown, User } from 'lucide-react';
import Image from 'next/image';

const PROFESSOR_IMAGE = "https://pub-44b2544c34a4482595a3ab438ff68918.r2.dev/waifu/intro.jpg";

const TextSupport = ({ isOpen, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Gmgm, I'm Louise, Raizer's Quant. Happy to respond any questions you'll have!",
      sender: 'professor',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
  
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
  
    await onMessageSent(1);
  
    try {
      const response = await fetch('/api/text-support-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });
  
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const professorMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: 'professor',
        timestamp: new Date(data.timestamp)
      };
  
      setMessages(prev => [...prev, professorMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl h-[700px] rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center font-semibold text-lg border border-white/20 overflow-hidden">
              <Image 
                src={PROFESSOR_IMAGE}
                alt="Professor Martin"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Louise I Raizer Quant</h2>
              <p className="text-sm text-blue-100">
                {isTyping ? 'Writing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={scrollToBottom} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'professor' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                  <Image 
                    src={PROFESSOR_IMAGE}
                    alt="Professor Martin"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className={`flex flex-col gap-1 ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              }`}>
                <div className={`p-4 rounded-2xl text-sm shadow-sm inline-block ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none rounded-bl-2xl' 
                    : 'bg-white text-gray-800 rounded-tl-none rounded-br-2xl border border-gray-100'
                }`}>
                  {message.text}
                </div>
                <div className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-1 border border-white/10">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image 
                  src={PROFESSOR_IMAGE}
                  alt="Professor Martin"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-1 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex items-end gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message ici..."
            rows={1}
            className="flex-1 resize-none p-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 max-h-[120px] text-sm"
          />
          <button 
            type="submit"
            className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            disabled={!inputValue.trim()}
            aria-label="Envoyer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextSupport;