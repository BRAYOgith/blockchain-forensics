'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, ShieldAlert, Activity, DollarSign, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const GraphView = dynamic(() => import('@/components/GraphView'), { ssr: false });

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const validateAddress = (addr: string) => {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(addr);
  };

  const handleAnalyze = async () => {
    console.log("Analyzing address:", address);
    setError('');

    if (!address) {
      setError('Address is required');
      return;
    }

    if (!validateAddress(address)) {
      setError('Invalid Ethereum Address. Must start with 0x and be 42 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Address is strictly validated now
      const res = await fetch(`/api/analyze?address=${address}`);
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        alert(`Error: ${data.error}`); // Simple alert for now, can be improved
        return;
      }
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process real transaction data for graph
  const graphData = result && result.transactions ? (() => {
    const nodesMap = new Map();
    const links: any[] = [];

    // Add central node (the searched address)
    const centralId = result.address.toLowerCase();
    nodesMap.set(centralId, { id: centralId, group: 2, val: 30 });

    result.transactions.forEach((tx: any) => {
      const from = tx.from.toLowerCase();
      const to = tx.to.toLowerCase();

      // Add 'from' node if not exists
      if (!nodesMap.has(from)) {
        nodesMap.set(from, { id: from, group: 1, val: 10 });
      }
      // Add 'to' node if not exists
      if (!nodesMap.has(to)) {
        nodesMap.set(to, { id: to, group: 0, val: 10 });
      }

      links.push({ source: from, target: to });
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links: links
    };
  })() : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              CryptoTrace <span className="text-slate-500 font-mono text-sm ml-2">v0.1.0</span>
            </h1>
            <p className="text-slate-400 mt-1">Blockchain Forensics & Anti-Money Laundering Tool</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Mainnet Active
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg border border-slate-800 transition-all text-xs font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="relative bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex items-center shadow-lg shadow-blue-900/10">
          <div className="pl-4 text-slate-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Enter Ethereum Address (0x...)"
            className="w-full bg-transparent border-none focus:ring-0 text-white p-4 font-mono placeholder:text-slate-600"
            value={address}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAnalyze();
            }}
            onChange={(e) => {
              setAddress(e.target.value.trim());
              setError('');
            }}
          />
          {error && (
            <div className="absolute -bottom-6 left-0 text-red-500 text-sm font-semibold animate-pulse">
              {error}
            </div>
          )}
          <button
            id="trace-button"
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Trace Funds'}
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Risk Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert size={100} />
            </div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Risk Score</h3>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-bold ${result?.riskScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                {result ? result.riskScore : '--'}
              </span>
              <span className="text-slate-500 mb-2">/ 100</span>
            </div>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${result?.riskScore > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${result?.riskScore || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Based on heuristic analysis</p>
          </div>

          {/* Balance Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={100} />
            </div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Current Balance</h3>
            <div className="text-4xl font-bold text-white truncate">
              {result ? parseFloat(result.balance).toFixed(4) : '--'} <span className="text-lg text-slate-500">ETH</span>
            </div>
            <p className="text-xs text-slate-500 mt-4">Last updated block: {result?.blockNumber || '---'}</p>
          </div>

          {/* Activity Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={100} />
            </div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Transaction Volume</h3>
            <div className="text-4xl font-bold text-white">
              {result ? result.transactions.length : '--'}
            </div>
            <p className="text-xs text-slate-500 mt-4">Recent transactions detected</p>
          </div>
        </div>

        {/* Graph Area */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              Transaction Graph
              <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded">Visual Analysis</span>
            </h2>
            <GraphView data={graphData} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              Recent Transactions
              <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded">Audit Trail</span>
            </h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[500px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Peer</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium text-right">Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result?.transactions && result.transactions.length > 0 ? (
                      result.transactions.map((tx: any, i: number) => {
                        const isOut = tx.from.toLowerCase() === result.address.toLowerCase();
                        const peer = isOut ? tx.to : tx.from;
                        return (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOut ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {isOut ? 'OUT' : 'IN'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">
                              {peer.slice(0, 6)}...{peer.slice(-4)}
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-400">
                              {parseFloat(tx.value).toFixed(4)} ETH
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={`https://etherscan.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-blue-400 transition-colors"
                              >
                                {tx.hash.slice(0, 8)}...
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-20 text-center text-slate-600">
                          {loading ? 'Fetching records...' : 'No transactions found for this address.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
