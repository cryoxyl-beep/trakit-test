import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Plus } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { Title } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  recommendations?: Title[];
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you find something to watch, add items to your watchlist, or manage your library. What are you in the mood for?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToWatchlist, removeTitle, updateStatus, items } = useWatchlist();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          userWatchlist: items
        })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      if (data.functionCalls) {
        for (const call of data.functionCalls) {
          if (call.name === 'add_to_watchlist') {
            await addToWatchlist(call.args);
            setMessages(prev => [...prev, {
              id: Date.now().toString() + Math.random(),
              role: 'system',
              content: `Added ${call.args.name} to your watchlist.`
            }]);
          } else if (call.name === 'remove_from_watchlist') {
            await removeTitle(call.args.tmdbId);
            setMessages(prev => [...prev, {
              id: Date.now().toString() + Math.random(),
              role: 'system',
              content: `Removed title from your watchlist.`
            }]);
          } else if (call.name === 'update_status') {
             await updateStatus(call.args.tmdbId, call.args.status);
             setMessages(prev => [...prev, {
              id: Date.now().toString() + Math.random(),
              role: 'system',
              content: `Updated title status to ${call.args.status.replace('-', ' ')}.`
            }]);
          }
        }
      }

      if (data.content || (data.recommendations && data.recommendations.length > 0)) {
         const aiMessage: Message = {
           id: (Date.now() + 1).toString(),
           role: 'assistant',
           content: data.content,
           recommendations: data.recommendations
         };
         setMessages(prev => [...prev, aiMessage]);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error("[DEBUG] Chat UI Error:", error);
      const isOverloaded = error.message && (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE'));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Error: ${error.message || "Unknown error occurred"}`
      }]);
      setLoading(false);
    }
  };

  const handleAdd = async (title: Title) => {
    await addToWatchlist(title);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `Added ${title.name} to your watchlist.`
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-40 ${open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Slide-in Panel */}
      <div className={`fixed top-0 bottom-0 right-0 w-full sm:w-[400px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-medium text-sm flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                AI Assistant
                <span className="text-[10px] uppercase font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">Beta</span>
              </h3>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id}>
              {message.role === 'system' ? (
                <div className="flex justify-center my-2">
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                    {message.content}
                  </span>
                </div>
              ) : (
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' : 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'}`}>
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      message.role === 'user' 
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-tr-sm' 
                        : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 rounded-tl-sm'
                    }`}>
                      {message.content}
                    </div>
                    
                    {/* Recommendations rendering */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="w-full space-y-2 mt-2">
                        {message.recommendations.map(rec => {
                          const isAdded = items.some(i => i.tmdbId === rec.tmdbId);
                          return (
                            <div key={rec.tmdbId} className="flex gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 pr-4 shadow-sm group">
                              {rec.posterUrl ? (
                                <img src={rec.posterUrl} alt={rec.name} className="w-12 h-16 object-cover rounded-md shrink-0" />
                              ) : (
                                <div className="w-12 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0 flex items-center justify-center">
                                  <span className="text-[10px] text-zinc-400">No Img</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                <div>
                                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{rec.name}</div>
                                  <div className="text-xs text-zinc-500 mt-0.5">{rec.releaseYear} &middot; <span className="capitalize">{rec.type}</span></div>
                                </div>
                                <button 
                                  onClick={() => !isAdded && handleAdd(rec)}
                                  disabled={isAdded}
                                  className={`self-start text-xs font-medium flex items-center gap-1 transition-colors ${
                                    isAdded 
                                      ? 'text-zinc-400' 
                                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                                  }`}
                                >
                                  {isAdded ? 'Added' : <><Plus size={14} /> Add</>}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-900">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="relative flex items-end">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors placeholder:text-zinc-500"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-50 transition-colors"
            >
              <Send size={14} className="mr-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
