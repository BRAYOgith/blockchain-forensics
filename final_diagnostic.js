const https = require('https');
const { ethers } = require('ethers');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function test(address) {
    const rpc = 'https://eth.llamarpc.com'; // Known good
    const apiKey = 'S8HH4PVB3H1WH4F3SKCZFMN67UDYP24IDZ';

    console.log(`\n--- Diagnostic: ${address} ---`);

    try {
        const provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: ethers.Network.from(1) });
        const balance = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balance);
        console.log(`Current Balance: ${ethBalance} ETH`);

        const historyUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey}`;
        const data = await get(historyUrl);

        console.log(`Etherscan API Status: ${data.status} (${data.message})`);
        if (data.status === "0") {
            console.error(`Etherscan Error Detail: ${data.result}`);
        }
        const txCount = Array.isArray(data.result) ? data.result.length : 0;
        console.log(`Recent Transaction Count (Etherscan API): ${txCount}`);

        return { address, balance: ethBalance, txCount };
    } catch (e) {
        console.error(`Diagnostic Failed for ${address}: ${e.message}`);
        return { address, error: e.message };
    }
}

const addresses = [
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0xfe9fb13e04c67b7936bf35aa2c8cff9ff140b8af'
];

(async () => {
    const results = [];
    for (const a of addresses) {
        results.push(await test(a));
    }
    console.log('\n--- FINAL SUMMARY TABLE ---');
    console.table(results);
})();
