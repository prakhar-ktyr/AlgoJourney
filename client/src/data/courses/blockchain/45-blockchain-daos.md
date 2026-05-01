---
title: DAOs
---

A DAO (Decentralized Autonomous Organization) is an internet-native organization governed by its members through transparent rules encoded in smart contracts. Instead of a CEO or board making decisions, token holders vote on proposals. DAOs manage billions of dollars in treasuries and govern major DeFi protocols.

---

## What is a DAO?

A DAO replaces traditional corporate hierarchy with code-based governance. Rules are enforced by smart contracts, decisions are made by token-weighted voting, and all actions are transparent on-chain.

```
Traditional Organization vs DAO:

Traditional Company              DAO
─────────────────────────────────────────────
CEO makes decisions         →    Token holders vote
Board approves budgets      →    Proposals + on-chain voting
Opaque finances             →    Transparent treasury
Legal incorporation         →    Smart contract rules
Employees execute           →    Contributors self-organize
Shareholders have limited say → Every token holder can propose
```

| Feature | Traditional Org | DAO |
|---------|----------------|-----|
| Decision making | Top-down hierarchy | Token-weighted voting |
| Transparency | Limited (private books) | Full (on-chain treasury) |
| Membership | Employment/investment | Buy/earn governance tokens |
| Geography | Jurisdiction-bound | Global, borderless |
| Speed | Fast (one person decides) | Slower (voting periods) |
| Accountability | Board oversight | Code + community oversight |

---

## Governance Tokens

Governance tokens grant voting power in a DAO. Holding more tokens = more voting weight (in most systems).

| Token | DAO | Utility |
|-------|-----|---------|
| UNI | Uniswap | Vote on protocol fees, treasury grants |
| AAVE | Aave | Vote on risk parameters, new assets |
| MKR | MakerDAO | Vote on collateral types, stability fees |
| ENS | ENS DAO | Vote on .eth pricing, treasury allocation |
| ARB | Arbitrum DAO | Vote on L2 governance, ecosystem grants |
| COMP | Compound | Vote on market parameters, protocol upgrades |

```
Token-weighted voting:

Alice holds 100,000 UNI  → 100,000 votes
Bob holds 10,000 UNI     → 10,000 votes
Carol holds 1,000 UNI    → 1,000 votes

Proposal: "Allocate $5M to developer grants"
  For: 85,000 votes (Alice + some others)
  Against: 15,000 votes
  Quorum met? Yes (minimum 40,000 votes cast)
  Result: PASSED ✓
```

---

## Proposal and Voting Process

Most DAOs follow a multi-stage governance process:

```
Typical DAO governance flow:

1. Discussion (off-chain)
   └── Forum post on Discourse/Commonwealth
   └── Community feedback and iteration
   └── Duration: 3-7 days

2. Temperature Check (off-chain)
   └── Snapshot vote (gasless, signal only)
   └── Gauge community sentiment
   └── Duration: 3-5 days

3. Formal Proposal (on-chain)
   └── Submit to governance contract
   └── Requires minimum tokens to propose (e.g., 10,000 UNI)
   └── Duration: 2-3 days (review period)

4. Voting (on-chain)
   └── Token holders cast votes
   └── Duration: 3-7 days
   └── Quorum requirement (minimum participation)

5. Timelock (on-chain)
   └── If passed, execution delayed 2-7 days
   └── Allows users to exit if they disagree
   └── Duration: 2 days

6. Execution (on-chain)
   └── Proposal actions executed automatically
   └── Treasury transfers, parameter changes, etc.
```

---

## On-Chain vs Off-Chain Governance

| Aspect | On-Chain | Off-Chain (Snapshot) |
|--------|----------|---------------------|
| Cost | Gas fees per vote | Free (signed messages) |
| Binding | Automatically executed | Requires multi-sig execution |
| Security | Smart contract enforced | Trust multi-sig signers |
| Participation | Lower (gas barrier) | Higher (gasless) |
| Speed | Slower (on-chain txs) | Faster |
| Sybil resistance | Token holdings on-chain | Token holdings at snapshot block |

### Snapshot Voting

```
Snapshot off-chain voting:

1. Proposal created with snapshot block number
2. Voting power = token balance at that block
   (prevents buying tokens just to vote)
3. Voters sign message with their choice (gasless)
4. Results tallied off-chain
5. Multi-sig executes the outcome

Advantages:
- Zero gas cost → higher participation
- Can use complex voting strategies
- Supports delegation
```

---

## Treasury Management

DAOs often control large treasuries funded by protocol revenue, token sales, or ecosystem funds.

| DAO | Treasury Size (approx) | Primary Assets |
|-----|----------------------|----------------|
| Uniswap | $3B+ | UNI tokens |
| Lido | $500M+ | LDO, stETH |
| Arbitrum | $5B+ | ARB tokens |
| ENS | $1B+ | ETH, USDC, ENS |
| MakerDAO | $2B+ | MKR, DAI, real-world assets |

```
Treasury diversification strategies:

Concentrated (risky):
  └── 95% native token → Value crashes if token dumps

Diversified (safer):
  ├── 40% Stablecoins (USDC, DAI)
  ├── 30% ETH/BTC (blue chip crypto)
  ├── 20% Native governance token
  └── 10% Real-world assets (T-bills via MakerDAO)
```

---

## Famous DAOs

| DAO | Purpose | Notable Achievement |
|-----|---------|-------------------|
| MakerDAO | Stablecoin governance (DAI) | First major DeFi DAO, manages $8B+ in collateral |
| Uniswap | DEX governance | $3B+ treasury, governs largest DEX |
| ENS DAO | Ethereum Name Service | Decentralized DNS alternative |
| Nouns DAO | NFT community/public goods | 1 NFT minted daily, funds public goods |
| ConstitutionDAO | Bid on US Constitution copy | Raised $47M in days (lost auction) |
| Gitcoin DAO | Public goods funding | Distributed $50M+ in grants |
| Lido DAO | Liquid staking governance | Governs 30%+ of staked ETH |

---

## DAO Governance Challenges

| Challenge | Description | Potential Solution |
|-----------|-------------|-------------------|
| Voter apathy | Low participation rates (often < 10%) | Delegation, incentivized voting |
| Plutocracy | Whales dominate voting | Quadratic voting, conviction voting |
| Short-termism | Voters optimize for token price | Vesting, long-term incentives |
| Governance attacks | Flash loan to acquire voting power | Time-weighted voting, snapshot blocks |
| Slow decision-making | Weeks per proposal | Optimistic governance, committees |
| Legal uncertainty | DAOs lack legal recognition | Wyoming DAO LLC, Marshall Islands |

### Alternative Voting Mechanisms

```
Quadratic voting:
  Cost of N votes = N² tokens
  1 vote = 1 token
  2 votes = 4 tokens
  3 votes = 9 tokens
  → Favors broad consensus over whale dominance

Conviction voting:
  Voting power accumulates over time
  Longer you support a proposal → more weight
  → Rewards conviction, discourages flash votes

Delegated voting:
  Delegate your votes to an expert
  Can revoke delegation at any time
  → Increases effective participation
```

---

## Legal Considerations

| Jurisdiction | DAO Legal Status |
|--------------|-----------------|
| Wyoming (USA) | DAO LLC recognized since 2021 |
| Marshall Islands | DAO LLC legislation (2022) |
| Switzerland | Association model for DAOs |
| Cayman Islands | Foundation Company structure |
| Most countries | Unrecognized — members may have unlimited liability |

---

## Key Takeaways

- DAOs are internet-native organizations governed by smart contracts and token-weighted voting
- Governance tokens grant voting power; more tokens = more influence (in standard models)
- The governance process typically involves discussion, temperature check, formal vote, timelock, and execution
- Snapshot enables gasless off-chain voting with on-chain token balances as voting power
- DAO treasuries hold billions and require careful diversification strategies
- Key challenges: voter apathy, plutocracy (whale dominance), slow decision-making
- Alternative mechanisms like quadratic voting and delegation help address governance weaknesses
- Legal recognition is evolving but most jurisdictions still lack clear DAO frameworks

---

[Next: IPFS & Decentralized Storage](46-blockchain-ipfs)
