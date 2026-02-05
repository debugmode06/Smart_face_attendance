import { useState } from "react";
import { MessageCircle } from "lucide-react";
import SendMessage from "../pages/SendMessage";

export default function FloatingMessageButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center gap-3 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline-block font-semibold text-sm pr-1 max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 whitespace-nowrap">
          Send Message
        </span>
      </button>

      {/* Message Modal */}
      <SendMessage isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
