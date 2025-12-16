
import React, { useState } from 'react';
import { ChatConfig, LorebookEntry } from '../types';
import { 
    Settings, 
    BookOpen, 
    X, 
    BrainCircuit, 
    AlignLeft, 
    UserCircle, 
    Shield, 
    Terminal, 
    Cpu, 
    PenTool, 
    AlertTriangle, 
    List,
    Palette,
    MessageSquare,
    SlidersHorizontal,
    Dna,
    FileText,
    Book,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Type
} from 'lucide-react';

interface SettingsPanelProps {
  config: ChatConfig;
  onConfigChange: (config: ChatConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'generation' | 'story' | 'lorebook' | 'character' | 'persona' | 'formatting' | 'interface';

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigChange, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('generation');
  const [stopSeqInput, setStopSeqInput] = useState(config.stopSequences.join(', '));

  // Lorebook State
  const [newLoreKey, setNewLoreKey] = useState('');

  if (!isOpen) return null;

  const handleChange = (key: keyof ChatConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handleStopSeqChange = (val: string) => {
    setStopSeqInput(val);
    const split = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleChange('stopSequences', split);
  };

  // Lorebook Handlers
  const addLorebookEntry = () => {
    const newEntry: LorebookEntry = {
        id: Date.now().toString(),
        keys: [],
        content: '',
        enabled: true
    };
    handleChange('lorebook', [...config.lorebook, newEntry]);
  };

  const updateLorebookEntry = (id: string, field: keyof LorebookEntry, value: any) => {
    const updated = config.lorebook.map(entry => {
        if (entry.id === id) {
            if (field === 'keys' && typeof value === 'string') {
                return { ...entry, keys: value.split(',').map((k: string) => k.trim()) };
            }
            return { ...entry, [field]: value };
        }
        return entry;
    });
    handleChange('lorebook', updated);
  };

  const deleteLorebookEntry = (id: string) => {
    handleChange('lorebook', config.lorebook.filter(e => e.id !== id));
  };

  const navItemClass = (tab: Tab) => `
    flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left mb-1
    ${activeTab === tab 
      ? 'bg-primary/20 text-white border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
    }
  `;

  return (
    <div className="h-full flex bg-[#0B0F17]/95 backdrop-blur-3xl border-l border-white/10 w-full shadow-2xl font-sans">
        
        {/* Sidebar Navigation */}
        <div className="w-16 md:w-60 border-r border-white/5 flex flex-col pt-20 md:pt-0 bg-black/40 shrink-0">
            <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-white/5 h-20 bg-black/20">
                <SlidersHorizontal size={18} className="text-primary" />
                <span className="font-bold text-white tracking-widest text-xs uppercase">Configuration</span>
            </div>

            <nav className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1">
                <button onClick={() => setActiveTab('generation')} className={navItemClass('generation')}>
                    <Cpu size={18} />
                    <span className="hidden md:inline">Text Generation</span>
                </button>
                <button onClick={() => setActiveTab('story')} className={navItemClass('story')}>
                    <BookOpen size={18} />
                    <span className="hidden md:inline">World & Story</span>
                </button>
                <button onClick={() => setActiveTab('lorebook')} className={navItemClass('lorebook')}>
                    <Book size={18} />
                    <span className="hidden md:inline">Lorebook (World Info)</span>
                </button>
                <button onClick={() => setActiveTab('character')} className={navItemClass('character')}>
                    <FileText size={18} />
                    <span className="hidden md:inline">Character Prompts</span>
                </button>
                <button onClick={() => setActiveTab('persona')} className={navItemClass('persona')}>
                    <UserCircle size={18} />
                    <span className="hidden md:inline">User Persona</span>
                </button>
                <button onClick={() => setActiveTab('formatting')} className={navItemClass('formatting')}>
                    <Type size={18} />
                    <span className="hidden md:inline">Formatting</span>
                </button>
                <button onClick={() => setActiveTab('interface')} className={navItemClass('interface')}>
                    <Palette size={18} />
                    <span className="hidden md:inline">Interface / Visuals</span>
                </button>
            </nav>

            <div className="p-4 border-t border-white/5 hidden md:block">
                <div className="text-[10px] text-gray-600 font-mono text-center opacity-60">
                    ETHERIA v2.5 (Lorebook)
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
             {/* Mobile Close / Header */}
            <div className="flex md:hidden items-center justify-between p-4 border-b border-white/5 bg-black/40">
                <span className="font-bold uppercase tracking-wider text-sm text-gray-400">Settings</span>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white"><X size={16}/></button>
            </div>
            
            <div className="hidden md:flex h-20 items-center justify-between px-6 border-b border-white/5 bg-black/20">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                   {activeTab === 'generation' && 'Generation Parameters'}
                   {activeTab === 'story' && 'World Information'}
                   {activeTab === 'lorebook' && 'Lorebook / World Info'}
                   {activeTab === 'character' && 'System Prompts'}
                   {activeTab === 'persona' && 'User Settings'}
                   {activeTab === 'formatting' && 'Prompt Formatting'}
                   {activeTab === 'interface' && 'Appearance'}
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* --- GENERATION TAB --- */}
                {activeTab === 'generation' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-bold text-white">Sampler Settings</h3>
                         <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">Gemini 2.5</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                               <BrainCircuit size={14} className="text-primary"/> Temperature
                            </label>
                            <span className="text-xs font-mono text-primary">{config.temperature}</span>
                        </div>
                        <input 
                            type="range" min="0" max="2" step="0.05"
                            value={config.temperature}
                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                               <AlignLeft size={14} className="text-emerald-400"/> Response Length
                            </label>
                            <span className="text-xs font-mono text-emerald-400">{config.maxOutputTokens}</span>
                        </div>
                        <input 
                            type="range" min="100" max="8192" step="100"
                            value={config.maxOutputTokens}
                            onChange={(e) => handleChange('maxOutputTokens', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                     <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                               <Cpu size={14}/> Thinking Budget
                            </label>
                            <span className="text-xs font-mono text-blue-300">
                                {config.thinkingBudget === 0 ? 'Disabled' : `${config.thinkingBudget} tok`}
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="8192" step="1024"
                            value={config.thinkingBudget}
                            onChange={(e) => handleChange('thinkingBudget', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-[10px] text-gray-500">Enable Chain-of-Thought reasoning for complex logic.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Top K</label>
                            <input 
                                type="number" value={config.topK}
                                onChange={(e) => handleChange('topK', parseInt(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Top P</label>
                            <input 
                                type="number" step="0.01" value={config.topP}
                                onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Presence Penalty</label>
                            <input 
                                type="number" step="0.1" value={config.presencePenalty}
                                onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Frequency Penalty</label>
                            <input 
                                type="number" step="0.1" value={config.frequencyPenalty}
                                onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-center outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex gap-4">
                             <div className="flex-1 space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                                    <Dna size={12}/> Seed
                                </label>
                                <input 
                                    type="number" placeholder="-1 (Random)"
                                    value={config.seed === -1 ? '' : config.seed}
                                    onChange={(e) => handleChange('seed', e.target.value === '' ? -1 : parseInt(e.target.value))}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-primary/50"
                                />
                             </div>
                             <div className="flex-[2] space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Stop Sequences</label>
                                <input 
                                    type="text" value={stopSeqInput}
                                    onChange={(e) => handleStopSeqChange(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-primary/50"
                                />
                             </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* --- STORY TAB --- */}
                {activeTab === 'story' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-3">
                          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                              <BookOpen size={14}/> Scenario
                          </label>
                          <p className="text-[10px] text-gray-500">Current situation, environment, or plot constraints.</p>
                          <textarea 
                              value={config.scenario}
                              onChange={(e) => handleChange('scenario', e.target.value)}
                              placeholder="e.g. In a high school classroom during a thunderstorm..."
                              className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-primary/50 transition-all resize-none font-sans"
                          />
                      </div>

                      <div className="space-y-3 mt-6 p-4 rounded-xl bg-orange-900/10 border border-orange-500/10">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                <PenTool size={14}/> Author's Note / Depth Prompt
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase">Depth</span>
                                <input 
                                    type="number" min="0" max="10"
                                    value={config.authorsNoteDepth}
                                    onChange={(e) => handleChange('authorsNoteDepth', parseInt(e.target.value))}
                                    className="w-12 bg-black/30 border border-white/10 rounded px-1 py-0.5 text-xs text-center"
                                />
                            </div>
                          </div>
                          <textarea 
                              value={config.authorsNote}
                              onChange={(e) => handleChange('authorsNote', e.target.value)}
                              placeholder="[System Note: Write using vivid sensory details. The character is secretly afraid.]"
                              className="w-full h-32 bg-transparent border-0 p-0 text-sm text-gray-300 focus:ring-0 placeholder-gray-600 resize-none font-mono"
                          />
                      </div>
                   </div>
                )}

                {/* --- LOREBOOK TAB (NEW) --- */}
                {activeTab === 'lorebook' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="flex justify-between items-center mb-4">
                           <div>
                               <h3 className="text-lg font-bold text-white">World Info</h3>
                               <p className="text-xs text-gray-500">Dynamic context injected when keywords are triggered.</p>
                           </div>
                           <button onClick={addLorebookEntry} className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-primary/30">
                               <Plus size={16}/> Add Entry
                           </button>
                       </div>

                       <div className="space-y-4">
                           {config.lorebook.length === 0 && (
                               <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-gray-600 text-sm">
                                   No lorebook entries. Click "Add Entry" to create one.
                               </div>
                           )}
                           
                           {config.lorebook.map((entry) => (
                               <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 group hover:border-white/20 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <button onClick={() => updateLorebookEntry(entry.id, 'enabled', !entry.enabled)} className="text-gray-400 hover:text-white">
                                           {entry.enabled ? <ToggleRight size={24} className="text-green-400"/> : <ToggleLeft size={24}/>}
                                       </button>
                                       <input 
                                          type="text" 
                                          placeholder="Keywords (comma separated)"
                                          value={entry.keys.join(', ')}
                                          onChange={(e) => updateLorebookEntry(entry.id, 'keys', e.target.value)}
                                          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-primary/50 outline-none"
                                       />
                                       <button onClick={() => deleteLorebookEntry(entry.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                                   <textarea 
                                       placeholder="Context to inject..."
                                       value={entry.content}
                                       onChange={(e) => updateLorebookEntry(entry.id, 'content', e.target.value)}
                                       className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary/50 resize-none font-sans"
                                   />
                               </div>
                           ))}
                       </div>
                   </div>
                )}

                {/* --- CHARACTER PROMPTS TAB --- */}
                {activeTab === 'character' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                <Shield size={14}/> Main Prompt Override
                            </label>
                            <textarea 
                                value={config.systemPromptOverride}
                                onChange={(e) => handleChange('systemPromptOverride', e.target.value)}
                                placeholder="Enter a full replacement for the character card description..."
                                className="w-full h-40 bg-black/30 border border-red-500/20 rounded-xl p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-red-500/50 resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare size={14}/> Example Dialogue
                            </label>
                            <p className="text-[10px] text-gray-500">Crucial for defining the character's speech pattern.</p>
                            <textarea 
                                value={config.exampleDialogue}
                                onChange={(e) => handleChange('exampleDialogue', e.target.value)}
                                placeholder={`<START>\n{{user}}: Hello\n{{char}}: *smirks* Well look who it is.`}
                                className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-primary/50 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <List size={14} /> Prompt Ordering
                            </label>
                            <select 
                                value={config.promptOrder}
                                onChange={(e) => handleChange('promptOrder', e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-primary/50"
                            >
                                <option value="default">Default (Char -> Examples -> User -> Scenario)</option>
                                <option value="style_first">Style First (Note -> Char -> Scenario)</option>
                                <option value="scenario_last">Scenario Last (Char -> Note -> Scenario)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* --- PERSONA TAB --- */}
                {activeTab === 'persona' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Display Name
                                </label>
                                <input 
                                    type="text"
                                    value={config.userName}
                                    onChange={(e) => handleChange('userName', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    User Description / Persona
                                </label>
                                <p className="text-[10px] text-gray-500">How the character sees you (appearance, personality).</p>
                                <textarea 
                                    value={config.userDescription}
                                    onChange={(e) => handleChange('userDescription', e.target.value)}
                                    placeholder="Tall, mysterious stranger with a mechanical arm..."
                                    className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FORMATTING TAB (NEW) --- */}
                {activeTab === 'formatting' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <h3 className="text-lg font-bold text-white mb-4">Output Formatting</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">User Prefix</label>
                                <input 
                                    type="text"
                                    value={config.userPrefix}
                                    onChange={(e) => handleChange('userPrefix', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm font-mono focus:border-primary/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Model Prefix</label>
                                <input 
                                    type="text"
                                    value={config.modelPrefix}
                                    onChange={(e) => handleChange('modelPrefix', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm font-mono focus:border-primary/50 outline-none"
                                />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Context Template Override</label>
                            <p className="text-[10px] text-gray-500">Leave as 'default' or enter a custom JSON string.</p>
                            <input 
                                type="text"
                                value={config.contextTemplate}
                                onChange={(e) => handleChange('contextTemplate', e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm font-mono focus:border-primary/50 outline-none"
                            />
                         </div>
                    </div>
                )}

                {/* --- INTERFACE TAB --- */}
                {activeTab === 'interface' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Font Size</label>
                                    <span className="text-xs text-gray-400">{config.fontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="12" max="24"
                                    value={config.fontSize}
                                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Background Blur</label>
                                    <span className="text-xs text-gray-400">{config.backgroundBlur}px</span>
                                </div>
                                <input 
                                    type="range" min="0" max="20"
                                    value={config.backgroundBlur}
                                    onChange={(e) => handleChange('backgroundBlur', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SettingsPanel;
