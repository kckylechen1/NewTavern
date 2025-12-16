import React from 'react';
import { Character } from '../types';
import { Users, Plus } from 'lucide-react';

interface CharacterListProps {
  characters: Character[];
  selectedId: string;
  onSelect: (character: Character) => void;
  isCollapsed: boolean;
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, selectedId, onSelect, isCollapsed }) => {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-4`}>
        {!isCollapsed && <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2"><Users size={20} /> Contacts</h2>}
        {isCollapsed && <Users size={24} className="text-gray-400" />}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 px-2">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
              ${selectedId === char.id 
                ? 'bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                : 'hover:bg-white/5 border border-transparent'
              }
            `}
          >
            <div className="relative shrink-0">
              <img 
                src={char.avatar} 
                alt={char.name} 
                className={`w-12 h-12 rounded-full object-cover ring-2 transition-all duration-300 ${selectedId === char.id ? 'ring-primary' : 'ring-gray-700 group-hover:ring-gray-500'}`}
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${selectedId === char.id ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col items-start text-left overflow-hidden">
                <span className={`font-medium truncate w-full ${selectedId === char.id ? 'text-white' : 'text-gray-300'}`}>
                  {char.name}
                </span>
                <span className="text-xs text-gray-500 truncate w-full">
                  {char.description}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
         <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} bg-white/5 hover:bg-white/10 text-gray-300 p-3 rounded-xl border border-white/5 transition-colors`}>
            <Plus size={20} />
            {!isCollapsed && <span>Create Character</span>}
         </button>
      </div>
    </div>
  );
};

export default CharacterList;