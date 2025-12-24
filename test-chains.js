/**
 * Multi-Chain Test Script
 * Tests chain detection and blockchain services
 */

const { detectChain, getChainName, getChainCurrency } = require('./lib/chain-detector');

console.log('=== Multi-Chain Detection Test ===\n');

// Test addresses
const testAddresses = {
    ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    solana: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    worldcoin: '0x163f8C2467924be0ae7B5347228CABF260318753',
    bnb: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
};

for (const [name, address] of Object.entries(testAddresses)) {
    const chain = detectChain(address);
    if (chain) {
        console.log(`✓ ${name.toUpperCase()}`);
        console.log(`  Address: ${address}`);
        console.log(`  Detected: ${getChainName(chain)} (${getChainCurrency(chain)})`);
        console.log('');
    } else {
        console.log(`✗ ${name.toUpperCase()} - Detection failed`);
        console.log('');
    }
}

console.log('=== Test Complete ===');
