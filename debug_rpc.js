const { ethers } = require('ethers');

async function test(address) {
    const rpcs = [
        'https://cloudflare-eth.com',
        'https://eth.llamarpc.com',
        'https://rpc.ankr.com/eth'
    ];

    console.log(`Testing address: ${address}`);

    for (const rpc of rpcs) {
        console.log(`\nConnecting to: ${rpc}`);
        try {
            const provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: ethers.Network.from(1) });
            const balance = await provider.getBalance(address);
            console.log(`Success! Balance: ${ethers.formatEther(balance)} ETH`);
        } catch (e) {
            console.error(`Failed: ${e.message}`);
        }
    }
}

test('0xfe9fb13e04c67b7936bf35aa2c8cff9ff140b8af');
