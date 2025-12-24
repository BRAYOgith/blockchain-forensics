'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, ShieldAlert, Activity, DollarSign, LogOut, Download, FileText } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { generateReport, downloadReport } from '@/lib/report-generator';

const GraphView = dynamic(() => import('@/components/GraphView'), { ssr: false });

type ChainType = 'ethereum' | 'bitcoin' | 'solana' | 'worldcoin' | 'okx' | 'bnb';

interface ChainConfig {
  name: string;
  symbol: string;
  placeholder: string;
  validation: RegExp;
  errorMessage: string;
}

const CHAIN_CONFIGS: Record<ChainType, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    placeholder: 'Enter Ethereum Address (0x...)',
    validation: /^0x[a-fA-F0-9]{40}$/,
    errorMessage: 'Invalid Ethereum address. Must start with 0x and be 42 characters long.'
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    placeholder: 'Enter Bitcoin Address (1... or 3... or bc1...)',
    validation: /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/,
    errorMessage: 'Invalid Bitcoin address format.'
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    placeholder: 'Enter Solana Address (Base58)',
    validation: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    errorMessage: 'Invalid Solana address. Must be 32-44 characters (Base58).'
  },
  worldcoin: {
    name: 'Worldcoin',
    symbol: 'WLD',
    placeholder: 'Enter Worldcoin Address (0x...)',
    validation: /^0x[a-fA-F0-9]{40}$/,
    errorMessage: 'Invalid Worldcoin address. Must start with 0x and be 42 characters long.'
  },
  okx: {
    name: 'OKX Chain',
    symbol: 'OKT',
    placeholder: 'Enter OKX Chain Address (0x...)',
    validation: /^0x[a-fA-F0-9]{40}$/,
    errorMessage: 'Invalid OKX Chain address. Must start with 0x and be 42 characters long.'
  },
  bnb: {
    name: 'BNB Chain',
    symbol: 'BNB',
    placeholder: 'Enter BNB Chain Address (0x...)',
    validation: /^0x[a-fA-F0-9]{40}$/,
    errorMessage: 'Invalid BNB Chain address. Must start with 0x and be 42 characters long.'
  }
};

export default function Home() {
  const [address, setAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const validateAddress = (addr: string, chain: ChainType) => {
    const config = CHAIN_CONFIGS[chain];
    return config.validation.test(addr);
  };

  const handleAnalyze = async () => {
    console.log("Analyzing address:", address, "on chain:", selectedChain);
    setError('');

    if (!address) {
      setError('Address is required');
      return;
    }

    if (!validateAddress(address, selectedChain)) {
      setError(CHAIN_CONFIGS[selectedChain].errorMessage);
      return;
    }

    setLoading(true);
    try {
      // Pass chain parameter to API
      const res = await fetch(`/api/analyze?address=${address}&chain=${selectedChain}`);
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

  const handleDownloadReport = (format: 'json' | 'txt') => {
    if (!result) return;

    const report = generateReport(result, 'Investigator');
    downloadReport(report, format);
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
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport('txt')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg border border-blue-500 transition-all text-xs font-medium"
                  title="Download Text Report"
                >
                  <FileText size={14} />
                  Report (TXT)
                </button>
                <button
                  onClick={() => handleDownloadReport('json')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg border border-slate-800 transition-all text-xs font-medium"
                  title="Download JSON Data"
                >
                  <Download size={14} />
                  Data (JSON)
                </button>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg border border-slate-800 transition-all text-xs font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* Search with Chain Selector */}
        <div className="space-y-3">
          {/* Chain Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400 font-medium">Select Blockchain:</label>
            <select
              value={selectedChain}
              onChange={(e) => {
                setSelectedChain(e.target.value as ChainType);
                setError('');
                setAddress('');
              }}
              className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ethereum">🔷 Ethereum (ETH)</option>
              <option value="solana">🟣 Solana (SOL)</option>
              <option value="bitcoin">🟠 Bitcoin (BTC)</option>
              <option value="worldcoin">🌍 Worldcoin (WLD)</option>
              <option value="okx">⭕ OKX Chain (OKT)</option>
              <option value="bnb">🟡 BNB Chain (BNB)</option>
            </select>
            <div className="flex-1"></div>
            <div className="text-xs text-slate-500 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              Chain: <span className="text-blue-400 font-mono">{CHAIN_CONFIGS[selectedChain].name}</span>
            </div>
          </div>

          {/* Address Input */}
          <div className="relative bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex items-center shadow-lg shadow-blue-900/10">
            <div className="pl-4 text-slate-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder={CHAIN_CONFIGS[selectedChain].placeholder}
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
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Investigator Risk Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert size={80} />
            </div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Investigator Risk</h3>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${result?.investigatorRisk?.score > 70 ? 'text-red-500' :
                result?.investigatorRisk?.score > 50 ? 'text-orange-500' :
                  result?.investigatorRisk?.score > 30 ? 'text-yellow-500' : 'text-emerald-500'
                }`}>
                {result?.investigatorRisk?.score || '--'}
              </span>
              <span className="text-slate-500 mb-1 text-sm">/ 100</span>
            </div>
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${result?.investigatorRisk?.score > 70 ? 'bg-red-500' :
                  result?.investigatorRisk?.score > 50 ? 'bg-orange-500' :
                    result?.investigatorRisk?.score > 30 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                style={{ width: `${result?.investigatorRisk?.score || 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
              {result?.investigatorRisk?.level || 'Forensic Analysis'}
            </p>
          </div>

          {/* User Safety Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert size={80} />
            </div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">User Safety</h3>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${result?.userSafety?.score >= 70 ? 'text-emerald-500' :
                result?.userSafety?.score >= 50 ? 'text-yellow-500' :
                  result?.userSafety?.score >= 30 ? 'text-orange-500' : 'text-red-500'
                }`}>
                {result?.userSafety?.score || '--'}
              </span>
              <span className="text-slate-500 mb-1 text-sm">/ 100</span>
            </div>
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${result?.userSafety?.score >= 70 ? 'bg-emerald-500' :
                  result?.userSafety?.score >= 50 ? 'bg-yellow-500' :
                    result?.userSafety?.score >= 30 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                style={{ width: `${result?.userSafety?.score || 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
              {result?.userSafety?.level || 'Interaction Safety'}
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={80} />
            </div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Current Balance</h3>
            <div className="text-3xl font-bold text-white truncate">
              {result ? parseFloat(result.balance).toFixed(4) : '--'} <span className="text-sm text-slate-500">{result?.currency || 'ETH'}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-wide">{result?.chainName || 'Ethereum'}</p>
          </div>

          {/* Activity Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} />
            </div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Transaction Volume</h3>
            <div className="text-3xl font-bold text-white">
              {result ? result.transactionCount : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-wide">
              {result?.patterns?.uniqueRecipients ? `${result.patterns.uniqueRecipients} unique recipients` : 'Recent transactions'}
            </p>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                Money Flow Trace
                <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded">Audit Trail</span>
              </h2>
              {result && (
                <div className="text-xs text-slate-400">
                  Total Volume: <span className="text-blue-400 font-mono">{result.patterns?.totalVolume ? parseFloat(result.patterns.totalVolume).toFixed(4) : '0'} {result.currency}</span>
                </div>
              )}
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[500px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Flow</th>
                      <th className="px-4 py-3 font-medium">From → To</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium text-right">Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result?.transactions && result.transactions.length > 0 ? (
                      result.transactions.map((tx: any, i: number) => {
                        const isOut = tx.from.toLowerCase() === result.address.toLowerCase();
                        const peer = isOut ? tx.to : tx.from;
                        const timeAgo = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'Unknown';
                        return (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOut ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {isOut ? '↗ OUT' : '↙ IN'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <a
                                  href={`/api/analyze?address=${tx.from}`}
                                  className="font-mono text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                  title={tx.from}
                                >
                                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                </a>
                                <span className="text-slate-600 text-[10px]">→</span>
                                <a
                                  href={`/api/analyze?address=${tx.to}`}
                                  className="font-mono text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                  title={tx.to}
                                >
                                  {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                                </a>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-blue-400">
                                  {parseFloat(tx.value).toFixed(6)} {result.currency}
                                </span>
                                {tx.fee && (
                                  <span className="text-[10px] text-slate-500">
                                    Fee: {parseFloat(tx.fee).toFixed(6)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-400">{timeAgo.split(',')[0]}</span>
                                <span className="text-[10px] text-slate-600">{timeAgo.split(',')[1]}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-2 justify-end">
                                {tx.status === 'failed' && (
                                  <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded">FAILED</span>
                                )}
                                <a
                                  href={`https://etherscan.io/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-mono"
                                >
                                  {tx.hash.slice(0, 8)}...
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-20 text-center text-slate-600">
                          {loading ? 'Fetching transaction records...' : 'No transactions found for this address.'}
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
