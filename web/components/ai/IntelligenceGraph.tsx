"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function IntelligenceGraph({ workspacePubkey }: { workspacePubkey: string }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);

  // Precompute neighbors for O(1) lookups during canvas render
  const neighborsMap = useMemo(() => {
    const map = new Map();
    graphData.links.forEach((link: any) => {
      const a = typeof link.source === 'object' ? link.source.id : link.source;
      const b = typeof link.target === 'object' ? link.target.id : link.target;
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a).add(b);
      map.get(b).add(a);
    });
    return map;
  }, [graphData.links]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({ width: containerRef.current.clientWidth, height: 600 });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 600 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/ai/graph?workspacePubkey=${workspacePubkey}`);
        const data = await res.json();
        
        const nodeIds = new Set(data.nodes.map((n:any) => n.id));
        data.links = data.links.filter((l:any) => nodeIds.has(l.source) && nodeIds.has(l.target));
        
        setGraphData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [workspacePubkey]);

  if (loading) {
    return <div className="h-[600px] w-full flex flex-col items-center justify-center bg-dark-800 text-brand-400 rounded-xl border border-dark-700 animate-pulse font-medium"><svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-neon-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Initializing Auditorum Inter-Document Constellation...</div>;
  }

  if (graphData.nodes.length === 0) {
    return <div className="h-[600px] w-full flex items-center justify-center bg-dark-800 text-gray-500 rounded-xl border border-dark-700">No Intelligence Graph data available yet. Please wait for processing.</div>;
  }

  const getNodeColor = (type: string) => {
    if (type === 'COMPANY') return '#6366f1'; // brand-500
    if (type === 'DOCUMENT') return '#38bdf8'; // neon-blue
    if (type === 'RISK_LEVEL') return '#ef4444'; // red-500
    if (type === 'KEYWORD') return '#fbbf24'; // amber-400
    return '#94a3b8'; // slate-400
  };

  return (
    <div ref={containerRef} className="w-full h-[600px] bg-dark-900 rounded-xl overflow-hidden border border-dark-700 shadow-2xl relative flex mb-8">
      
      <div className="absolute top-4 left-4 z-10 bg-dark-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/5 shadow-xl pointer-events-none">
         <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Auditorum Intelligence Graph
         </h3>
         <p className="text-xs text-gray-400 mt-1">Hover over nodes to illuminate connections.</p>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-dark-800/80 backdrop-blur-md text-white p-3 rounded-lg border border-white/5 shadow-xl flex flex-col gap-2 text-[10px] font-medium tracking-wide">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div> COMPANY</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-neon-blue"></div> DOCUMENT</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> RISK SEVERITY</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> COMPLIANCE FLAG</div>
      </div>
      
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 w-64 bg-dark-800 text-white p-4 rounded-xl border border-dark-600 shadow-2xl animate-in fade-in slide-in-from-right-4">
           <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedNode.type.replace('_', ' ')} NODE</span>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
           </div>
           <h3 className="font-semibold text-sm mb-3 border-b border-dark-700 pb-2 text-neon-blue">{selectedNode.name}</h3>
           
           <div className="text-xs text-gray-400 mb-2">
             <span className="font-semibold text-brand-400">System ID:</span> <br/>
             <span className="font-mono text-[9px] break-all opacity-60 text-gray-300">{selectedNode.id}</span>
           </div>
           
           <p className="text-xs text-gray-400 leading-relaxed bg-dark-900/50 p-3 rounded-lg mt-3 border border-dark-700">
             {selectedNode.type === 'KEYWORD' && "This compliance point impacts multiple linked entities across your intelligence constellation."}
             {selectedNode.type === 'DOCUMENT' && "This node represents an audited file entity inside your workspace anchored on-chain."}
             {selectedNode.type === 'RISK_LEVEL' && "Severity marker. High concentration in this sector indicates systemic risk."}
             {selectedNode.type === 'COMPANY' && "The primary workspace entity."}
           </p>
        </div>
      )}

      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#0f1115"
        d3VelocityDecay={0.2}
        
        onNodeHover={(node: any) => setHoverNode(node)}
        onNodeClick={(node: any) => setSelectedNode(node)}
        onNodeDragEnd={(node:any) => { node.fx = node.x; node.fy = node.y; }}
        
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const isHovered = hoverNode && hoverNode.id === node.id;
          const isNeighbor = hoverNode && neighborsMap.get(hoverNode.id)?.has(node.id);
          const isSelected = selectedNode && selectedNode.id === node.id;
          
          // Spotlight effect
          const isDimmed = hoverNode && !isHovered && !isNeighbor;
          
          ctx.beginPath();
          const r = node.type === 'COMPANY' ? 8 : node.type === 'DOCUMENT' ? 4 : 5;
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          
          ctx.globalAlpha = isDimmed ? 0.2 : 1;
          ctx.fillStyle = getNodeColor(node.type);
          
          if (isHovered || isSelected) {
            ctx.lineWidth = 2 / globalScale;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          }
          
          ctx.fill();

          // Only show labels for hovered, neighbors, or selected node
          if (isHovered || isNeighbor || isSelected || (node.type === 'COMPANY' && !hoverNode)) {
            const label = node.name || '';
            const fontSize = (isHovered ? 14 : 12) / globalScale;
            ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px Sans-Serif`;
            
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4); 
            
            ctx.fillStyle = `rgba(4, 20, 52, ${isDimmed ? 0.4 : 0.8})`;
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + r + 3, bckgDimensions[0], bckgDimensions[1]);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(255, 255, 255, ${isDimmed ? 0.4 : 1})`;
            ctx.fillText(label, node.x, node.y + r + 3 + fontSize / 2);
          }
          
          ctx.globalAlpha = 1; // reset
        }}
        
        linkColor={(link: any) => {
          const isHoveredLink = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          const isDimmed = hoverNode && !isHoveredLink;
          return `rgba(255, 255, 255, ${isHoveredLink ? 0.8 : isDimmed ? 0.05 : 0.15})`;
        }}
        linkWidth={(link: any) => {
          const isHoveredLink = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          return isHoveredLink ? 2 : 1;
        }}
        
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={(link: any) => {
            const isHoveredLink = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
            return isHoveredLink ? 3 : hoverNode ? 0 : 1.5;
        }}
        linkDirectionalParticleSpeed={(d: any) => (d.value || 1) * 0.005}
        
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link: any, ctx: any, globalScale: number) => {
          const isHoveredLink = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          
          // Only show edge text IF it is a direct neighbor connection to the hovered node AND zoomed in
          if (!isHoveredLink) return;
          
          const label = link.relationship;
          if (!label) return;

          const start = link.source;
          const end = link.target;
          if (typeof start !== 'object' || typeof end !== 'object') return;

          const textPos = {
            x: start.x + (end.x - start.x) / 2,
            y: start.y + (end.y - start.y) / 2
          };

          const relLink = { x: end.x - start.x, y: end.y - start.y };
          let textAngle = Math.atan2(relLink.y, relLink.x);
          if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
          if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

          const fontSize = 10 / globalScale;
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          
          ctx.save();
          ctx.translate(textPos.x, textPos.y);
          ctx.rotate(textAngle);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Adding a dark pill background to edge text for high contrast readability
          const textWidth = ctx.measureText(label.replace(/_/g, ' ')).width;
          ctx.fillStyle = 'rgba(4, 20, 52, 0.9)';
          ctx.fillRect(-textWidth/2 - 2, -fontSize/2 - 2, textWidth + 4, fontSize + 4);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          ctx.fillText(label.replace(/_/g, ' '), 0, 0);
          ctx.restore();
        }}
      />
    </div>
  );
}
