
export enum Role {
  User = 'user',
  Model = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemInstruction: string;
  firstMessage: string;
  backgroundImage: string; 
}

export interface LorebookEntry {
  id: string;
  keys: string[]; // Keywords that trigger this entry
  content: string; // The context to inject
  enabled: boolean;
}

export interface ChatConfig {
  // --- Generation ---
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  thinkingBudget: number;
  stopSequences: string[];
  presencePenalty: number;
  frequencyPenalty: number;
  seed: number;
  
  // --- Prompt / Story ---
  scenario: string;
  exampleDialogue: string;
  lorebook: LorebookEntry[]; // New: Dynamic World Info
  
  // --- Persona ---
  userName: string;
  userDescription: string;
  
  // --- Advanced Prompting ---
  systemPromptOverride: string;
  authorsNote: string;
  authorsNoteDepth: number;
  promptOrder: 'default' | 'style_first' | 'scenario_last';
  
  // --- Formatting (New) ---
  userPrefix: string; // e.g. "User:" or "## User"
  modelPrefix: string; // e.g. "Char:"
  contextTemplate: string; // Advanced template string
  
  // --- Interface ---
  fontSize: number;
  backgroundBlur: number;
  
  // --- Safety ---
  safetySettings: 'block_none' | 'block_some' | 'block_most';
}
