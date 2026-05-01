---
title: Solidity Inheritance & Interfaces
---

## Solidity Inheritance & Interfaces

Solidity supports object-oriented inheritance, enabling code reuse and modular contract design. Understanding inheritance, interfaces, and libraries is key to building professional smart contracts.

---

## Single Inheritance

A contract can inherit from a parent using the `is` keyword:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}

// Token inherits from Ownable
contract Token is Ownable {
    mapping(address => uint256) public balances;

    // Can use onlyOwner modifier from parent
    function mint(address to, uint256 amount) external onlyOwner {
        balances[to] += amount;
    }
}
```

---

## Multiple Inheritance

Solidity supports multiple inheritance. List parents from **most base-like to most derived**:

```solidity
contract A {
    function greet() public pure virtual returns (string memory) {
        return "A";
    }
}

contract B is A {
    function greet() public pure virtual override returns (string memory) {
        return "B";
    }
}

contract C is A {
    function greet() public pure virtual override returns (string memory) {
        return "C";
    }
}

// Must list in linearization order (most base to most derived)
contract D is A, B, C {
    function greet() public pure override(A, B, C) returns (string memory) {
        return "D";
    }
}
```

| Rule | Description |
|------|-------------|
| Linearization (C3) | Solidity resolves the inheritance order deterministically |
| Order matters | List from most base to most derived |
| Override all | Must override if multiple parents define same function |

---

## Virtual and Override

| Keyword | Purpose |
|---------|---------|
| `virtual` | Marks a function as overridable by children |
| `override` | Indicates the function overrides a parent's function |

```solidity
contract Base {
    // Must be marked virtual to allow overriding
    function getValue() public pure virtual returns (uint256) {
        return 10;
    }
}

contract Child is Base {
    // Must use override keyword
    function getValue() public pure override returns (uint256) {
        return 20;
    }
}
```

---

## The super Keyword

`super` calls the parent contract's implementation in the linearization order:

```solidity
contract A {
    event Log(string message);

    function foo() public virtual {
        emit Log("A.foo");
    }
}

contract B is A {
    function foo() public virtual override {
        emit Log("B.foo");
        super.foo(); // calls A.foo()
    }
}

contract C is A {
    function foo() public virtual override {
        emit Log("C.foo");
        super.foo(); // calls A.foo()
    }
}

contract D is B, C {
    function foo() public override(B, C) {
        super.foo(); // calls C.foo() → B.foo() → A.foo() (C3 linearization)
    }
}
```

---

## Abstract Contracts

Abstract contracts have at least one unimplemented function. They cannot be deployed directly.

```solidity
abstract contract Shape {
    // No implementation — child must provide it
    function area() public view virtual returns (uint256);

    // Implemented function — children inherit it
    function describe() public pure returns (string memory) {
        return "I am a shape";
    }
}

contract Square is Shape {
    uint256 public side;

    constructor(uint256 _side) {
        side = _side;
    }

    function area() public view override returns (uint256) {
        return side * side;
    }
}
```

---

## Interfaces

Interfaces define a contract's external API without any implementation.

| Rule | Description |
|------|-------------|
| No state variables | Only function signatures |
| No constructor | Cannot be deployed |
| No function bodies | All functions are implicitly `virtual` |
| All functions `external` | Cannot be `public`, `internal`, or `private` |
| Can inherit interfaces | `interface A is B { }` |

```solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract MyToken is IERC20 {
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address, uint256) external pure override returns (bool) {
        return true;
    }
}
```

---

## Libraries

Libraries are deployed once and called via `DELEGATECALL`. They cannot hold state.

```solidity
library MathLib {
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a <= b ? a : b;
    }
}

contract Calculator {
    // Attach library functions to a type
    using MathLib for uint256;

    function biggest(uint256 x, uint256 y) external pure returns (uint256) {
        return x.max(y); // calls MathLib.max(x, y)
    }
}
```

---

## Constructor Inheritance

```solidity
contract Base {
    uint256 public x;
    constructor(uint256 _x) { x = _x; }
}

// Option 1: pass argument directly
contract Child1 is Base(10) {}

// Option 2: pass argument in child constructor
contract Child2 is Base {
    constructor(uint256 _val) Base(_val * 2) {}
}
```

---

## Key Takeaways

- Use `is` for inheritance; list parents from most base to most derived
- Mark overridable functions as `virtual`; use `override` in child contracts
- `super` follows C3 linearization order, not just the immediate parent
- Abstract contracts have unimplemented functions and cannot be deployed
- Interfaces define external APIs — they are the standard way to describe contract capabilities
- Libraries provide reusable logic without state; `using...for` attaches them to types

---

[Next: Solidity Events & Error Handling](./26-blockchain-solidity-events)
