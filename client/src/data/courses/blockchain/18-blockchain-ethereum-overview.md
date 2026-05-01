---
title: Ethereum Overview
---

## What is Ethereum?

Ethereum is a decentralized, open-source blockchain platform that enables **smart contracts** — self-executing programs that run on the blockchain. While Bitcoin focuses on being digital money, Ethereum aims to be a **world computer** — a programmable platform for decentralized applications (dApps).

---

## History & Key Milestones

| Year | Event |
|------|-------|
| 2013 | Vitalik Buterin publishes the Ethereum whitepaper |
| 2014 | Ethereum Foundation formed; crowdsale raises ~$18M |
| 2015 | Frontier launch — Ethereum mainnet goes live (July 30) |
| 2016 | The DAO hack; Ethereum hard forks into ETH and ETC |
| 2017 | ICO boom; ERC-20 tokens dominate fundraising |
| 2020 | Beacon Chain launches (Proof of Stake chain) |
| 2021 | EIP-1559 (fee burn mechanism) activated; NFT explosion |
| 2022 | The Merge — Ethereum transitions from PoW to PoS (September 15) |
| 2023 | Shanghai upgrade — staked ETH withdrawals enabled |
| 2024 | Dencun upgrade — Proto-Danksharding (EIP-4844) for L2 scaling |

---

## Vitalik Buterin & Ethereum's Vision

Vitalik Buterin was 19 when he proposed Ethereum. His key insight:

> "Bitcoin is great for sending money, but what if we could program arbitrary logic on top of a blockchain?"

Core vision:
- **Programmable money** — not just transfers, but conditions and logic
- **Decentralized applications** — censorship-resistant software
- **Composability** — smart contracts can call other contracts (money LEGOs)

---

## Ethereum vs Bitcoin

| Feature | Bitcoin | Ethereum |
|---------|---------|----------|
| Primary purpose | Digital money / store of value | Programmable blockchain platform |
| Creator | Satoshi Nakamoto (pseudonymous) | Vitalik Buterin (known) |
| Consensus | Proof of Work (SHA-256) | Proof of Stake (since 2022) |
| Block time | ~10 minutes | ~12 seconds |
| Supply cap | 21 million BTC | No hard cap (net issuance can be negative) |
| Scripting | Limited (Bitcoin Script) | Turing-complete (Solidity, Vyper) |
| State model | UTXO | Account-based |
| Main use cases | Payments, store of value | DeFi, NFTs, DAOs, dApps |
| Transaction fees | Paid in BTC | Paid in ETH (gas) |

---

## Smart Contracts

Smart contracts are programs stored on the blockchain that execute automatically when conditions are met:

```solidity
// Simple smart contract example (Solidity)
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedValue;

    function set(uint256 value) public {
        storedValue = value;
    }

    function get() public view returns (uint256) {
        return storedValue;
    }
}
```

### Properties of Smart Contracts

| Property | Description |
|----------|-------------|
| Immutable | Once deployed, code cannot be changed |
| Deterministic | Same input always produces same output |
| Transparent | Code visible to everyone on-chain |
| Self-executing | Runs automatically when triggered |
| Trustless | No intermediary needed |

---

## ETH as Gas

ETH (Ether) is the native currency of Ethereum, used to:

```text
1. Pay transaction fees (gas)
2. Stake for network security (32 ETH minimum for validators)
3. Use as collateral in DeFi protocols
4. Transfer value between accounts
```

### ETH Denominations

| Unit | Wei Value | Common Use |
|------|-----------|-----------|
| Wei | 1 | Smallest unit |
| Gwei | 1,000,000,000 (10⁹) | Gas prices |
| Ether (ETH) | 1,000,000,000,000,000,000 (10¹⁸) | Transactions |

---

## The Merge (September 2022)

The Merge was Ethereum's transition from Proof of Work to Proof of Stake:

```text
Before The Merge:
  Execution Layer (PoW) ← Miners secure the network

After The Merge:
  Execution Layer + Consensus Layer (PoS) ← Validators secure the network
```

| Impact | Before (PoW) | After (PoS) |
|--------|-------------|-------------|
| Energy use | ~112 TWh/year | ~0.01 TWh/year (~99.95% reduction) |
| Security mechanism | Hash power (electricity) | Staked ETH (economic) |
| Hardware | GPU/ASIC mining rigs | Standard computers |
| Issuance | ~13,000 ETH/day | ~1,700 ETH/day |
| Block time | ~13s (variable) | 12s (fixed slots) |

---

## Ethereum Ecosystem

| Category | Examples |
|----------|---------|
| DeFi | Uniswap, Aave, MakerDAO, Compound |
| NFTs | OpenSea, Blur, CryptoPunks, BAYC |
| DAOs | MakerDAO, Uniswap Governance, ENS DAO |
| Layer 2s | Arbitrum, Optimism, zkSync, Polygon |
| Stablecoins | USDC, USDT, DAI |
| Identity | ENS (Ethereum Name Service) |

---

## Ethereum Roadmap

Ethereum's development follows phases (as of Vitalik's updated roadmap):

| Phase | Goal | Key Feature |
|-------|------|-------------|
| The Merge | PoS transition | ✅ Complete (2022) |
| The Surge | Scalability (100k+ TPS via L2s) | Danksharding, EIP-4844 |
| The Scourge | Censorship resistance | MEV mitigation, PBS |
| The Verge | Statelessness | Verkle trees |
| The Purge | Simplify protocol | State expiry, history expiry |
| The Splurge | Everything else | Account abstraction, misc |

---

## Account Types

Ethereum has two types of accounts:

| Feature | Externally Owned Account (EOA) | Contract Account |
|---------|-------------------------------|-----------------|
| Controlled by | Private key | Contract code |
| Can initiate tx | Yes | No (only responds to calls) |
| Has code | No | Yes |
| Address format | Same (0x..., 20 bytes) | Same (0x..., 20 bytes) |
| Creation cost | Free | Gas to deploy |

```text
EOA: 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD20
Contract: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 (UNI token)
```

---

## Key Takeaways

- Ethereum extends blockchain beyond payments to programmable smart contracts
- Created by Vitalik Buterin in 2013, launched in 2015
- The Merge (2022) transitioned Ethereum from PoW to PoS, cutting energy use by 99.95%
- ETH serves as gas (transaction fees), staking collateral, and value transfer
- Ethereum uses an account-based model (vs Bitcoin's UTXO model)
- The ecosystem spans DeFi, NFTs, DAOs, Layer 2s, and more
- The roadmap focuses on scalability (Surge), decentralization (Scourge), and simplification (Purge)

---

## Next

[Ethereum Virtual Machine →](19-blockchain-evm)
