/**
 * Solana Blockchain Service
 * Uses Helius RPC for Solana mainnet data
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BlockchainService, Transaction, PatternAnalysis } from './types';

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export class SolanaService implements BlockchainService {
    private connection: Connection;

    constructor() {
        this.connection = new Connection(HELIUS_RPC_URL, 'confirmed');
    }

    validateAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            const publicKey = new PublicKey(address);
            const balance = await this.connection.getBalance(publicKey);
            return (balance / LAMPORTS_PER_SOL).toString();
        } catch (error) {
            console.error('[Solana] Failed to get balance:', error);
            throw new Error('Failed to fetch Solana balance');
        }
    }

    async getTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
        try {
            const publicKey = new PublicKey(address);
            const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });

            console.log(`[Solana] Found ${signatures.length} signatures for address`);

            const transactions: Transaction[] = [];

            for (const sig of signatures) {
                try {
                    const tx = await this.connection.getTransaction(sig.signature, {
                        maxSupportedTransactionVersion: 0,
                    });

                    if (!tx || !tx.meta) {
                        console.log(`[Solana] Skipping tx ${sig.signature} - no data`);
                        continue;
                    }

                    // For versioned transactions, use staticAccountKeys instead
                    let from = '';
                    let to = '';

                    try {
                        // Try to get account keys safely
                        const message = tx.transaction.message;

                        // Use staticAccountKeys for versioned transactions
                        if ('staticAccountKeys' in message) {
                            const keys = message.staticAccountKeys;
                            from = keys[0]?.toString() || '';
                            to = keys.length > 1 ? keys[1]?.toString() || '' : '';
                        } else {
                            // Legacy transaction
                            const accountKeys = message.getAccountKeys();
                            from = accountKeys.get(0)?.toString() || '';
                            to = accountKeys.length > 1 ? accountKeys.get(1)?.toString() || '' : '';
                        }
                    } catch (keyError) {
                        // If we can't get keys, use meta account keys
                        if (tx.meta.preTokenBalances && tx.meta.preTokenBalances.length > 0) {
                            from = tx.meta.preTokenBalances[0]?.owner || '';
                        }
                        console.log(`[Solana] Using fallback for tx ${sig.signature}`);
                    }

                    // Calculate value from balance changes
                    let value = '0';
                    if (tx.meta.preBalances && tx.meta.postBalances && tx.meta.preBalances.length > 0) {
                        const balanceChange = Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0]);
                        value = (balanceChange / LAMPORTS_PER_SOL).toString();
                    }

                    transactions.push({
                        hash: sig.signature,
                        from: from || 'Unknown',
                        to: to || 'Unknown',
                        value,
                        timestamp: sig.blockTime || 0,
                        chain: 'solana',
                        fee: tx.meta?.fee ? (tx.meta.fee / LAMPORTS_PER_SOL).toString() : undefined,
                        status: tx.meta?.err ? 'failed' : 'success',
                    });
                } catch (txError: any) {
                    console.error(`[Solana] Error parsing tx ${sig.signature}:`, txError.message);
                    continue;
                }
            }

            console.log(`[Solana] Successfully parsed ${transactions.length} transactions`);
            return transactions;
        } catch (error) {
            console.error('[Solana] Failed to get transactions:', error);
            return [];
        }
    }

    async analyzePatterns(address: string): Promise<PatternAnalysis> {
        const transactions = await this.getTransactions(address, 50);

        if (transactions.length === 0) {
            return {
                velocity: 0,
                uniqueRecipients: 0,
                uniqueSenders: 0,
                roundNumberRatio: 0,
                avgTransactionValue: '0',
                totalVolume: '0',
            };
        }

        // Calculate unique recipients and senders
        const recipients = new Set(transactions.map(tx => tx.to));
        const senders = new Set(transactions.map(tx => tx.from));

        // Calculate velocity (avg time between transactions)
        const timestamps = transactions.map(tx => tx.timestamp).sort((a, b) => a - b);
        let totalTimeDiff = 0;
        for (let i = 1; i < timestamps.length; i++) {
            totalTimeDiff += timestamps[i] - timestamps[i - 1];
        }
        const velocity = timestamps.length > 1 ? totalTimeDiff / (timestamps.length - 1) / 3600 : 0;

        return {
            velocity,
            uniqueRecipients: recipients.size,
            uniqueSenders: senders.size,
            roundNumberRatio: 0, // Would need value parsing
            avgTransactionValue: '0',
            totalVolume: '0',
        };
    }
}

export const solanaService = new SolanaService();
