---
title: Solidity Functions & Modifiers
---

## Solidity Functions & Modifiers

Functions are the executable units of a smart contract. Understanding visibility, state mutability, and modifiers is crucial for writing secure and gas-efficient contracts.

---

## Function Syntax

```solidity
function functionName(paramType paramName)
    visibility
    stateMutability
    modifiers
    returns (returnType)
{
    // body
}
```

---

## Function Visibility

Visibility determines who can call a function:

| Visibility | Contract Itself | Derived Contracts | External Contracts | EOAs |
|------------|:-:|:-:|:-:|:-:|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `external` | ❌ (use `this.fn()`) | ❌ | ✅ | ✅ |
| `internal` | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VisibilityExample {
    // Anyone can call
    function publicFn() public pure returns (string memory) {
        return "public";
    }

    // Only external calls (cheaper for large calldata)
    function externalFn() external pure returns (string memory) {
        return "external";
    }

    // This contract + children
    function internalFn() internal pure returns (string memory) {
        return "internal";
    }

    // Only this contract
    function privateFn() private pure returns (string memory) {
        return "private";
    }

    function callInternal() external pure returns (string memory) {
        return internalFn(); // OK
    }
}
```

**Best practice**: Use `external` for functions only called from outside (saves gas). Use `private` or `internal` for helper functions.

---

## State Mutability

| Keyword | Reads State | Writes State | Receives ETH | Gas Cost |
|---------|:-:|:-:|:-:|----------|
| (none) | ✅ | ✅ | ❌ | Full |
| `view` | ✅ | ❌ | ❌ | Free (if called externally) |
| `pure` | ❌ | ❌ | ❌ | Free (if called externally) |
| `payable` | ✅ | ✅ | ✅ | Full |

```solidity
contract MutabilityExample {
    uint256 public count;

    // Modifies state — costs gas
    function increment() external {
        count += 1;
    }

    // Only reads state — free when called externally
    function getCount() external view returns (uint256) {
        return count;
    }

    // No state access at all — free when called externally
    function add(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    // Can receive ETH
    function deposit() external payable {
        // msg.value contains the ETH sent
    }
}
```

---

## Function Modifiers

Modifiers add reusable preconditions to functions. The `_` placeholder represents the original function body.

```solidity
contract ModifierExample {
    address public owner;
    bool public paused;

    constructor() {
        owner = msg.sender;
    }

    // Modifier: restricts to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _; // execute the function body
    }

    // Modifier: checks contract is not paused
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    // Modifier with parameter
    modifier minValue(uint256 _min) {
        require(msg.value >= _min, "Below minimum");
        _;
    }

    // Using multiple modifiers (executed left to right)
    function withdraw() external onlyOwner whenNotPaused {
        payable(owner).transfer(address(this).balance);
    }

    function pause() external onlyOwner {
        paused = true;
    }

    // Modifier with argument
    function donate() external payable minValue(0.01 ether) {
        // only executes if msg.value >= 0.01 ether
    }
}
```

---

## Receive and Fallback Functions

These special functions handle ETH transfers and unknown function calls.

```solidity
contract ReceiveFallback {
    event Received(address sender, uint256 amount);
    event FallbackCalled(address sender, bytes data);

    // Called when ETH is sent with empty calldata
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // Called when no function matches OR when ETH sent without receive()
    fallback() external payable {
        emit FallbackCalled(msg.sender, msg.data);
    }
}
```

| Scenario | Function Called |
|----------|----------------|
| Plain ETH transfer (empty calldata) | `receive()` |
| ETH transfer, no `receive()` defined | `fallback()` |
| Call to non-existent function | `fallback()` |
| Neither defined | Transaction reverts |

---

## Function Overloading

Solidity supports function overloading — same name, different parameters:

```solidity
contract Overloading {
    function process(uint256 x) external pure returns (uint256) {
        return x * 2;
    }

    function process(uint256 x, uint256 y) external pure returns (uint256) {
        return x + y;
    }

    function process(string calldata s) external pure returns (uint256) {
        return bytes(s).length;
    }
}
```

The compiler differentiates them by their parameter types (function selector is based on full signature).

---

## Returning Multiple Values

```solidity
contract MultiReturn {
    function getInfo() external pure returns (uint256, bool, address) {
        return (42, true, address(0));
    }

    function useInfo() external pure returns (uint256) {
        (uint256 num, , ) = getInfo(); // skip values with empty slots
        return num;
    }
}
```

---

## Key Takeaways

- Use `external` for functions called from outside (gas savings over `public`)
- `view` and `pure` functions are free when called externally (no transaction needed)
- `payable` is required for functions that accept ETH
- Modifiers are reusable guards — the `_` placeholder marks where the function body executes
- `receive()` handles plain ETH transfers; `fallback()` catches unmatched calls
- Always apply the principle of least privilege — use the most restrictive visibility possible

---

[Next: Solidity Inheritance & Interfaces](./25-blockchain-solidity-inheritance)
