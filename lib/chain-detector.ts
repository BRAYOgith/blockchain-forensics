/**
 * Chain Detection Utility
 * Automatically detects which blockchain an address belongs to based on format
 */

import { ChainType } from './chains/types';

/**
 * Detects the blockchain type from an address format
 */
export function detectChain(address: string): ChainType | null {
    if (!address || typeof address !== 'string') {
        return null;
    }

    const addr = address.trim();

    // Bitcoin addresses
    // Legacy: starts with 1 or 3
    // SegWit: starts with bc1
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr) || /^bc1[a-z0-9]{39,59}$/.test(addr)) {
        return 'bitcoin';
    }

    // Solana addresses
    // Base58 encoded, 32-44 characters, no 0, O, I, l
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) && !addr.startsWith('0x')) {
        return 'solana';
    }

    // EVM-compatible chains (Ethereum, Worldcoin, OKX Chain, BNB Chain)
    // All start with 0x and are 42 characters long
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        // For EVM chains, we need additional context to differentiate
        // For now, we'll default to ethereum and let the user specify if needed
        // In production, you could check against known contract addresses or chain IDs
        return 'ethereum'; // Default for 0x addresses
    }

    return null;
}

/**
 * Validates if an address is valid for a specific chain
 */
export function validateAddressForChain(address: string, chain: ChainType): boolean {
    const detectedChain = detectChain(address);

    // For EVM chains, any 0x address is valid across all EVM chains
    const evmChains: ChainType[] = ['ethereum', 'worldcoin', 'okx', 'bnb'];
    if (evmChains.includes(chain) && detectedChain && evmChains.includes(detectedChain)) {
        return true;
    }

    return detectedChain === chain;
}

/**
 * Gets the chain name for display
 */
export function getChainName(chain: ChainType): string {
    const names: Record<ChainType, string> = {
        ethereum: 'Ethereum',
        bitcoin: 'Bitcoin',
        solana: 'Solana',
        worldcoin: 'Worldcoin',
        okx: 'OKX Chain',
        bnb: 'BNB Chain',
    };
    return names[chain];
}

/**
 * Gets the chain's native currency symbol
 */
export function getChainCurrency(chain: ChainType): string {
    const currencies: Record<ChainType, string> = {
        ethereum: 'ETH',
        bitcoin: 'BTC',
        solana: 'SOL',
        worldcoin: 'WLD',
        okx: 'OKT',
        bnb: 'BNB',
    };
    return currencies[chain];
}

/**
 * Gets the block explorer URL for a chain
 */
export function getExplorerUrl(chain: ChainType, address: string): string {
    const explorers: Record<ChainType, string> = {
        ethereum: `https://etherscan.io/address/${address}`,
        bitcoin: `https://blockchair.com/bitcoin/address/${address}`,
        solana: `https://solscan.io/account/${address}`,
        worldcoin: `https://worldchain-mainnet.explorer.alchemy.com/address/${address}`,
        okx: `https://www.oklink.com/oktc/address/${address}`,
        bnb: `https://bscscan.com/address/${address}`,
    };
    return explorers[chain];
}
