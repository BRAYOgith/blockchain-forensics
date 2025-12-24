/**
 * Chain Type Definitions
 * Unified interfaces for all 6 supported blockchains
 */

export type ChainType = 'ethereum' | 'bitcoin' | 'solana' | 'worldcoin' | 'okx' | 'bnb';

export interface BlockchainService {
    getBalance(address: string): Promise<string>;
    getTransactions(address: string, limit?: number): Promise<Transaction[]>;
    analyzePatterns(address: string): Promise<PatternAnalysis>;
    validateAddress(address: string): boolean;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    chain: ChainType;
    fee?: string;
    status: 'success' | 'failed';
}

export interface PatternAnalysis {
    velocity: number;           // avg hours between receive/send
    uniqueRecipients: number;
    uniqueSenders: number;
    roundNumberRatio: number;   // % of round number transactions
    avgTransactionValue: string;
    totalVolume: string;
}

export interface RiskScore {
    investigatorRisk: RiskDetail;
    userSafety: RiskDetail;
}

export interface RiskDetail {
    score: number;              // 0-100
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];          // Risk factors identified
}

export interface AnalysisResult {
    address: string;
    chain: ChainType;
    balance: string;
    transactionCount: number;
    riskScore: RiskScore;
    patterns: PatternAnalysis;
    transactions: Transaction[];
    knownInteractions: {
        exchanges: string[];
        mixers: string[];
        defi: string[];
    };
}
