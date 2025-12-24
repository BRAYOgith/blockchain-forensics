# 🔍 CryptoTrace - Blockchain Forensics Tool

A professional blockchain forensics and anti-money laundering (AML) tool supporting **6 major blockchains** with dual-perspective risk scoring.

![Multi-Chain Support](https://img.shields.io/badge/Chains-6-blue)
![Risk Scoring](https://img.shields.io/badge/Risk%20Scoring-Dual%20Perspective-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

## 🌟 Features

### Multi-Chain Support
- ✅ **Ethereum** (ETH) - Full support
- ✅ **Solana** (SOL) - Full support with versioned transactions
- ✅ **BNB Chain** (BNB) - RPC fallback support
- ✅ **Worldcoin** (WLD) - Human-verified chain
- ⏳ **Bitcoin** (BTC) - Pending API key
- ⏳ **OKX Chain** (OKT) - Pending setup

### Dual-Perspective Risk Scoring
- **Investigator Risk** (0-100): Forensic analysis identifying suspicious patterns
- **User Safety** (0-100): Personal interaction safety assessment
- Balanced scoring system for comprehensive analysis

### Advanced Pattern Analysis
- Transaction velocity tracking
- Unique recipient/sender analysis
- Round number ratio detection (structuring)
- Total volume calculation
- Failed transaction monitoring

### Investigation Reports
- **Downloadable Reports**: TXT and JSON formats
- Comprehensive findings and recommendations
- Professional forensic documentation
- Audit trail for compliance

### Money Flow Tracing
- Interactive transaction table
- Clickable addresses for deep tracing
- Visual flow indicators (IN/OUT)
- Timestamp and fee tracking
- Direct Etherscan integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/blockchain-forensics.git
cd blockchain-forensics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```env
# Blockchain Provider Keys
NEXT_PUBLIC_INFURA_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key

# Multi-Chain API Keys
HELIUS_API_KEY=your_helius_key
WORLDSCAN_API_KEY=your_worldscan_key
BSCSCAN_API_KEY=your_bscscan_key
BLOCKCHAIR_API_KEY=your_blockchair_key
OKLINK_API_KEY=your_oklink_key

# NextAuth Secrets
AUTH_SECRET="your-secret-at-least-32-chars-long"
NEXTAUTH_SECRET="your-secret-at-least-32-chars-long"
```

See [`api_keys_guide.md`](./api_keys_guide.md) for detailed API key setup instructions.

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### 1. Select Blockchain
Choose from the dropdown: Ethereum, Solana, Bitcoin, Worldcoin, OKX Chain, or BNB Chain

### 2. Enter Address
Paste the blockchain address you want to analyze

### 3. Analyze
Click "Trace Funds" to start the forensic analysis

### 4. Review Results
- **Investigator Risk**: Forensic red flags
- **User Safety**: Interaction safety level
- **Transaction Flow**: Money movement visualization
- **Patterns**: Velocity, recipients, volume

### 5. Download Report
Click "Report (TXT)" or "Data (JSON)" to download investigation documentation

## 🧪 Test Addresses

Try these real addresses:

**Ethereum (Vitalik)**
```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

**Solana (Foundation)**
```
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

**BNB Chain (Binance)**
```
0x8894E0a0c962CB723c1976a4421c95949bE2D4E3
```

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Prisma + SQLite
- **Blockchain**: ethers.js, @solana/web3.js
- **Visualization**: react-force-graph-2d

## 📊 Risk Scoring Algorithm

### Investigator Risk Factors
- Large balances (>1000 units)
- High transaction volume (100+)
- Rapid fund movement (<1 hour)
- Many unique recipients (50+)
- High round number ratio (>50%)
- Multiple high-value transactions

### User Safety Factors
- Long transaction history (100+)
- Long holding periods (>1 week)
- Stable balance range
- Limited recipients (<5)
- All transactions successful
- Consistent patterns

## 🔒 Security

- Environment variables for API keys
- NextAuth.js authentication
- Server-side API calls only
- No private keys stored
- Read-only blockchain access

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues or questions, please open a GitHub issue.

## 🙏 Acknowledgments

- Blockchain API providers (Infura, Helius, BscScan, etc.)
- Next.js team
- Open-source community

---

**⚠️ Disclaimer**: This tool is for educational and investigative purposes only. Always verify findings through multiple sources and comply with local regulations.
