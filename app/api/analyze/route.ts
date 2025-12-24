import { NextResponse } from 'next/server';
import {
    isValidAddress,
    getBalance,
    getTransactions,
    analyzePatterns,
    detectChain,
    type ChainType
} from '@/lib/blockchain';
import { auth } from "@/auth";
import { calculateInvestigatorRisk } from '@/lib/risk-scoring/investigator-score';
import { calculateUserSafety } from '@/lib/risk-scoring/user-safety-score';
import { getChainName, getChainCurrency } from '@/lib/chain-detector';

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainParam = searchParams.get('chain') as ChainType | null;

    console.log(`[API] Analyze Request received for: ${address} at ${new Date().toISOString()}`);

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        // Auto-detect chain or use provided chain
        const detectedChain = chainParam || detectChain(address);

        if (!detectedChain) {
            return NextResponse.json({
                error: 'Could not detect blockchain type. Please specify chain parameter.'
            }, { status: 400 });
        }

        // Validate address for the detected chain
        if (!isValidAddress(address, detectedChain)) {
            return NextResponse.json({
                error: `Invalid ${getChainName(detectedChain)} address`
            }, { status: 400 });
        }

        console.log(`[API] Detected chain: ${detectedChain}`);

        // Fetch blockchain data
        const balance = await getBalance(address, detectedChain);
        const transactions = await getTransactions(address, 50, detectedChain);
        const patterns = await analyzePatterns(address, detectedChain);

        // Calculate dual risk scores
        const investigatorRisk = calculateInvestigatorRisk(balance, transactions, patterns);
        const userSafety = calculateUserSafety(balance, transactions, patterns);

        // Known interactions (placeholder - will be enhanced later)
        const knownInteractions = {
            exchanges: [],
            mixers: [],
            defi: [],
        };

        return NextResponse.json({
            address,
            chain: detectedChain,
            chainName: getChainName(detectedChain),
            currency: getChainCurrency(detectedChain),
            balance,
            transactionCount: transactions.length,

            // Dual risk scores
            investigatorRisk: {
                score: investigatorRisk.score,
                level: investigatorRisk.level,
                factors: investigatorRisk.factors,
            },

            userSafety: {
                score: userSafety.score,
                level: userSafety.level,
                factors: userSafety.factors,
            },

            // Pattern analysis
            patterns: {
                velocity: patterns.velocity,
                uniqueRecipients: patterns.uniqueRecipients,
                uniqueSenders: patterns.uniqueSenders,
                roundNumberRatio: patterns.roundNumberRatio,
                avgTransactionValue: patterns.avgTransactionValue,
                totalVolume: patterns.totalVolume,
            },

            knownInteractions,
            transactions: transactions.slice(0, 10), // Return latest 10 for display
        });
    } catch (error: any) {
        console.error('[API] Analysis error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to analyze address'
        }, { status: 500 });
    }
}
