
import React, { useState, useEffect, useRef } from 'react';
import { CHARACTERS, DEFAULT_CONFIG } from './constants';
import { Character, Message, Role, ChatConfig } from './types';
import { createChatSession, sendMessageStream, initializeGenAI } from './services/geminiService';
import CharacterList from './components/CharacterList';
import MessageBubble from './components/MessageBubble';
import SettingsPanel from './components/SettingsPanel';
import { Send, Menu, Settings as SettingsIcon, Maximize2, Minimize2, Trash2, Sparkles, X, Mic } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CONFIG);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
           if (event.results[i].isFinal) {
              newTranscript += event.results[i][0].transcript;
           }
        }
        if (newTranscript) {
            setInputText(prev => {
                const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                return prev + spacer + newTranscript;
            });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
            setIsListening(false);
        }
    }
  };

  useEffect(() => {
    startNewChat();
    setMobileMenuOpen(false);
  }, [selectedCharacter.id]); 

  const startNewChat = () => {
    const greeting: Message = {
      id: 'init-' + Date.now(),
      role: Role.Model,
      content: selectedCharacter.firstMessage,
      timestamp: Date.now()
    };
    setMessages([greeting]);
    try {
      createChatSession(selectedCharacter, config);
    } catch (e) {
      console.error("Failed to initialize chat session:", e);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.User,
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
        id: botMsgId,
        role: Role.Model,
        content: '',
        timestamp: Date.now(),
        isThinking: true
    }]);

    try {
      const stream = sendMessageStream(userMsg.content);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
            ? { ...msg, content: fullResponse, isThinking: false } 
            : msg
        ));
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
        ? { ...msg, content: "ERROR: Connection severed. The ether is silent.", isThinking: false } 
        : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
     if(window.confirm("Reset this conversation with new settings?")) {
        startNewChat();
     }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-100 bg-black selection:bg-primary/30 selection:text-white"
         style={{ fontSize: `${config.fontSize}px` }}
    >
      
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
        style={{ 
            backgroundImage: `url(${selectedCharacter.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            filter: `blur(${config.backgroundBlur}px)`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-[#0B0F17]/80 to-[#0B0F17] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-full">
        
        {/* Left Sidebar */}
        <aside 
          className={`${leftSidebarOpen ? 'w-80' : 'w-20'} hidden md:flex flex-col glass-panel border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-30`}
        >
             <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${leftSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                      <Sparkles size={16} />
                   </div>
                   <span className="font-bold text-lg tracking-tight text-white">ETHERIA <span className="text-primary">V2</span></span>
                </div>
                <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
                    {leftSidebarOpen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <CharacterList 
                    characters={CHARACTERS} 
                    selectedId={selectedCharacter.id} 
                    onSelect={setSelectedCharacter} 
                    isCollapsed={!leftSidebarOpen}
                />
             </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden flex flex-col animate-in fade-in slide-in-from-left-10 duration-200">
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                    <span className="font-bold text-lg">Select Persona</span>
                    <button onClick={() => setMobileMenuOpen(false)}><X /></button>
                </div>
                <CharacterList 
                    characters={CHARACTERS} 
                    selectedId={selectedCharacter.id} 
                    onSelect={setSelectedCharacter} 
                    isCollapsed={false}
                />
            </div>
        )}

        {/* Center Chat Area */}
        <main className="flex-1 flex flex-col h-full min-w-0 relative z-20">
            
            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-8 backdrop-blur-sm z-20">
                <div className="flex items-center gap-4 md:hidden">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-gray-300 p-2 hover:bg-white/5 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-lg">{selectedCharacter.name}</span>
                </div>
                
                <div className="hidden md:flex flex-col">
                     <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white tracking-tight">{selectedCharacter.name}</h1>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono uppercase tracking-wider">Online</span>
                     </div>
                     <span className="text-xs text-gray-500 mt-1 font-mono">GEMINI-2.5-FLASH // LATENCY: LOW</span>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={clearChat} 
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/20"
                    >
                        <Trash2 size={16} />
                        <span>Reset</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
                    <button 
                        onClick={() => setRightSidebarOpen(!rightSidebarOpen)} 
                        className={`p-2.5 rounded-lg border transition-all duration-300 hidden md:flex items-center justify-center
                            ${rightSidebarOpen ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <SettingsIcon size={20} />
                    </button>
                    <button 
                        onClick={() => setMobileSettingsOpen(true)} 
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <SettingsIcon size={20} />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            character={selectedCharacter} 
                        />
                    ))}
                    <div ref={chatEndRef} className="h-4" />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 md:p-8 z-20 bg-gradient-to-t from-[#0B0F17] to-transparent">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
                    <div className="relative bg-[#1A1F2B]/80 backdrop-blur-xl rounded-3xl p-2 flex items-end gap-2 ring-1 ring-white/10 focus-within:ring-primary/50 focus-within:bg-[#1A1F2B] transition-all shadow-xl">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Send a message to ${selectedCharacter.name}...`}
                            className="w-full bg-transparent text-gray-200 placeholder-gray-500 px-4 py-3.5 max-h-40 min-h-[3.5rem] resize-none focus:outline-none rounded-2xl leading-relaxed scrollbar-hide"
                            rows={1}
                        />
                        
                        <button
                            onClick={toggleVoiceInput}
                            className={`mb-1 p-3 rounded-2xl shadow-lg transition-all flex-shrink-0 duration-300
                                ${isListening 
                                    ? 'bg-red-500/20 text-red-400 animate-pulse ring-1 ring-red-500/50' 
                                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                }`}
                            title={isListening ? "Stop Listening" : "Voice Input"}
                        >
                            <Mic size={20} />
                        </button>

                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isTyping}
                            className="mb-1 p-3 rounded-2xl bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all flex-shrink-0"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </main>

        {/* Right Sidebar (Settings) */}
        <div className={`
            absolute top-0 right-0 h-full z-40
            w-[600px] 
            transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)
            ${rightSidebarOpen ? 'translate-x-0 shadow-[-10px_0_40px_rgba(0,0,0,0.5)]' : 'translate-x-full'}
            hidden md:block
        `}>
             <SettingsPanel 
                config={config} 
                onConfigChange={setConfig} 
                isOpen={true} 
                onClose={() => setRightSidebarOpen(false)} 
            />
        </div>

        {/* Mobile Settings Drawer */}
        {mobileSettingsOpen && (
             <div className="absolute inset-0 z-50 md:hidden animate-in fade-in slide-in-from-right-10 duration-200">
                <SettingsPanel 
                    config={config} 
                    onConfigChange={setConfig} 
                    isOpen={true} 
                    onClose={() => setMobileSettingsOpen(false)}
                />
             </div>
        )}

      </div>
    </div>
  );
};

export default App;
