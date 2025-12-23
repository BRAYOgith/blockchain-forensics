import { NextResponse } from 'next/server';
import { isValidAddress, getBalance, provider, getHistory } from '@/lib/blockchain';
import { auth } from "@/auth";

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    console.log(`[API] Analyze Request received for: ${address} at ${new Date().toISOString()}`); // Real-time log

    if (!address || !isValidAddress(address)) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    try {
        const balance = await getBalance(address);
        // Fetch latest block to show we are connected
        let blockNumber = 0;
        try {
            blockNumber = await provider.getBlockNumber();
        } catch (e) {
            console.error("Failed to get block number:", e);
        }

        // Fetch real history
        const transactions = await getHistory(address);

        // Calculate advanced heuristic risk score
        let riskScore = 15; // Base investigator confidence
        const ethBalance = parseFloat(balance);

        // Whale detection (Data from investigator query)
        if (ethBalance > 1000) riskScore += 60; // Mega Whale (Binance etc)
        else if (ethBalance > 50) riskScore += 40; // High Balance Wallet
        else if (ethBalance > 10) riskScore += 20;

        // Activity detection
        if (transactions.length >= 10) riskScore += 25; // Active Target
        else if (transactions.length > 5) riskScore += 10;

        // High Value Activity
        if (transactions.some((tx: any) => parseFloat(tx.value) > 100)) riskScore += 30;

        // Cap at 99 for visibility
        riskScore = Math.min(riskScore, 99);

        return NextResponse.json({
            address,
            balance,
            blockNumber,
            riskScore,
            transactionCount: transactions.length, // Explicit count for dashboard
            transactions,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to analyze address' }, { status: 500 });
    }
}
