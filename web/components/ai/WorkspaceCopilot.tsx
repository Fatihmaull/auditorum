"use client";

import { useState, useRef, useEffect } from "react";

export function WorkspaceCopilot({ workspacePubkey }: { workspacePubkey: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Track specific document context
  const [activeContextTitle, setActiveContextTitle] = useState<string | null>(null);
  const [activeContextPubkey, setActiveContextPubkey] = useState<string | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, activeContextTitle]);

  // Listen for external Open triggers (from DocumentInsightCards)
  useEffect(() => {
    const handleOpenCopilot = (e: any) => {
      setIsOpen(true);
      const docContextName = e.detail?.documentTitle;
      const docPubkey = e.detail?.documentPubkey;
      if (docContextName) {
        setActiveContextTitle(docContextName);
        if (docPubkey) setActiveContextPubkey(docPubkey);
        
        // Let's also add an initialization message if the chat is empty
        setMessages(prev => {
           if (prev.length === 0) {
              return [{ 
                role: 'ai', 
                content: `I've attached **${docContextName}** as your primary context context. I will prioritize insights from this document while maintaining access to your entire corporate network. How can I assist you?`
              }];
           }
           return prev;
        });
      }
    };
    
    window.addEventListener('open-copilot', handleOpenCopilot);
    return () => window.removeEventListener('open-copilot', handleOpenCopilot);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Pass the query natively, and rely on the activeContextPubkey to filter the vector database at the infrastructure level.
      const res = await fetch("/api/ai/chat/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          workspacePubkey,
          documentPubkey: activeContextPubkey
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect to the Auditorum Intelligence Engine." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center p-4 bg-brand-500 text-white rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.5)] border border-brand-400/20 hover:bg-brand-600 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(99,102,241,0.6)] transition-all duration-300 group"
          aria-label="Open Workspace Copilot"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="fixed top-0 right-0 h-screen w-96 bg-dark-900 border-l border-dark-700 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform duration-300 ease-out translate-x-0 animate-in slide-in-from-right">
          
          <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2 text-brand-400">
              <div className="p-1.5 bg-brand-500/10 rounded-lg border border-brand-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <svg className="text-neon-blue" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">Auditorum AI</h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Workspace Copilot</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:bg-dark-800 hover:text-white rounded-full transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-dark-900 relative">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6 text-brand-400 border border-dark-700">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h4 className="text-base font-bold text-white tracking-wide">How can I help you audit?</h4>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  I can analyze risk factors, extract specific financial metrics, or query compliance guidelines across the entire corporate document cluster.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* For User messages, if there's an active context, append a tiny badge showing it was sent with context */}
                  {msg.role === 'user' && activeContextTitle && (
                     <div className="text-[9px] text-gray-400 font-mono tracking-wider uppercase mb-1 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Context Bound
                     </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-br-none border border-brand-400/20' 
                      : 'bg-dark-800 text-gray-300 border border-dark-700 rounded-tl-none leading-relaxed'
                  }`}>
                    {msg.role === 'ai' ? (
                      <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex flex-col items-start px-2">
                  <div className="bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                  </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-dark-900 border-t border-dark-800 flex flex-col gap-3">
            
            {/* Visual Attachment Context Pill */}
            {activeContextTitle && (
               <div className="flex items-center justify-between bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 rounded-xl text-xs animate-in slide-in-from-bottom-3 duration-500">
                  <div className="flex items-center gap-2 text-brand-400 whitespace-nowrap overflow-hidden">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-neon-blue animate-pulse"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                     <span className="font-bold truncate tracking-wide">Context: {activeContextTitle}</span>
                  </div>
                  <button 
                     onClick={() => {
                        setActiveContextTitle(null);
                        setActiveContextPubkey(null);
                     }}
                     className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2 bg-dark-800 hover:bg-dark-700 p-1 rounded-lg"
                     title="Unlink document and chat with entire workspace"
                  >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
               </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-center group">
              <input
                type="text"
                placeholder={activeContextTitle ? "Ask about this document..." : "Ask your copilot anything..."}
                className="w-full bg-dark-800 border border-dark-700 text-white text-sm rounded-2xl pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-600"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2.5 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500 transition-all shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
            <p className="text-center text-[9px] text-gray-500 mt-1 uppercase tracking-tighter opacity-70">
              AI answers are generated dynamically based on workspace indexes.
            </p>
          </div>

        </div>
      )}
    </>
  );
}
