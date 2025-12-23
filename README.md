This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


## How It Works (Tracing Workflow)

1.  **Input & Validation**:
    *   The user enters an address (e.g. `0xd8dA...`) on the frontend.
    *   The app auto-corrects potential typos (like missing `0x`).

2.  **Data Fetching (Parallel)**:
    *   **Balance**: The backend connects to the Ethereum Mainnet via `ethers.js` (using `llamarpc` or Infura) to check the current wallet balance.
    *   **Transaction History**: The backend calls the **Etherscan API** to download the last 10 transactions for that wallet.

3.  **Risk Analysis**:
    *   The app calculates a **Risk Score (0-100)** based on heuristics (High balance? High transaction count? Interactions with known addresses?).
    *   *Note: In a full production version, this would check against a database of known hackers.*

4.  **Visualization**:
    *   The frontend receives the JSON data.
    *   It renders a Force-Directed Graph where:
        *   **Center Node**: The suspect wallet.
        *   **Connected Nodes**: Wallets they sent money to or received money from.
        *   **Red Nodes**: High risk wallets.
        *   **Blue Nodes**: Safe/Unknown wallets.
