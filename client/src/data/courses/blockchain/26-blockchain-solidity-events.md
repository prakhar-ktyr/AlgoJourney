---
title: Solidity Events & Error Handling
---

## Solidity Events & Error Handling

Events allow contracts to communicate with the outside world (dApps, indexers). Error handling ensures contracts fail safely and provide meaningful feedback. Both are essential for production-quality smart contracts.

---

## Events

Events write data to the transaction log — a special data structure that is cheap to store but cannot be read by contracts. Off-chain applications (frontends, The Graph, etc.) listen for these logs.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventExample {
    // Declare an event
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) external {
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Emit the event
        emit Transfer(msg.sender, to, amount);
    }
}
```

---

## Indexed Parameters

| Feature | Indexed | Non-indexed |
|---------|---------|-------------|
| Max per event | 3 | Unlimited |
| Stored in | Log topics | Log data |
| Filterable | Yes | No |
| Cost | Slightly more gas | Standard |
| Value types | Stored directly | ABI-encoded |
| Reference types | Stored as keccak256 hash | ABI-encoded |

```solidity
// You can filter for specific Transfer events by `from` or `to`
event Transfer(address indexed from, address indexed to, uint256 amount);

// Non-indexed: you'd need to decode all events to find a specific amount
event Deposit(address indexed user, uint256 amount, uint256 timestamp);
```

**Best practice**: Index parameters you need to filter by (addresses, IDs). Keep values you only read as non-indexed.

---

## Event Gas Costs

| Operation | Approximate Gas |
|-----------|----------------|
| Base event cost | 375 gas |
| Per topic (indexed param) | 375 gas |
| Per byte of data | 8 gas |
| Storing same data in storage | 20,000+ gas |

Events are ~100x cheaper than storage — use them for historical data that contracts do not need to read.

---

## Error Handling: require, assert, revert

| Function | Use Case | Refunds Gas | Error Data |
|----------|----------|:-----------:|------------|
| `require(condition, "msg")` | Input validation, preconditions | Yes | Error string |
| `assert(condition)` | Internal invariants, bugs | No (pre-0.8) / Yes (0.8+) | Panic code |
| `revert("msg")` | Complex conditional logic | Yes | Error string |

```solidity
contract ErrorHandling {
    address public owner;
    uint256 public balance;

    constructor() {
        owner = msg.sender;
    }

    // require: validate inputs and preconditions
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        require(amount <= balance, "Insufficient balance");
        balance -= amount;
        payable(owner).transfer(amount);
    }

    // assert: check invariants (should NEVER fail)
    function internalCheck() external view {
        assert(balance >= 0); // uint256 can't be negative, but demonstrates usage
    }

    // revert: complex conditional logic
    function complexValidation(uint256 x) external pure returns (uint256) {
        if (x == 0) {
            revert("Cannot be zero");
        }
        if (x > 1000) {
            revert("Too large");
        }
        return x * 2;
    }
}
```

---

## Custom Errors (Solidity 0.8.4+)

Custom errors are significantly cheaper than error strings and can carry structured data.

```solidity
// Define custom errors at file or contract level
error Unauthorized(address caller, address required);
error InsufficientBalance(uint256 requested, uint256 available);
error ZeroAddress();

contract CustomErrors {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function withdraw(uint256 amount) external {
        if (msg.sender != owner) {
            revert Unauthorized(msg.sender, owner);
        }
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        balances[msg.sender] -= amount;
    }

    function setOwner(address newOwner) external {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }
        if (msg.sender != owner) {
            revert Unauthorized(msg.sender, owner);
        }
        owner = newOwner;
    }
}
```

| Approach | Gas Cost | Data Richness |
|----------|----------|---------------|
| `require("string")` | ~200+ gas per char | Limited |
| `revert CustomError()` | Fixed ~100 gas | Structured parameters |
| Savings | ~50% cheaper | More informative |

---

## Try/Catch

`try/catch` handles errors from external calls and contract creation:

```solidity
interface IExternalContract {
    function riskyOperation(uint256 x) external returns (uint256);
}

contract TryCatch {
    event Success(uint256 result);
    event Failed(string reason);
    event FailedLowLevel(bytes data);

    function callExternal(address target, uint256 value) external {
        try IExternalContract(target).riskyOperation(value) returns (uint256 result) {
            emit Success(result);
        } catch Error(string memory reason) {
            // Catches require() and revert("string")
            emit Failed(reason);
        } catch (bytes memory lowLevelData) {
            // Catches custom errors and other failures
            emit FailedLowLevel(lowLevelData);
        }
    }
}
```

---

## Error Handling Best Practices

| Practice | Reasoning |
|----------|-----------|
| Use custom errors over string messages | Cheaper and more informative |
| Validate inputs at function start | Fail fast, save gas |
| Use `require` for user errors | Input validation, access control |
| Use `assert` for impossible states | Bugs only, never user input |
| Always handle external call failures | External contracts can revert unexpectedly |
| Emit events before state changes (CEI pattern) | Prevents reentrancy issues |

---

## Key Takeaways

- Events log data cheaply for off-chain consumers — ~100x cheaper than storage
- Use `indexed` on parameters you need to filter by (max 3 per event)
- `require` validates user input; `assert` checks invariants; `revert` for complex logic
- Custom errors (Solidity 0.8.4+) save ~50% gas over string error messages
- `try/catch` only works on external calls and contract creation
- Prefer the Checks-Effects-Interactions pattern for secure state changes

---

[Next: Deploying Smart Contracts](./27-blockchain-deploying-contracts)
