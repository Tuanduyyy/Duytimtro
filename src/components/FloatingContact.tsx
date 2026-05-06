import React from 'react';
import { MessageCircle, Phone, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRooms } from '../context/RoomContext';

export default function FloatingContact() {
  const { settings } = useRooms();
  const [isOpen, setIsOpen] = React.useState(false);

  const contacts = [
    {
      name: 'Zalo',
      icon: <MessageCircle size={24} />,
      color: 'bg-blue-500',
      href: settings.zalo,
      label: 'Chat Zalo'
    },
    {
      name: 'Messenger',
      icon: <Facebook size={24} />,
      color: 'bg-blue-600',
      href: settings.fanpage,
      label: 'Messenger'
    },
    {
      name: 'Hotline',
      icon: <Phone size={24} />,
      color: 'bg-green-500',
      href: `tel:${settings.hotline}`,
      label: 'Gọi hotline'
    }
  ];

  return (
    <div className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-[100] flex flex-col items-end gap-2 md:gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-2 items-end mb-1">
            {contacts.map((contact, idx) => (
              <motion.a
                key={contact.name}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: idx * 0.1 }}
                className={`${contact.color} text-white p-2.5 md:p-3 rounded-full shadow-2xl flex items-center gap-3 group relative hover:scale-110 active:scale-95 transition-all`}
              >
                <span className="absolute right-full mr-4 bg-white text-primary px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 hidden md:block">
                  {contact.label}
                </span>
                {React.cloneElement(contact.icon as React.ReactElement, { size: 18 })}
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-primary rotate-45' : 'bg-accent'} text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 0 }}
          className="relative"
        >
          {isOpen ? (
            <svg width="18" height="18" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          ) : (
            <div className="relative">
              <MessageCircle size={20} className="md:w-6 md:h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-accent animate-pulse"></span>
            </div>
          )}
        </motion.div>
      </button>
    </div>
  );
}
