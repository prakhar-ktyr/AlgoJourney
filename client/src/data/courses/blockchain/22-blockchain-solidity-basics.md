---
title: Solidity Basics
---

## Solidity Basics

Solidity is the most popular programming language for writing smart contracts on Ethereum and EVM-compatible blockchains. It is statically typed, supports inheritance, and compiles to EVM bytecode.

---

## What is Solidity?

| Aspect | Detail |
|--------|--------|
| Type | High-level, statically typed |
| Paradigm | Object-oriented, contract-oriented |
| Compiled to | EVM bytecode |
| File extension | `.sol` |
| Influenced by | C++, Python, JavaScript |
| Created by | Gavin Wood (2014) |

Solidity code runs on the Ethereum Virtual Machine (EVM). Once deployed, the compiled bytecode lives on-chain and is immutable.

---

## SPDX License Identifier

Every Solidity file should start with an SPDX license comment. This is not enforced at runtime but the compiler will warn if it is missing.

```solidity
// SPDX-License-Identifier: MIT
```

Common licenses: `MIT`, `GPL-3.0`, `UNLICENSED` (proprietary), `Apache-2.0`.

---

## Pragma Directive

The `pragma` statement tells the compiler which versions of Solidity are compatible with your code.

```solidity
// Only version 0.8.20
pragma solidity 0.8.20;

// Any version from 0.8.0 up to (not including) 0.9.0
pragma solidity ^0.8.0;

// Range
pragma solidity >=0.8.0 <0.9.0;
```

Always pin or constrain the version to avoid unexpected breaking changes.

---

## Contract Structure

A Solidity contract is similar to a class in object-oriented languages:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    // State variables (stored on-chain)
    uint256 public myNumber;
    address public owner;

    // Constructor (runs once at deployment)
    constructor(uint256 _initialNumber) {
        myNumber = _initialNumber;
        owner = msg.sender;
    }

    // Functions (define behavior)
    function setNumber(uint256 _newNumber) external {
        myNumber = _newNumber;
    }

    function getNumber() external view returns (uint256) {
        return myNumber;
    }
}
```

---

## Key Components

| Component | Purpose | Example |
|-----------|---------|---------|
| State variables | Persistent on-chain storage | `uint256 public count;` |
| Constructor | Initializes contract at deploy time | `constructor() { ... }` |
| Functions | Define contract behavior | `function add() public { ... }` |
| Events | Log data for off-chain listeners | `event Transfer(...)` |
| Modifiers | Reusable function guards | `modifier onlyOwner { ... }` |
| Errors | Custom revert reasons | `error Unauthorized();` |

---

## A Complete Example: Counter Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title A simple counter contract
/// @notice Demonstrates basic Solidity concepts
contract Counter {
    // State variable — stored permanently on the blockchain
    uint256 private count;

    // Event — emitted when count changes
    event CountChanged(uint256 newCount);

    // Constructor — sets initial count
    constructor(uint256 _initialCount) {
        count = _initialCount;
    }

    // Increment the counter
    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    // Decrement the counter (reverts on underflow in Solidity 0.8+)
    function decrement() external {
        count -= 1;
        emit CountChanged(count);
    }

    // Read the current count (view = no state modification)
    function getCount() external view returns (uint256) {
        return count;
    }
}
```

---

## Compiling Solidity

Solidity source code must be compiled to EVM bytecode before deployment.

| Tool | Command | Notes |
|------|---------|-------|
| solc (CLI) | `solc --bin --abi Counter.sol` | Low-level compiler |
| Remix IDE | Click "Compile" button | Browser-based, beginner-friendly |
| Hardhat | `npx hardhat compile` | Most popular dev framework |
| Foundry | `forge build` | Fast, Rust-based |

The compiler produces two key outputs:
- **Bytecode** — deployed to the blockchain
- **ABI (Application Binary Interface)** — JSON describing how to interact with the contract

---

## msg and tx Global Variables

Inside a function, you have access to transaction context:

| Variable | Type | Description |
|----------|------|-------------|
| `msg.sender` | address | The account calling the function |
| `msg.value` | uint256 | ETH sent with the call (in Wei) |
| `msg.data` | bytes | Complete calldata |
| `tx.origin` | address | Original EOA that started the transaction |
| `block.timestamp` | uint256 | Current block timestamp |
| `block.number` | uint256 | Current block number |

---

## Key Takeaways

- Solidity is a statically typed language that compiles to EVM bytecode
- Every file starts with an SPDX license and a pragma version directive
- Contracts contain state variables, a constructor, functions, events, and modifiers
- State variables persist on-chain; local variables exist only during execution
- The compiler produces bytecode (for deployment) and an ABI (for interaction)
- Solidity 0.8+ includes built-in overflow/underflow protection

---

[Next: Solidity Data Types & Variables](./23-blockchain-solidity-data-types)
