'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="text-blue-500">Loading Graph...</div>
});

interface GraphData {
    nodes: { id: string; group: number; val: number }[];
    links: { source: string; target: string }[];
}

interface GraphViewProps {
    data: GraphData | null;
}

export default function GraphView({ data }: GraphViewProps) {
    const initialData = useMemo(() => ({ nodes: [], links: [] }), []);

    return (
        <div className="w-full h-[500px] border border-gray-800 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm relative">
            {!data ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Enter an address to generate graph
                </div>
            ) : (
                <ForceGraph2D
                    graphData={data}
                    nodeLabel="id"
                    nodeColor={node => node.group === 1 ? '#ef4444' : '#3b82f6'} // Red for risk, Blue for normal
                    linkColor={() => '#ffffff33'}
                    backgroundColor="#000000"
                    linkDirectionalArrowLength={6}
                    linkDirectionalArrowRelPos={1}
                />
            )}
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 p-3 rounded-lg text-xs space-y-2 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-slate-300">Safe / Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-slate-300">Suspicious / High Risk</span>
                </div>
            </div>
        </div>
    );
}
