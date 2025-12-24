/**
 * Investigator Risk Scoring
 * Forensic analysis perspective - how suspicious is this address?
 */

import { Transaction, PatternAnalysis } from '../chains/types';

export interface InvestigatorRiskFactors {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
}

export function calculateInvestigatorRisk(
    balance: string,
    transactions: Transaction[],
    patterns: PatternAnalysis
): InvestigatorRiskFactors {
    let score = 10; // Base score
    const factors: string[] = [];

    const balanceNum = parseFloat(balance);
    const txCount = transactions.length;

    // Large balance detection (potential money laundering)
    if (balanceNum > 1000) {
        score += 30;
        factors.push('Very large balance (>1000)');
    } else if (balanceNum > 100) {
        score += 20;
        factors.push('Large balance (>100)');
    } else if (balanceNum > 10) {
        score += 10;
        factors.push('Significant balance (>10)');
    }

    // High transaction volume
    if (txCount >= 100) {
        score += 25;
        factors.push('Very high transaction count (100+)');
    } else if (txCount >= 50) {
        score += 15;
        factors.push('High transaction count (50+)');
    } else if (txCount >= 10) {
        score += 5;
        factors.push('Active address (10+ transactions)');
    }

    // Rapid fund movement (low velocity = quick turnaround)
    if (patterns.velocity > 0 && patterns.velocity < 1) {
        score += 20;
        factors.push('Rapid fund movement (<1 hour avg)');
    } else if (patterns.velocity < 24) {
        score += 10;
        factors.push('Quick fund movement (<24 hours avg)');
    }

    // Many unique recipients (potential distribution)
    if (patterns.uniqueRecipients > 50) {
        score += 20;
        factors.push('Many unique recipients (50+)');
    } else if (patterns.uniqueRecipients > 20) {
        score += 10;
        factors.push('Multiple recipients (20+)');
    }

    // Round number transactions (potential structuring)
    if (patterns.roundNumberRatio > 0.5) {
        score += 15;
        factors.push('High round number ratio (>50%)');
    } else if (patterns.roundNumberRatio > 0.3) {
        score += 8;
        factors.push('Moderate round numbers (>30%)');
    }

    // High value transactions
    const highValueTxs = transactions.filter(tx => parseFloat(tx.value) > 100);
    if (highValueTxs.length > 10) {
        score += 15;
        factors.push('Multiple high-value transactions (10+)');
    } else if (highValueTxs.length > 0) {
        score += 5;
        factors.push('High-value transactions detected');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 75) level = 'critical';
    else if (score >= 50) level = 'high';
    else if (score >= 30) level = 'medium';
    else level = 'low';

    return { score, level, factors };
}
