import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingMessageButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  // Handle scroll to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled > 300) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      navigate('/student/communication');
      // Since we're navigating away, we don't need to keep the floating button state
    }
  };

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{marginBottom: '20px'}}>
      <button
        onClick={toggleChat}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 group"
        aria-label="Open messages"
      >
        <MessageCircle size={28} className="group-hover:animate-pulse" />
        <span className="sr-only">Messages</span>
      </button>
    </div>
  );
};

export default FloatingMessageButton;