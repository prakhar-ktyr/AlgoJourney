---
title: Ethereum Accounts & State
---

## Ethereum Accounts & State

Ethereum is a **state machine** — every transaction transitions the network from one global state to the next. Understanding accounts and state is fundamental to grasping how Ethereum works under the hood.

---

## Two Types of Accounts

Ethereum has two distinct account types:

| Feature | Externally Owned Account (EOA) | Contract Account |
|---------|-------------------------------|-----------------|
| Controlled by | Private key (human) | Smart contract code |
| Has code | No | Yes |
| Can initiate transactions | Yes | No (only responds) |
| Creation cost | Free | Costs gas (deployment) |
| Address derivation | From public key | From creator address + nonce |
| Example | MetaMask wallet | Uniswap Router |

### Externally Owned Accounts (EOAs)

An EOA is what you get when you create a wallet in MetaMask or any other wallet software. It is controlled by whoever holds the private key.

- Can send transactions (transfer ETH, call contracts)
- Has no associated code
- Address is derived from the last 20 bytes of the Keccak-256 hash of the public key

### Contract Accounts

A contract account is created when a smart contract is deployed. It holds executable code and can only act when triggered by an EOA or another contract.

- Cannot initiate transactions on its own
- Executes code when called
- Address is deterministically computed from the deployer's address and nonce

---

## Account State

Every account (EOA or contract) has four fields stored in the world state:

| Field | Description | Default |
|-------|-------------|---------|
| `nonce` | Number of transactions sent (EOA) or contracts created (contract) | 0 |
| `balance` | Amount of Wei owned by the account | 0 |
| `storageRoot` | Hash of the root of the account's storage trie | Empty trie hash |
| `codeHash` | Hash of the EVM bytecode | Hash of empty string |

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccountInfo {
    // Each contract account has its own storage trie
    uint256 public counter; // stored in storageRoot
    address public owner;   // stored in storageRoot

    constructor() {
        owner = msg.sender; // msg.sender is an EOA
    }

    // This function modifies the contract's state (storageRoot changes)
    function increment() external {
        counter += 1;
    }

    // Reading balance of any account
    function getBalance(address account) external view returns (uint256) {
        return account.balance;
    }
}
```

---

## The World State

The **world state** is a mapping of every Ethereum address to its account state. It is stored as a **Modified Merkle Patricia Trie** (MPT).

```
World State (state trie)
├── Address A → { nonce: 5, balance: 2 ETH, storageRoot: ..., codeHash: ... }
├── Address B → { nonce: 0, balance: 100 ETH, storageRoot: ..., codeHash: ... }
└── Address C → { nonce: 1, balance: 0, storageRoot: ..., codeHash: ... }
```

### State Trie Properties

- The **state root** is a single 32-byte hash summarizing all accounts
- Every block header contains the state root after executing all transactions in that block
- This allows any node to verify the entire state with a single hash comparison

---

## Account Creation

### EOA Creation
1. Generate a random 256-bit private key
2. Derive the public key using elliptic curve multiplication (secp256k1)
3. Take the Keccak-256 hash of the public key
4. Use the last 20 bytes as the address

### Contract Creation
1. An EOA sends a transaction with empty `to` field and bytecode in `data`
2. The EVM computes the new address: `keccak256(rlp([sender, nonce]))[12:]`
3. A new account entry is added to the state trie with the contract's code

---

## State Transitions

Every transaction causes a state transition:

| Action | State Change |
|--------|-------------|
| Send ETH | Sender nonce +1, sender balance −X, receiver balance +X |
| Deploy contract | Sender nonce +1, new account created with code |
| Call contract | Sender nonce +1, contract storage may change |

---

## Key Takeaways

- Ethereum has two account types: EOAs (controlled by keys) and contract accounts (controlled by code)
- Every account has four state fields: nonce, balance, storageRoot, and codeHash
- The world state is a Merkle Patricia Trie mapping addresses to account states
- Each block header includes the state root — a single hash of all account states
- EOA addresses come from public keys; contract addresses come from deployer address + nonce
- Understanding state is essential before writing smart contracts

---

[Next: Solidity Basics](./22-blockchain-solidity-basics)
