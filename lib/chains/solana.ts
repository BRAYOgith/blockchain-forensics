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

            const transactions: Transaction[] = [];

            for (const sig of signatures) {
                const tx = await this.connection.getTransaction(sig.signature, {
                    maxSupportedTransactionVersion: 0,
                });

                if (!tx) continue;

                // Extract basic transaction info
                const accountKeys = tx.transaction.message.getAccountKeys();
                const from = accountKeys.get(0)?.toString() || '';
                const to = accountKeys.get(1)?.toString() || '';

                transactions.push({
                    hash: sig.signature,
                    from,
                    to,
                    value: '0', // Solana transactions are complex, would need detailed parsing
                    timestamp: sig.blockTime || 0,
                    chain: 'solana',
                    fee: tx.meta?.fee ? (tx.meta.fee / LAMPORTS_PER_SOL).toString() : undefined,
                    status: tx.meta?.err ? 'failed' : 'success',
                });
            }

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
