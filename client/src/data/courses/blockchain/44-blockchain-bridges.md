---
title: Cross-Chain Bridges
---

Cross-chain bridges enable the transfer of assets and data between different blockchains. They are critical infrastructure in a multi-chain world but have also been the target of some of the largest hacks in crypto history. Understanding how bridges work — and their security trade-offs — is essential for any blockchain developer.

---

## Why Bridges Are Needed

Each blockchain is an isolated system. Without bridges, assets on Ethereum cannot be used on Solana, and vice versa. Bridges solve this by creating representations of assets across chains.

```
The multi-chain reality:

Ethereum ─── has ETH, USDC, DeFi protocols
Solana ────── has SOL, fast transactions
Arbitrum ──── has cheap ETH L2 transactions
Polygon ───── has MATIC, gaming dApps
Avalanche ─── has AVAX, subnet architecture

Problem: Your USDC on Ethereum can't be used on Solana
Solution: Bridge locks USDC on Ethereum, mints wrapped USDC on Solana
```

| Use Case | Description |
|----------|-------------|
| Access DeFi on other chains | Use your ETH in Solana DeFi protocols |
| Cheaper transactions | Move to L2/sidechain for lower fees |
| Cross-chain dApps | Build applications spanning multiple chains |
| Arbitrage | Exploit price differences across chains |
| Portfolio management | Consolidate assets across chains |

---

## How Bridges Work

### Lock-and-Mint

The most common bridge mechanism. Assets are locked on the source chain, and equivalent wrapped tokens are minted on the destination chain.

```
Lock-and-Mint flow:

Source Chain (Ethereum)          Destination Chain (Polygon)
─────────────────────────────────────────────────────────────
1. User sends 10 ETH to         
   bridge contract               
         ↓                       
2. Bridge contract locks         
   10 ETH                        
         ↓                       
3. Bridge validators/relayers observe the lock
         ↓                                    ↓
                                 4. Mint 10 WETH (wrapped ETH)
                                    to user's address
─────────────────────────────────────────────────────────────
To return:
5. User burns 10 WETH on Polygon
6. Bridge unlocks 10 ETH on Ethereum
```

### Burn-and-Mint

Used when a token has native issuance on multiple chains (e.g., USDC with Circle's Cross-Chain Transfer Protocol).

```
Burn-and-Mint flow (native multi-chain tokens):

Source Chain                    Destination Chain
─────────────────────────────────────────────────
1. Burn 1000 USDC on           
   source chain                 
         ↓                      
2. Attestation/proof generated  
         ↓                                    ↓
                                3. Mint 1000 USDC (native)
                                   on destination chain
─────────────────────────────────────────────────
No wrapped tokens — native USDC on both chains
```

---

## Bridge Security Models

| Model | Trust Assumption | Security | Speed | Examples |
|-------|-----------------|----------|-------|----------|
| Trusted (centralized) | Trust bridge operator | Operator honesty | Fast | Centralized exchanges |
| Multi-sig | Trust M-of-N signers | Signer honesty | Fast | Ronin (5/9), Multichain |
| Optimistic | Trust 1 honest watcher | Fraud proof challenge | Slow (hours) | Nomad, Across |
| ZK/Light client | Trust math (cryptography) | Cryptographic proof | Medium | Succinct, Polymer |
| Native (rollup) | Trust L1 consensus | L1 security | Slow (7 days for optimistic) | Arbitrum canonical bridge |
| Intent-based | Trust solver competition | Economic incentives | Fast | Across, UniswapX |

---

## Trusted vs Trustless Bridges

```
Trusted bridge:
┌─────────────────────────────────────────┐
│  Validators / Multi-sig signers          │
│  • Small group controls bridge funds     │
│  • If compromised → funds stolen         │
│  • Fast but requires trust               │
└─────────────────────────────────────────┘

Trustless bridge:
┌─────────────────────────────────────────┐
│  Cryptographic verification              │
│  • On-chain light client verifies proofs │
│  • No trusted third party                │
│  • Slower but mathematically secure      │
└─────────────────────────────────────────┘
```

| Aspect | Trusted Bridge | Trustless Bridge |
|--------|---------------|-----------------|
| Security basis | Honest majority of signers | Cryptography/L1 consensus |
| Speed | Seconds to minutes | Minutes to days |
| Cost | Low (just signatures) | Higher (proof verification gas) |
| Risk | Key compromise, collusion | Smart contract bugs |
| Decentralization | Low (few signers) | High |
| Capital efficiency | High | Varies |

---

## Major Bridge Hacks

Bridges are high-value targets because they hold large pools of locked assets.

| Hack | Date | Amount Lost | Cause |
|------|------|-------------|-------|
| Ronin Bridge | Mar 2022 | $625M | 5 of 9 validator keys compromised (social engineering) |
| Wormhole | Feb 2022 | $320M | Signature verification bug — forged guardian signatures |
| Nomad | Aug 2022 | $190M | Initialization bug — anyone could forge valid proofs |
| Harmony Horizon | Jun 2022 | $100M | 2 of 5 multi-sig keys compromised |
| BNB Bridge | Oct 2022 | $570M | IAVL proof verification vulnerability |
| Multichain | Jul 2023 | $126M | CEO arrested, private keys controlled by single person |

### Lessons from Bridge Hacks

```
Common bridge vulnerabilities:

1. Key management failures
   └── Too few signers, weak key security
   └── Solution: Distributed key management, HSMs, social recovery

2. Signature/proof verification bugs
   └── Accepting invalid proofs as valid
   └── Solution: Formal verification, multiple audits

3. Initialization/upgrade bugs
   └── Default values allow unauthorized access
   └── Solution: Thorough testing of deployment/upgrade paths

4. Centralization risks
   └── Single points of failure (one person holds keys)
   └── Solution: True decentralization, time-locks
```

---

## Security Challenges

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| Key management | Securing multi-sig keys | Hardware security modules (HSMs), MPC |
| Proof verification | Validating cross-chain messages | Formal verification, ZK proofs |
| Finality differences | Different chains have different finality times | Wait for sufficient confirmations |
| Upgrade risks | Bridge contract upgrades introduce bugs | Timelocks, governance, immutability |
| Economic attacks | Flash loans to manipulate bridge pricing | Rate limiting, oracle diversity |
| Liveness | Bridge goes offline, funds stuck | Escape hatches, forced withdrawal mechanisms |

---

## Bridge Alternatives

| Alternative | How It Works | Trade-off |
|-------------|-------------|-----------|
| Atomic swaps | Hash-time locked contracts across chains | Limited to simple swaps |
| Native multi-chain tokens | Token issued natively on multiple chains (USDC CCTP) | Requires issuer cooperation |
| Intent-based systems | Solvers fulfill cross-chain requests | Depends on solver liquidity |
| Shared sequencing | Multiple rollups share ordering layer | Experimental, limited chains |
| IBC (Cosmos) | Light client verification between chains | Only works for IBC-enabled chains |

### Intent-Based Bridging

```
Intent-based bridge flow (e.g., Across Protocol):

1. User: "I want 1 ETH on Arbitrum, have 1 ETH on Ethereum"
         ↓
2. Solver (relayer) fronts 1 ETH on Arbitrum to user instantly
         ↓
3. User's 1 ETH locked on Ethereum
         ↓
4. After verification, solver claims locked ETH + fee

Benefits:
- Instant for user (solver takes the risk)
- Competitive fees (solvers compete)
- No wrapped tokens needed
```

---

## Best Practices for Bridge Users

| Practice | Reason |
|----------|--------|
| Use official/canonical bridges for large amounts | Highest security, backed by L2 team |
| Verify contract addresses independently | Phishing sites impersonate bridges |
| Start with small test transactions | Verify the bridge works before large transfers |
| Check bridge TVL and audit history | Higher TVL + audits = more confidence |
| Understand withdrawal times | Optimistic bridges have 7-day delays |
| Diversify across bridges | Don't put all assets through one bridge |

---

## Key Takeaways

- Bridges enable asset and data transfer between isolated blockchains
- Lock-and-mint is the most common mechanism: lock on source, mint wrapped token on destination
- Bridge security ranges from trusted multi-sigs to trustless cryptographic proofs
- Bridges have been the target of the largest DeFi hacks ($2B+ stolen in 2022 alone)
- Common vulnerabilities: key compromise, signature verification bugs, centralization
- Intent-based bridging is emerging as a faster, more capital-efficient alternative
- Always use canonical bridges for large amounts and verify contract addresses
- The future points toward trustless bridges using ZK light clients and native multi-chain tokens

---

[Next: DAOs](45-blockchain-daos)
