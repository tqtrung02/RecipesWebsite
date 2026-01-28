'use client';

import { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    // Load chatbot scripts
    if (typeof window !== 'undefined') {
      // Set API base URL for chatbot (accessible in client-side)
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      (window as any).API_BASE_URL = apiBaseUrl;
      
      // Check if scripts already exist to avoid duplicates
      const existingScript1 = document.querySelector('script[src="/js/script.js"]');
      const existingScript2 = document.querySelector('script[src="/js/chatbot.js"]');
      
      if (!existingScript1) {
        const script1 = document.createElement('script');
        script1.src = '/js/script.js';
        script1.async = true;
        document.body.appendChild(script1);
      }
      
      if (!existingScript2) {
        const script2 = document.createElement('script');
        script2.src = '/js/chatbot.js';
        script2.async = true;
        document.body.appendChild(script2);
      }

      return () => {
        // Cleanup scripts if they exist
        const script1 = document.querySelector('script[src="/js/script.js"]');
        const script2 = document.querySelector('script[src="/js/chatbot.js"]');
        if (script1 && script1.parentNode) {
          script1.parentNode.removeChild(script1);
        }
        if (script2 && script2.parentNode) {
          script2.parentNode.removeChild(script2);
        }
      };
    }
  }, []);

  return (
    <div 
      id="chatbot-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div 
        id="chat-toggle" 
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).toggleChat) {
            (window as any).toggleChat();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Mở chatbot"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (typeof window !== 'undefined' && (window as any).toggleChat) {
              (window as any).toggleChat();
            }
          }
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '28px', position: 'relative', zIndex: 1 }}></i>
      </div>
      
      <div 
        id="chat-box"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '400px',
          height: '600px',
          maxHeight: 'calc(100vh - 140px)',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
      >
        <div 
          id="chat-header"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 24px',
            fontWeight: 600,
            fontSize: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px' }}>
            👨‍🍳 Trợ lý nấu ăn
          </span>
          <button 
            id="chat-close" 
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).toggleChat) {
                (window as any).toggleChat();
              }
            }} 
            aria-label="Đóng chatbot"
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '22px',
              fontWeight: 300,
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      
        <div 
          id="chat-body"
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#f5f7fa',
            scrollBehavior: 'smooth',
          }}
        ></div>
      
        <div 
          id="chat-input-area"
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            gap: '10px',
            background: 'linear-gradient(to top, #ffffff 0%, #f8f9fa 100%)',
            alignItems: 'flex-end',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <textarea 
            id="chat-input" 
            placeholder="Nhập câu hỏi của bạn..." 
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '2px solid #e2e8f0',
              fontSize: '15px',
              fontFamily: "'Noto Sans', sans-serif",
              resize: 'none',
              minHeight: '48px',
              maxHeight: '120px',
              backgroundColor: '#ffffff',
            }}
          ></textarea>
          <button 
            id="chat-send" 
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).sendMessage) {
                (window as any).sendMessage();
              }
            }}
            type="button"
            aria-label="Gửi tin nhắn"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              fontWeight: 600,
              borderRadius: '24px',
              cursor: 'pointer',
              minHeight: '48px',
              minWidth: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
