/**
 * Unified Blockchain Interface
 * Central export point for all blockchain services
 */

import { ChainType, BlockchainService } from './chains/types';
import { ethereumService } from './chains/ethereum';
import { solanaService } from './chains/solana';
import { worldcoinService } from './chains/worldcoin';
import { bnbService } from './chains/bnb';
import { detectChain } from './chain-detector';

// Service registry
const services: Record<ChainType, BlockchainService> = {
    ethereum: ethereumService,
    solana: solanaService,
    worldcoin: worldcoinService,
    bnb: bnbService,
    bitcoin: ethereumService, // Placeholder until Bitcoin service is ready
    okx: ethereumService,      // Placeholder until OKX service is ready
};

/**
 * Get the appropriate blockchain service for an address
 */
export function getBlockchainService(address: string, chainOverride?: ChainType): BlockchainService | null {
    const chain = chainOverride || detectChain(address);
    if (!chain) return null;
    return services[chain];
}

/**
 * Get balance for any supported chain
 */
export async function getBalance(address: string, chain?: ChainType): Promise<string> {
    const service = getBlockchainService(address, chain);
    if (!service) throw new Error('Unsupported blockchain or invalid address');
    return service.getBalance(address);
}

/**
 * Get transactions for any supported chain
 */
export async function getTransactions(address: string, limit?: number, chain?: ChainType) {
    const service = getBlockchainService(address, chain);
    if (!service) throw new Error('Unsupported blockchain or invalid address');
    return service.getTransactions(address, limit);
}

/**
 * Analyze transaction patterns for any supported chain
 */
export async function analyzePatterns(address: string, chain?: ChainType) {
    const service = getBlockchainService(address, chain);
    if (!service) throw new Error('Unsupported blockchain or invalid address');
    return service.analyzePatterns(address);
}

/**
 * Validate address for any supported chain
 */
export function isValidAddress(address: string, chain?: ChainType): boolean {
    const service = getBlockchainService(address, chain);
    if (!service) return false;
    return service.validateAddress(address);
}

// Legacy exports for backward compatibility
export { provider, getHistory } from './chains/ethereum';
export { detectChain } from './chain-detector';
export type { ChainType } from './chains/types';
