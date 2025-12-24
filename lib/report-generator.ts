/**
 * Investigation Report Generator
 * Creates downloadable reports of blockchain forensic analysis
 */

export interface AnalysisResult {
    address: string;
    chain: string;
    chainName: string;
    currency: string;
    balance: string;
    transactionCount: number;
    riskScore: {
        investigatorRisk: {
            score: number;
            level: string;
            factors: string[];
        };
        userSafety: {
            score: number;
            level: string;
            factors: string[];
        };
    };
    patterns: {
        velocity: number;
        uniqueRecipients: number;
        uniqueSenders: number;
        roundNumberRatio: number;
        avgTransactionValue: string;
        totalVolume: string;
    };
    transactions: Array<{
        hash: string;
        from: string;
        to: string;
        value: string;
        timestamp: number;
        status: string;
    }>;
}

export interface InvestigationReport {
    reportId: string;
    timestamp: string;
    investigator: string;
    analysis: AnalysisResult;
    summary: string;
    findings: string[];
    recommendations: string[];
}

export function generateReport(
    analysis: AnalysisResult,
    investigator: string = 'Anonymous'
): InvestigationReport {
    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Generate findings based on risk scores
    const findings: string[] = [];

    // Investigator Risk Findings
    if (analysis.riskScore.investigatorRisk.score >= 75) {
        findings.push(`CRITICAL: High investigator risk score (${analysis.riskScore.investigatorRisk.score}/100)`);
    }
    analysis.riskScore.investigatorRisk.factors.forEach(factor => {
        findings.push(`Investigator Alert: ${factor}`);
    });

    // User Safety Findings
    if (analysis.riskScore.userSafety.score < 30) {
        findings.push(`WARNING: Low user safety score (${analysis.riskScore.userSafety.score}/100)`);
    }
    analysis.riskScore.userSafety.factors.forEach(factor => {
        findings.push(`Safety Note: ${factor}`);
    });

    // Transaction Pattern Findings
    if (analysis.patterns.velocity < 1) {
        findings.push('ALERT: Rapid fund movement detected (< 1 hour average)');
    }
    if (analysis.patterns.uniqueRecipients > 50) {
        findings.push(`ALERT: High distribution pattern (${analysis.patterns.uniqueRecipients} unique recipients)`);
    }
    if (analysis.patterns.roundNumberRatio > 0.5) {
        findings.push(`ALERT: High round number ratio (${(analysis.patterns.roundNumberRatio * 100).toFixed(1)}%) - potential structuring`);
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (analysis.riskScore.investigatorRisk.score >= 75) {
        recommendations.push('Recommend further investigation and monitoring');
        recommendations.push('Consider flagging for compliance review');
    }

    if (analysis.riskScore.userSafety.score < 50) {
        recommendations.push('Advise users to exercise extreme caution when interacting with this address');
    }

    if (analysis.patterns.uniqueRecipients > 20) {
        recommendations.push('Analyze recipient addresses for clustering patterns');
    }

    if (findings.length === 0) {
        findings.push('No significant red flags detected');
        recommendations.push('Continue standard monitoring procedures');
    }

    // Generate summary
    const summary = `
Blockchain forensic analysis of ${analysis.chain} address ${analysis.address}.
Investigator Risk: ${analysis.riskScore.investigatorRisk.level.toUpperCase()} (${analysis.riskScore.investigatorRisk.score}/100)
User Safety: ${analysis.riskScore.userSafety.level.toUpperCase()} (${analysis.riskScore.userSafety.score}/100)
Transaction Count: ${analysis.transactionCount}
Total Volume: ${analysis.patterns.totalVolume} ${analysis.currency}
  `.trim();

    return {
        reportId,
        timestamp,
        investigator,
        analysis,
        summary,
        findings,
        recommendations,
    };
}

export function exportReportAsJSON(report: InvestigationReport): string {
    return JSON.stringify(report, null, 2);
}

export function exportReportAsText(report: InvestigationReport): string {
    const { analysis } = report;

    return `
═══════════════════════════════════════════════════════════════
                BLOCKCHAIN FORENSIC INVESTIGATION REPORT
═══════════════════════════════════════════════════════════════

Report ID: ${report.reportId}
Generated: ${new Date(report.timestamp).toLocaleString()}
Investigator: ${report.investigator}

───────────────────────────────────────────────────────────────
SUBJECT INFORMATION
───────────────────────────────────────────────────────────────

Blockchain: ${analysis.chainName}
Address: ${analysis.address}
Balance: ${analysis.balance} ${analysis.currency}
Transaction Count: ${analysis.transactionCount}

───────────────────────────────────────────────────────────────
RISK ASSESSMENT
───────────────────────────────────────────────────────────────

INVESTIGATOR RISK SCORE: ${analysis.riskScore.investigatorRisk.score}/100
Risk Level: ${analysis.riskScore.investigatorRisk.level.toUpperCase()}
Factors:
${analysis.riskScore.investigatorRisk.factors.map(f => `  • ${f}`).join('\n')}

USER SAFETY SCORE: ${analysis.riskScore.userSafety.score}/100
Safety Level: ${analysis.riskScore.userSafety.level.toUpperCase()}
Factors:
${analysis.riskScore.userSafety.factors.map(f => `  • ${f}`).join('\n')}

───────────────────────────────────────────────────────────────
TRANSACTION PATTERNS
───────────────────────────────────────────────────────────────

Velocity: ${analysis.patterns.velocity.toFixed(2)} hours (avg time between transactions)
Unique Recipients: ${analysis.patterns.uniqueRecipients}
Unique Senders: ${analysis.patterns.uniqueSenders}
Round Number Ratio: ${(analysis.patterns.roundNumberRatio * 100).toFixed(1)}%
Average Transaction: ${analysis.patterns.avgTransactionValue} ${analysis.currency}
Total Volume: ${analysis.patterns.totalVolume} ${analysis.currency}

───────────────────────────────────────────────────────────────
FINDINGS
───────────────────────────────────────────────────────────────

${report.findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

───────────────────────────────────────────────────────────────
RECOMMENDATIONS
───────────────────────────────────────────────────────────────

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

───────────────────────────────────────────────────────────────
RECENT TRANSACTIONS (Latest ${Math.min(10, analysis.transactions.length)})
───────────────────────────────────────────────────────────────

${analysis.transactions.slice(0, 10).map((tx, i) => `
${i + 1}. Hash: ${tx.hash}
   From: ${tx.from}
   To: ${tx.to}
   Value: ${tx.value} ${analysis.currency}
   Time: ${new Date(tx.timestamp * 1000).toLocaleString()}
   Status: ${tx.status.toUpperCase()}
`).join('\n')}

═══════════════════════════════════════════════════════════════
                        END OF REPORT
═══════════════════════════════════════════════════════════════

This report is generated by CryptoTrace Blockchain Forensics Tool
For official use only. Handle with appropriate confidentiality.
  `.trim();
}

export function downloadReport(report: InvestigationReport, format: 'json' | 'txt' = 'txt') {
    const content = format === 'json'
        ? exportReportAsJSON(report)
        : exportReportAsText(report);

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
