import React from 'react';
import { Message, Role, Character } from '../types';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  character: Character;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, character }) => {
  const isUser = message.role === Role.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isUser ? 'bg-indigo-600' : 'bg-gray-700'}`}>
            {isUser ? (
              <User size={16} className="text-white" />
            ) : (
              <img src={character.avatar} alt="Bot" className="w-8 h-8 rounded-full object-cover" />
            )}
          </div>
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <span className="text-xs text-gray-400 mb-1 px-1">
            {isUser ? 'You' : character.name}
          </span>
          <div 
            className={`relative px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md backdrop-blur-sm
              ${isUser 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-gray-800/80 text-gray-100 rounded-tl-none border border-white/5'
              }
            `}
          >
             <div className="whitespace-pre-wrap font-sans">
                {message.content}
                {message.isThinking && (
                  <span className="inline-flex ml-2 gap-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                  </span>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;