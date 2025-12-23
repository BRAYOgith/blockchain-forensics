const { ethers } = require('ethers');
const fetch = require('node-fetch');

async function test(address) {
    const rpc = 'https://eth.llamarpc.com';
    const apiKey = 'S8HH4PVB3H1WH4F3SKCZFMN67UDYP24IDZ';

    console.log(`\n--- Testing: ${address} ---`);

    try {
        const provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: ethers.Network.from(1) });
        const balance = await provider.getBalance(address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

        const historyUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${apiKey}`;
        const response = await fetch(historyUrl);
        const data = await response.json();

        console.log(`Etherscan Status: ${data.status}`);
        console.log(`Etherscan Message: ${data.message}`);
        console.log(`Transactions found: ${Array.isArray(data.result) ? data.result.length : 'N/A'}`);
        if (data.status === "0") {
            console.log(`Wait, why 0? Result: ${JSON.stringify(data.result)}`);
        }
    } catch (e) {
        console.error(`Failed: ${e.message}`);
    }
}

const addresses = [
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0xfe9fb13e04c67b7936bf35aa2c8cff9ff140b8af'
];

(async () => {
    for (const a of addresses) await test(a);
})();
