import { ethers } from 'ethers';

// Use reliable RPC endpoints - prioritizing Infura as requested
const RPC_URLS = [
    process.env.NEXT_PUBLIC_INFURA_KEY ? `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}` : null,
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
    'https://rpc.ankr.com/eth'
].filter(Boolean) as string[];

export const provider = new ethers.JsonRpcProvider(RPC_URLS[0], undefined, {
    staticNetwork: ethers.Network.from(1)
});

export const isValidAddress = (address: string) => {
    try {
        // Strict validation: Must start with 0x and be a valid address
        return address.startsWith('0x') && ethers.isAddress(address);
    } catch {
        return false;
    }
};

export const getBalance = async (address: string) => {
    // Try each RPC URL if the previous one fails
    for (const url of RPC_URLS) {
        try {
            const tempProvider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: ethers.Network.from(1) });
            const balance = await tempProvider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error: any) {
            console.error(`RPC failed for ${url}:`, error.message || error);
            continue; // try next
        }
    }
    throw new Error("All RPC providers failed to fetch balance");
};

export const getHistory = async (address: string) => {
    try {
        const apiKey = process.env.ETHERSCAN_API_KEY || 'S8HH4PVB3H1WH4F3SKCZFMN67UDYP24IDZ';
        // Etherscan API V2 requires chainid=1 for Ethereum Mainnet
        const response = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`);
        const data = await response.json();

        // Log error if any to terminal for investigator visibility
        if (data.status === "0" && data.message !== "No transactions found") {
            console.error(`[Etherscan API Error] ${data.result}`);
        }

        if (data.status === "1" && Array.isArray(data.result)) {
            return data.result.map((tx: any) => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                timeStamp: parseInt(tx.timeStamp),
            }));
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return [];
    }
};
