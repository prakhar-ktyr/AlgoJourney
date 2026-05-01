---
title: Ethereum Virtual Machine
---

## What is the EVM?

The **Ethereum Virtual Machine (EVM)** is the runtime environment for smart contracts on Ethereum. It is a **stack-based virtual machine** that executes bytecode deterministically on every node in the network, ensuring all nodes arrive at the same state.

Think of the EVM as a global, decentralized computer:

```text
Smart Contract (Solidity/Vyper)
         ↓ compile
    EVM Bytecode
         ↓ deploy
    Stored on blockchain
         ↓ execute
    EVM processes opcodes
         ↓ result
    State change (or revert)
```

---

## Stack-Based Architecture

The EVM operates on a **Last-In, First-Out (LIFO)** stack with the following constraints:

| Component | Specification |
|-----------|--------------|
| Stack depth | Maximum 1,024 items |
| Word size | 256 bits (32 bytes) |
| Memory | Byte-addressable, linear, expands as needed |
| Storage | Key-value store (256-bit → 256-bit), persistent |
| Program counter | Tracks current instruction position |

### Execution Model

```text
┌──────────────────────────────────────┐
│              EVM Instance            │
│                                      │
│  ┌─────────┐  ┌─────────────────┐   │
│  │  Stack   │  │    Memory       │   │
│  │ (1024    │  │  (volatile,     │   │
│  │  slots)  │  │   byte-array)   │   │
│  └─────────┘  └─────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐    │
│  │       Storage                │    │
│  │  (persistent, key→value)     │    │
│  └──────────────────────────────┘    │
│                                      │
│  Program Counter │ Gas Counter       │
└──────────────────────────────────────┘
```

---

## EVM Bytecode

Smart contracts are compiled to bytecode — a sequence of single-byte opcodes:

```text
Solidity:  uint256 x = 1 + 2;

Bytecode:  0x6001600201

Disassembled:
  PUSH1 0x01    (push 1 onto stack)
  PUSH1 0x02    (push 2 onto stack)
  ADD           (pop two values, push sum)
```

---

## Common Opcodes

### Arithmetic & Logic

| Opcode | Hex | Gas | Description |
|--------|-----|-----|-------------|
| ADD | 0x01 | 3 | Addition |
| MUL | 0x02 | 5 | Multiplication |
| SUB | 0x03 | 3 | Subtraction |
| DIV | 0x04 | 5 | Integer division |
| MOD | 0x06 | 5 | Modulo |
| EXP | 0x0A | 10* | Exponentiation |
| LT | 0x10 | 3 | Less than |
| GT | 0x11 | 3 | Greater than |
| EQ | 0x14 | 3 | Equality |
| AND | 0x16 | 3 | Bitwise AND |
| OR | 0x17 | 3 | Bitwise OR |

### Stack Operations

| Opcode | Hex | Gas | Description |
|--------|-----|-----|-------------|
| POP | 0x50 | 2 | Remove top item |
| PUSH1-PUSH32 | 0x60-0x7F | 3 | Push 1-32 bytes |
| DUP1-DUP16 | 0x80-0x8F | 3 | Duplicate stack item |
| SWAP1-SWAP16 | 0x90-0x9F | 3 | Swap stack items |

### Memory & Storage

| Opcode | Hex | Gas | Description |
|--------|-----|-----|-------------|
| MLOAD | 0x51 | 3* | Load from memory |
| MSTORE | 0x52 | 3* | Store to memory |
| SLOAD | 0x54 | 2100 | Load from storage (cold) |
| SSTORE | 0x55 | 20000 | Store to storage (new slot) |

### Environment & Block

| Opcode | Hex | Gas | Description |
|--------|-----|-----|-------------|
| CALLER | 0x33 | 2 | msg.sender |
| CALLVALUE | 0x34 | 2 | msg.value (ETH sent) |
| BALANCE | 0x31 | 2600 | Account balance |
| TIMESTAMP | 0x42 | 2 | Block timestamp |
| NUMBER | 0x43 | 2 | Block number |

### Control Flow

| Opcode | Hex | Gas | Description |
|--------|-----|-----|-------------|
| JUMP | 0x56 | 8 | Jump to position |
| JUMPI | 0x57 | 10 | Conditional jump |
| STOP | 0x00 | 0 | Halt execution |
| RETURN | 0xF3 | 0 | Return data |
| REVERT | 0xFD | 0 | Revert state changes |

---

## Gas Computation

Every opcode costs gas. The total gas consumed determines the transaction fee:

```text
Transaction Fee = Gas Used × Gas Price (in Gwei)

Example:
  Simple transfer: 21,000 gas
  Gas price: 30 Gwei
  Fee: 21,000 × 30 Gwei = 630,000 Gwei = 0.00063 ETH
```

### Gas Cost Categories

| Operation Type | Gas Cost | Example |
|---------------|----------|---------|
| Arithmetic | 3-10 | ADD, MUL, SUB |
| Memory access | 3+ (grows quadratically) | MLOAD, MSTORE |
| Storage read (cold) | 2,100 | SLOAD |
| Storage write (new) | 20,000 | SSTORE (zero → non-zero) |
| Storage write (update) | 5,000 | SSTORE (non-zero → non-zero) |
| External call | 2,600+ | CALL |
| Contract creation | 32,000 + code cost | CREATE |
| Transaction base | 21,000 | Every transaction |

---

## State Machine Model

The EVM is a **transaction-based state machine**:

```text
State(n) + Transaction → State(n+1)

World State contains:
  - All account balances
  - All contract code
  - All contract storage
  - All nonces
```

### State Transitions

```text
Valid Transaction:
  State(n) ──tx──→ State(n+1)    [state updated]

Reverted Transaction:
  State(n) ──tx──→ State(n)      [state unchanged, gas still consumed]

Invalid Transaction:
  Rejected by node                [never included in block]
```

---

## EVM-Compatible Chains

Many blockchains implement the EVM to achieve compatibility with Ethereum's tooling and smart contracts:

| Chain | Consensus | Block Time | Gas Token | Notes |
|-------|-----------|-----------|-----------|-------|
| Polygon (PoS) | PoS | ~2s | MATIC/POL | Ethereum sidechain/L2 |
| BNB Smart Chain | PoSA | ~3s | BNB | High throughput, centralized |
| Avalanche (C-Chain) | Snowman | ~2s | AVAX | Sub-second finality |
| Arbitrum | Optimistic Rollup | ~0.25s | ETH | Ethereum L2 |
| Optimism | Optimistic Rollup | ~2s | ETH | Ethereum L2 |
| Fantom | Lachesis (aBFT) | ~1s | FTM | DAG-based |
| zkSync Era | ZK Rollup | ~1s | ETH | Ethereum L2 |

### Benefits of EVM Compatibility

| Benefit | Description |
|---------|-------------|
| Code portability | Deploy same Solidity contracts across chains |
| Tooling reuse | MetaMask, Hardhat, Remix work on all EVM chains |
| Developer familiarity | Same language, patterns, and debugging tools |
| Ecosystem access | Bridge assets and compose across chains |

---

## EVM Limitations

| Limitation | Description |
|-----------|-------------|
| 256-bit words | Oversized for most operations, wastes gas |
| No parallelism | Sequential execution only |
| Storage cost | Expensive persistent storage (20,000 gas per new slot) |
| Stack depth | Limited to 1,024 (can cause "stack too deep" errors) |
| No floating point | Integer math only |

---

## Key Takeaways

- The EVM is a stack-based virtual machine that executes smart contract bytecode
- It has three data locations: stack (temporary), memory (volatile), and storage (persistent)
- Every opcode has a fixed gas cost — storage operations are the most expensive
- The EVM is deterministic: same input always produces the same output on every node
- Many alternative blockchains implement EVM compatibility for tooling and developer access
- The EVM processes state transitions: each valid transaction transforms the world state

---

## Next

[Gas & Transaction Fees →](20-blockchain-gas-fees)
