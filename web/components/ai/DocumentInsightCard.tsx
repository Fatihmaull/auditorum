"use client";
import { useState } from "react";

export function DocumentInsightCard({ doc }: { doc: any }) {
  const [expanded, setExpanded] = useState(false);

  const intel = Array.isArray(doc.document_intelligence) ? doc.document_intelligence[0] : doc.document_intelligence;

  const formatKey = (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="card-hover flex flex-col transition-all border-dark-700 bg-dark-800 overflow-hidden shadow-xl">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-neon-blue border border-brand-500/20 shadow-[0_0_10px_rgba(56,189,248,0.1)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white tracking-wide">
               {doc.title || `Document ${doc.document_hash?.slice(0, 8)}...`}
            </p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] text-gray-500 font-mono tracking-tighter opacity-60">{doc.file_cid?.slice(0, 10)}...</span>
               {intel && (
                 <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded-md flex items-center gap-1.5 border ${
                    intel.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    intel.risk_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                 }`}>
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                   {intel.risk_level} RISK ({intel.risk_score || 0}/100)
                 </span>
               )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className={`text-[11px] font-bold whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border uppercase tracking-wider ${
            expanded 
              ? "bg-dark-700 text-white border-dark-600 shadow-inner" 
              : "bg-brand-500/10 text-neon-blue border-brand-500/20 hover:bg-brand-500/20 hover:border-brand-500/30"
          }`}
        >
          {expanded ? "Hide Insights" : (intel ? (
            <span className="flex items-center gap-1.5">
              AI Insights
              <svg className="animate-pulse" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </span>
          ) : "Document Details")}
        </button>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-dark-700 bg-dark-900/30 backdrop-blur-sm">
          <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
            
            {intel && (
              <>
                {/* Executive Summary */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Executive Summary
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-dark-800/50 p-4 rounded-xl border border-dark-700 shadow-inner">
                    {intel.executive_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Fast Metrics */}
                    {intel.fast_metrics && Object.keys(intel.fast_metrics).length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                           Fast Metrics
                        </h4>
                        <ul className="space-y-3 border-l border-dark-600 pl-4">
                          {Object.entries(intel.fast_metrics).map(([k, v]) => (
                            <li key={k} className="flex flex-col">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{formatKey(k)}</span>
                              <span className="text-sm text-white font-semibold">{String(v)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Compliance Flags */}
                    {intel.compliance_flags && intel.compliance_flags.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          Compliance Flags
                        </h4>
                        <ul className="space-y-2.5">
                          {intel.compliance_flags.slice(0, 4).map((flag: any, i: number) => (
                            <li key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
                              <div>
                                 <span className="font-bold text-amber-400 block text-[9px] uppercase tracking-widest mb-0.5">{flag.category}</span>
                                 <span className="text-xs text-gray-300 leading-relaxed font-medium">{flag.flag}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </>
            )}

            {/* AI Document Trigger */}
            <div className="pt-5 border-t border-dark-700 mt-2 flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                 Ask Auditorum AI
              </h4>
              <button 
                onClick={() => {
                  const fallbackName = doc.title || doc.file_name || `Document ${doc.document_hash?.slice(0, 8)}`;
                  window.dispatchEvent(new CustomEvent('open-copilot', { 
                    detail: { 
                      documentTitle: fallbackName,
                      documentPubkey: doc.pubkey
                    } 
                  }));
                }}
                className="text-[11px] font-bold text-white bg-brand-500 hover:bg-brand-600 border border-brand-500/20 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2 uppercase tracking-wide"
              >
                Chat about this document
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
