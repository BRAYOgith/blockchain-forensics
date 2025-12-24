/**
 * Ethereum Blockchain Service
 * Refactored to match unified BlockchainService interface
 */

import { ethers } from 'ethers';
import { BlockchainService, Transaction, PatternAnalysis } from './types';

const RPC_URLS = [
    process.env.NEXT_PUBLIC_INFURA_KEY ? `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}` : null,
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
    'https://rpc.ankr.com/eth'
].filter(Boolean) as string[];

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'S8HH4PVB3H1WH4F3SKCZFMN67UDYP24IDZ';

export class EthereumService implements BlockchainService {
    private provider: ethers.JsonRpcProvider;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URLS[0], undefined, {
            staticNetwork: ethers.Network.from(1)
        });
    }

    validateAddress(address: string): boolean {
        try {
            return address.startsWith('0x') && ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    async getBalance(address: string): Promise<string> {
        // Try each RPC URL if the previous one fails
        for (const url of RPC_URLS) {
            try {
                const tempProvider = new ethers.JsonRpcProvider(url, undefined, {
                    staticNetwork: ethers.Network.from(1)
                });
                const balance = await tempProvider.getBalance(address);
                return ethers.formatEther(balance);
            } catch (error: any) {
                console.error(`[Ethereum] RPC failed for ${url}:`, error.message || error);
                continue;
            }
        }
        throw new Error('All RPC providers failed to fetch balance');
    }

    async getTransactions(address: string, limit: number = 10): Promise<Transaction[]> {
        try {
            const response = await fetch(
                `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
            );
            const data = await response.json();

            if (data.status === '0' && data.message !== 'No transactions found') {
                console.error(`[Ethereum] Etherscan API Error: ${data.result}`);
            }

            if (data.status === '1' && Array.isArray(data.result)) {
                return data.result.map((tx: any) => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value),
                    timestamp: parseInt(tx.timeStamp),
                    chain: 'ethereum' as const,
                    fee: tx.gasUsed && tx.gasPrice ? ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice)) : undefined,
                    status: tx.isError === '0' ? 'success' : 'failed',
                }));
            }

            return [];
        } catch (error) {
            console.error('[Ethereum] Failed to fetch history:', error);
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

        // Calculate velocity (avg hours between transactions)
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

export const ethereumService = new EthereumService();

// Legacy exports for backward compatibility
export const provider = new ethers.JsonRpcProvider(RPC_URLS[0], undefined, {
    staticNetwork: ethers.Network.from(1)
});

export const isValidAddress = (address: string) => {
    try {
        return address.startsWith('0x') && ethers.isAddress(address);
    } catch {
        return false;
    }
};

export const getBalance = async (address: string) => {
    return ethereumService.getBalance(address);
};

export const getHistory = async (address: string) => {
    const transactions = await ethereumService.getTransactions(address);
    return transactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timeStamp: tx.timestamp,
    }));
};
