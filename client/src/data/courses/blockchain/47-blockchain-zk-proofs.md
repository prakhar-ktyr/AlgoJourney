---
title: Zero-Knowledge Proofs
---

Zero-knowledge proofs (ZKPs) allow one party to prove they know something without revealing the information itself. This cryptographic primitive is revolutionizing blockchain scalability (ZK rollups), privacy (shielded transactions), and identity (verifiable credentials) — all without requiring trust.

---

## What is a Zero-Knowledge Proof?

A zero-knowledge proof lets a prover convince a verifier that a statement is true, without revealing any information beyond the fact that the statement is true.

```
Zero-knowledge proof properties:

1. Completeness
   If the statement is true, an honest prover can
   always convince the verifier.

2. Soundness
   If the statement is false, no cheating prover can
   convince the verifier (except with negligible probability).

3. Zero-Knowledge
   The verifier learns nothing beyond the truth of the statement.
   No information about the secret is revealed.
```

| Term | Meaning |
|------|---------|
| Prover | The party that knows the secret and wants to prove it |
| Verifier | The party that needs to be convinced |
| Witness | The secret information the prover knows |
| Statement | The claim being proven (e.g., "I know the password") |
| Proof | The cryptographic evidence (reveals nothing about witness) |

---

## The Ali Baba Cave Analogy

The classic analogy for understanding ZKPs:

```
Ali Baba Cave:

         Entrance
            │
     ┌──────┴──────┐
     │              │
   Path A        Path B
     │              │
     └──────┬──────┘
            │
      Magic Door
   (needs secret word)

Peggy (prover) claims she knows the secret word.
Victor (verifier) wants to be convinced.

Protocol:
1. Victor waits at entrance, Peggy goes inside (picks A or B randomly)
2. Victor shouts: "Come out on path A!" (or B, randomly)
3. If Peggy knows the word → she can ALWAYS come out the correct path
   (use door if needed)
4. If Peggy doesn't know → 50% chance of failure each round
5. Repeat 20 times → probability of faking = (1/2)^20 ≈ 0.0001%

Victor is convinced, but learned NOTHING about the secret word.
```

---

## Interactive vs Non-Interactive Proofs

| Type | Interaction | Use Case | Example |
|------|-------------|----------|---------|
| Interactive | Multiple rounds of communication | Theoretical, identification | Ali Baba cave |
| Non-interactive | Single message (proof) from prover | Blockchain, public verification | zk-SNARKs, zk-STARKs |

```
Interactive ZKP:
  Prover ←→ Verifier (multiple messages back and forth)
  • Requires both parties to be online
  • Not practical for blockchain (thousands of verifiers)

Non-interactive ZKP (via Fiat-Shamir heuristic):
  Prover → Verifier (single proof message)
  • Prover generates proof once
  • Anyone can verify at any time
  • Perfect for blockchain (post proof on-chain, all nodes verify)
```

---

## zk-SNARKs vs zk-STARKs

The two dominant ZKP systems used in blockchain:

| Feature | zk-SNARKs | zk-STARKs |
|---------|-----------|-----------|
| Full name | Succinct Non-interactive Argument of Knowledge | Scalable Transparent Argument of Knowledge |
| Proof size | Small (~200 bytes) | Larger (~50-200 KB) |
| Verification time | Fast (constant time) | Fast (polylogarithmic) |
| Prover time | Moderate | Higher |
| Trusted setup | Required (toxic waste) | Not required (transparent) |
| Quantum resistant | No (relies on elliptic curves) | Yes (hash-based) |
| Maturity | More mature (2012+) | Newer (2018+) |
| Used by | Zcash, zkSync, Polygon zkEVM | StarkNet, StarkEx |

### Trusted Setup Explained

```
zk-SNARK trusted setup:

1. Generate random secret parameters ("toxic waste")
2. Derive public parameters from secrets
3. DESTROY the secrets forever
4. Public parameters used to create/verify proofs

Risk: If anyone keeps the secrets, they can forge proofs!

Solutions:
- Multi-party ceremonies (1000s of participants)
- Only ONE participant needs to be honest
- Zcash "Powers of Tau" ceremony: 87 participants
- Universal setups (PLONK): one ceremony for all circuits

zk-STARKs avoid this entirely — no trusted setup needed.
```

---

## How ZKPs Work (Simplified)

```
ZKP circuit creation (high-level):

1. Define computation as arithmetic circuit:
   "I know x such that hash(x) = H"

   Circuit:
   ┌───────────────────────────────────┐
   │ Input: x (private/witness)        │
   │ Input: H (public)                 │
   │                                   │
   │ Constraint: SHA256(x) == H        │
   │                                   │
   │ Output: true/false                │
   └───────────────────────────────────┘

2. Prover:
   - Has witness x (the secret)
   - Generates proof π that satisfies constraints
   - Proof reveals NOTHING about x

3. Verifier:
   - Has public input H
   - Checks proof π
   - Convinced that prover knows x, learns nothing about x

Proof: "I know a value that hashes to H" (without revealing the value)
```

---

## Applications of ZKPs in Blockchain

### 1. Scaling (ZK Rollups)

```
ZK rollup proof:
  Statement: "Starting from state S1, after executing 10,000 transactions,
             the new state is S2"
  Witness: The 10,000 transactions themselves
  Proof: ~200 bytes that anyone can verify on L1

Instead of L1 re-executing 10,000 txs:
  → Verify one small proof (cheap!)
  → 10,000x throughput increase
```

### 2. Privacy (Shielded Transactions)

```
Private transaction proof:
  Statement: "I'm spending a valid coin that I own, and creating
             a new coin for the recipient — total in = total out"
  Witness: Sender identity, amount, coin serial number
  Proof: Transaction is valid without revealing sender/amount

Used by: Zcash, Tornado Cash, Aztec Network
```

### 3. Identity (Verifiable Credentials)

```
Identity proof:
  Statement: "I am over 18 years old"
  Witness: My actual birthdate from government ID
  Proof: Age ≥ 18 (without revealing exact date or any other info)

Applications:
- KYC without sharing documents
- Credit score proof without revealing income
- Nationality proof without revealing passport number
```

| Application | What's Proven | What's Hidden |
|-------------|---------------|---------------|
| ZK Rollups | State transition is valid | Individual transaction details (on L1) |
| Zcash | Transaction is valid | Sender, receiver, amount |
| ZK Identity | Attribute meets criteria | Actual attribute value |
| ZK Voting | Vote is valid (eligible voter) | Who voted for what |
| ZK Gaming | Move is valid | Strategy/hidden information |

---

## ZKP Development Tools

| Tool | Language | Used By | Description |
|------|----------|---------|-------------|
| Circom | DSL + JavaScript | Many projects | Circuit compiler, widely adopted |
| Cairo | Custom (Rust-like) | StarkNet | Native for STARK proofs |
| Noir | Rust-like | Aztec | Simple ZK circuit language |
| Halo2 | Rust | Scroll, zkSync | PLONKish proof system |
| RISC Zero | Rust (RISC-V) | General | ZK proofs for any Rust program |
| SP1 | Rust (RISC-V) | Succinct | zkVM for general computation |

```rust
// Simple Noir example: prove knowledge of hash preimage
fn main(secret: Field, public_hash: pub Field) {
    // Prove: I know `secret` such that hash(secret) == public_hash
    let computed_hash = std::hash::pedersen([secret]);
    assert(computed_hash[0] == public_hash);
    // Proof generated! Verifier only sees public_hash, not secret
}
```

---

## Current Limitations

| Limitation | Description | Progress |
|------------|-------------|----------|
| Prover computation | Generating proofs is CPU/memory intensive | Hardware acceleration (GPUs, ASICs) |
| Circuit complexity | Not all computations are easy to express as circuits | Higher-level languages (Noir, Cairo) |
| Proof size (STARKs) | STARK proofs are large (~100KB) | Proof recursion and compression |
| Trusted setup (SNARKs) | Requires ceremony, single point of failure | Universal setups, STARKs |
| Developer experience | Steep learning curve, limited tooling | Better languages, libraries |
| Verification cost | On-chain verification still costs gas | Proof aggregation, batching |
| Auditability | ZK circuits are hard to audit | Formal verification tools emerging |

---

## The Future of ZKPs

```
Near-term (1-2 years):
  ├── ZK rollups become dominant L2 scaling solution
  ├── Proof generation times drop 10-100x
  └── ZK coprocessors enable private smart contracts

Medium-term (3-5 years):
  ├── zkVMs (prove any program execution)
  ├── Client-side proving on mobile phones
  ├── ZK-based identity standard adopted
  └── Cross-chain ZK verification

Long-term (5+ years):
  ├── ZK everywhere (privacy by default)
  ├── Formal verification of ZK circuits
  └── Post-quantum ZK systems standardized
```

---

## Key Takeaways

- Zero-knowledge proofs let you prove knowledge without revealing the underlying information
- The three properties: completeness (true statements provable), soundness (false statements unprovable), zero-knowledge (nothing else revealed)
- zk-SNARKs are small and fast to verify but require a trusted setup; zk-STARKs are larger but transparent and quantum-resistant
- Primary blockchain applications: scaling (ZK rollups), privacy (shielded transactions), and identity (verifiable credentials)
- ZKPs are computationally expensive to generate but cheap and fast to verify — ideal for blockchain
- The developer ecosystem is rapidly maturing with higher-level languages like Noir and Cairo
- ZKPs are considered one of the most important cryptographic breakthroughs for blockchain's future

---

[Next: Privacy in Blockchain](48-blockchain-privacy)
