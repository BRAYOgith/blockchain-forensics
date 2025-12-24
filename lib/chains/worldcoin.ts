/**
 * Worldcoin Blockchain Service
 * Uses Worldscan API (Etherscan-compatible) for World Chain data
 */

import { ethers } from 'ethers';
import { BlockchainService, Transaction, PatternAnalysis } from './types';

const WORLDSCAN_API_URL = 'https://worldchain-mainnet.explorer.alchemy.com/api';
const WORLDSCAN_API_KEY = process.env.WORLDSCAN_API_KEY || process.env.ETHERSCAN_API_KEY;

export class WorldcoinService implements BlockchainService {
    validateAddress(address: string): boolean {
        return ethers.isAddress(address);
    }

    async getBalance(address: string): Promise<string> {
        try {
            // Using Alchemy's World Chain RPC
            const provider = new ethers.JsonRpcProvider('https://worldchain-mainnet.g.alchemy.com/public');
            const balance = await provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('[Worldcoin] Failed to get balance:', error);
            throw new Error('Failed to fetch Worldcoin balance');
        }
    }

    async getTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
        try {
            // Worldscan uses Etherscan-compatible API
            const response = await fetch(
                `${WORLDSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${WORLDSCAN_API_KEY}`
            );
            const data = await response.json();

            if (data.status === '1' && Array.isArray(data.result)) {
                return data.result.map((tx: any) => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value),
                    timestamp: parseInt(tx.timeStamp),
                    chain: 'worldcoin' as const,
                    fee: tx.gasUsed && tx.gasPrice ? ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice)) : undefined,
                    status: tx.isError === '0' ? 'success' : 'failed',
                }));
            }

            return [];
        } catch (error) {
            console.error('[Worldcoin] Failed to get transactions:', error);
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

        const recipients = new Set(transactions.map(tx => tx.to));
        const senders = new Set(transactions.map(tx => tx.from));

        // Calculate velocity
        const timestamps = transactions.map(tx => tx.timestamp).sort((a, b) => a - b);
        let totalTimeDiff = 0;
        for (let i = 1; i < timestamps.length; i++) {
            totalTimeDiff += timestamps[i] - timestamps[i - 1];
        }
        const velocity = timestamps.length > 1 ? totalTimeDiff / (timestamps.length - 1) / 3600 : 0;

        // Calculate round number ratio
        const roundNumbers = transactions.filter(tx => {
            const value = parseFloat(tx.value);
            return value > 0 && value === Math.floor(value);
        });
        const roundNumberRatio = transactions.length > 0 ? roundNumbers.length / transactions.length : 0;

        // Calculate total volume and average
        const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
        const avgTransactionValue = totalVolume / transactions.length;

        return {
            velocity,
            uniqueRecipients: recipients.size,
            uniqueSenders: senders.size,
            roundNumberRatio,
            avgTransactionValue: avgTransactionValue.toString(),
            totalVolume: totalVolume.toString(),
        };
    }
}

export const worldcoinService = new WorldcoinService();
