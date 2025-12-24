/**
 * User Safety Scoring
 * Personal safety perspective - how safe is it to interact with this address?
 */

import { Transaction, PatternAnalysis } from '../chains/types';

export interface UserSafetyFactors {
    score: number;
    level: 'safe' | 'caution' | 'unsafe' | 'dangerous';
    factors: string[];
}

export function calculateUserSafety(
    balance: string,
    transactions: Transaction[],
    patterns: PatternAnalysis
): UserSafetyFactors {
    let score = 50; // Start neutral
    const factors: string[] = [];

    const balanceNum = parseFloat(balance);
    const txCount = transactions.length;

    // Long history = more trustworthy
    if (txCount >= 100) {
        score += 20;
        factors.push('Long transaction history (100+)');
    } else if (txCount >= 50) {
        score += 15;
        factors.push('Established history (50+)');
    } else if (txCount >= 10) {
        score += 10;
        factors.push('Moderate history (10+)');
    } else if (txCount < 5) {
        score -= 15;
        factors.push('New address (<5 transactions)');
    }

    // Consistent patterns = safer
    if (patterns.velocity > 168) { // > 1 week between transactions
        score += 15;
        factors.push('Long holding periods (safe)');
    } else if (patterns.velocity > 24) {
        score += 10;
        factors.push('Moderate activity pace');
    } else if (patterns.velocity > 0 && patterns.velocity < 1) {
        score -= 20;
        factors.push('Rapid fund movement (risky)');
    }

    // Stable balance = safer
    if (balanceNum > 0.1 && balanceNum < 1000) {
        score += 10;
        factors.push('Stable balance range');
    } else if (balanceNum > 1000) {
        score += 5; // Large balance can be exchange (safe) or whale (risky)
        factors.push('Large balance holder');
    } else if (balanceNum < 0.01) {
        score -= 5;
        factors.push('Very low balance');
    }

    // Few recipients = personal use (safer)
    if (patterns.uniqueRecipients <= 5) {
        score += 10;
        factors.push('Limited recipients (personal use)');
    } else if (patterns.uniqueRecipients > 50) {
        score -= 15;
        factors.push('Many recipients (distribution pattern)');
    }

    // Round numbers can indicate automated/exchange (safer) or structuring (risky)
    // Context matters, so we're neutral here
    if (patterns.roundNumberRatio > 0.8) {
        score += 5;
        factors.push('Consistent transaction amounts');
    }

    // Successful transactions = safer
    const failedTxs = transactions.filter(tx => tx.status === 'failed');
    if (failedTxs.length === 0 && txCount > 0) {
        score += 10;
        factors.push('All transactions successful');
    } else if (failedTxs.length > txCount * 0.1) {
        score -= 10;
        factors.push('High failure rate (>10%)');
    }

    // Cap between 0-100
    score = Math.max(0, Math.min(score, 100));

    // Determine safety level
    let level: 'safe' | 'caution' | 'unsafe' | 'dangerous';
    if (score >= 70) level = 'safe';
    else if (score >= 50) level = 'caution';
    else if (score >= 30) level = 'unsafe';
    else level = 'dangerous';

    return { score, level, factors };
}
