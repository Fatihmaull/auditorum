"use client";
import { useState } from "react";

export function DocumentInsightCard({ doc }: { doc: any }) {
  const [expanded, setExpanded] = useState(false);

  const intel = Array.isArray(doc.document_intelligence) ? doc.document_intelligence[0] : doc.document_intelligence;

  const formatKey = (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="card flex flex-col transition-all hover:border-[#0B3D91]/30 bg-white overflow-hidden shadow-sm">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B3D91]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
               {doc.title || `Document ${doc.document_hash?.slice(0, 8)}...`}
            </p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs text-gray-500 font-mono">{doc.file_cid?.slice(0, 10)}...</span>
               {intel && (
                 <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full flex items-center gap-1 ${
                    intel.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' :
                    intel.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
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
          className="text-xs font-semibold text-[#0B3D91] hover:text-white border border-blue-100 whitespace-nowrap px-3 py-1.5 rounded-md bg-blue-50 hover:bg-[#0B3D91] transition-colors flex items-center gap-1.5"
        >
          {expanded ? "Hide Insights" : (intel ? (
            <span className="flex items-center gap-1.5">
              AI Insights
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </span>
          ) : "Document Details")}
        </button>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100 bg-slate-50/50">
          <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-2">
            
            {intel && (
              <>
                {/* Executive Summary */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B3D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Executive Summary
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                    {intel.executive_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {/* Fast Metrics */}
                   {intel.fast_metrics && Object.keys(intel.fast_metrics).length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                           Fast Metrics
                        </h4>
                        <ul className="space-y-2 border-l-2 border-blue-200 pl-3">
                          {Object.entries(intel.fast_metrics).map(([k, v]) => (
                            <li key={k} className="flex flex-col">
                              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{formatKey(k)}</span>
                              <span className="text-sm text-gray-900 font-semibold">{String(v)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                   )}

                   {/* Compliance Flags */}
                   {intel.compliance_flags && intel.compliance_flags.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          Compliance Flags
                        </h4>
                        <ul className="space-y-2">
                          {intel.compliance_flags.slice(0, 4).map((flag: any, i: number) => (
                            <li key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 p-2.5 rounded-md shadow-sm">
                              <div>
                                 <span className="font-bold text-amber-800 block text-[10px] uppercase tracking-wider mb-0.5">{flag.category}</span>
                                 <span className="text-xs text-gray-700 leading-snug">{flag.flag}</span>
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
            <div className="pt-4 border-t border-gray-200 mt-2 flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
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
                className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900 border border-purple-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                Chat about this document
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
