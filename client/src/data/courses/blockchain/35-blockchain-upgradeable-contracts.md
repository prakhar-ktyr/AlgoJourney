---
title: Upgradeable Contracts
---

Smart contracts on Ethereum are immutable by default — once deployed, their code cannot be changed. This creates a dilemma: what happens when you find a bug or need to add features? Upgradeable contract patterns solve this by separating storage from logic.

---

## The Immutable Code Dilemma

| Problem | Impact |
|---------|--------|
| Bug discovered post-deploy | Funds permanently at risk |
| New feature needed | Must deploy entirely new contract |
| Regulatory requirement changes | Cannot comply without migration |
| Optimization found | Can't reduce gas costs for users |
| State migration | Complex, expensive, error-prone |

The challenge: how do we upgrade logic while preserving state and the contract address?

---

## How Proxy Patterns Work

The solution uses `delegatecall` — a special EVM opcode that executes another contract's code in the caller's storage context.

```
User → Proxy Contract → Implementation Contract
        (stores data)    (has the logic)
        (fixed address)  (can be swapped)
```

```solidity
// Simplified proxy mechanism
contract Proxy {
    address public implementation;

    fallback() external payable {
        address impl = implementation;
        assembly {
            // Copy calldata
            calldatacopy(0, 0, calldatasize())
            // delegatecall to implementation
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            // Copy return data
            returndatacopy(0, 0, returndatasize())
            // Return or revert
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
```

### Key Concept: delegatecall

| Aspect | Regular call | delegatecall |
|--------|-------------|--------------|
| Code executed | Called contract's | Called contract's |
| Storage used | Called contract's | Caller's (proxy) |
| msg.sender | Proxy address | Original user |
| msg.value | Original value | Original value |
| Address context | Implementation | Proxy |

---

## Transparent Proxy Pattern

The Transparent Proxy separates admin calls (upgrade functions) from user calls (business logic) to avoid function selector clashes.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

// Implementation V1
contract BoxV1 {
    uint256 private _value;

    function store(uint256 value) public {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }
}

// Implementation V2 (adds increment)
contract BoxV2 {
    uint256 private _value;

    function store(uint256 value) public {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }

    function increment() public {
        _value += 1;
    }
}
```

| Feature | Transparent Proxy |
|---------|------------------|
| Admin calls | Routed to proxy (upgrade logic) |
| User calls | Delegated to implementation |
| Gas overhead | Higher (admin check every call) |
| Complexity | Moderate |
| Use case | Most general-purpose upgrades |

---

## UUPS Proxy Pattern

Universal Upgradeable Proxy Standard (EIP-1822) moves the upgrade logic into the implementation contract itself.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BoxV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private _value;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function store(uint256 value) public {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

| Feature | UUPS Proxy |
|---------|-----------|
| Upgrade logic location | Implementation contract |
| Gas overhead | Lower (no admin check) |
| Risk | Can break upgrades if _authorizeUpgrade removed |
| Complexity | Lower proxy, higher implementation |
| Use case | Gas-sensitive applications |

---

## Beacon Proxy Pattern

Multiple proxy contracts share a single beacon that points to the implementation. Upgrading the beacon upgrades ALL proxies at once.

```
Proxy A ──┐
Proxy B ──┼──→ Beacon ──→ Implementation V1
Proxy C ──┘

After upgrade:
Proxy A ──┐
Proxy B ──┼──→ Beacon ──→ Implementation V2
Proxy C ──┘
```

| Feature | Beacon Proxy |
|---------|-------------|
| Best for | Many instances of same contract |
| Upgrade scope | All proxies at once |
| Gas per proxy | Lower (minimal proxy code) |
| Use case | Factory patterns, many clones |

---

## Storage Layout Rules

**The most critical rule**: never change the order or type of existing storage variables when upgrading.

```solidity
// V1 Storage Layout
contract BoxV1 {
    uint256 private _value;    // Slot 0
    address private _owner;    // Slot 1
}

// V2 - CORRECT: Append new variables at the end
contract BoxV2 {
    uint256 private _value;    // Slot 0 (unchanged)
    address private _owner;    // Slot 1 (unchanged)
    uint256 private _version;  // Slot 2 (new)
}

// V2 - WRONG: Inserting or reordering breaks storage!
contract BoxV2Bad {
    uint256 private _version;  // Slot 0 (COLLISION with _value!)
    uint256 private _value;    // Slot 1 (COLLISION with _owner!)
    address private _owner;    // Slot 2 (reads garbage data!)
}
```

### Storage Gap Pattern

Reserve space for future variables:

```solidity
contract BoxV1 {
    uint256 private _value;

    // Reserve 49 slots for future upgrades
    uint256[49] private __gap;
}

contract BoxV2 {
    uint256 private _value;
    uint256 private _newField; // Uses one gap slot

    uint256[48] private __gap; // Reduce gap by 1
}
```

---

## OpenZeppelin Upgrades Plugin

```javascript
// Deploy upgradeable contract using Hardhat
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploy V1
  const BoxV1 = await ethers.getContractFactory("BoxV1");
  const proxy = await upgrades.deployProxy(BoxV1, [], { initializer: "initialize" });
  await proxy.waitForDeployment();
  console.log("Proxy deployed to:", await proxy.getAddress());

  // Later: Upgrade to V2
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  const upgraded = await upgrades.upgradeProxy(await proxy.getAddress(), BoxV2);
  console.log("Upgraded! Same address:", await upgraded.getAddress());

  // State is preserved
  const value = await upgraded.retrieve();
  console.log("Value preserved:", value.toString());
}
```

---

## Proxy Pattern Comparison

| Pattern | Gas Cost | Upgrade Scope | Complexity | Best For |
|---------|----------|---------------|------------|----------|
| Transparent | Higher | Single contract | Medium | General purpose |
| UUPS | Lower | Single contract | Medium | Gas optimization |
| Beacon | Lowest per proxy | All proxies | Higher | Factory/clones |
| Diamond (EIP-2535) | Variable | Modular functions | Highest | Large systems |

---

## Risks and Tradeoffs

| Risk | Description | Mitigation |
|------|-------------|------------|
| Storage collision | Variables overwrite each other | Follow layout rules, use gaps |
| Uninitialized proxy | Constructor doesn't run for proxy | Use initializer pattern |
| Centralization | Admin can change contract logic | Timelock, multisig, governance |
| Broken upgrade | Remove upgrade function in UUPS | Thorough testing |
| Function clashes | Proxy and implementation share selector | Transparent proxy pattern |

### Initializers vs Constructors

```solidity
// WRONG: Constructor won't execute for proxy
constructor() {
    owner = msg.sender; // Only sets implementation's storage
}

// CORRECT: Use initializer
function initialize() public initializer {
    owner = msg.sender; // Sets proxy's storage
}
```

---

## Key Takeaways

- Proxy patterns enable upgradeability by separating storage (proxy) from logic (implementation)
- `delegatecall` executes implementation code in the proxy's storage context
- Never modify storage variable order or types when upgrading — only append
- Use storage gaps to reserve space for future variables
- Transparent proxies prevent selector clashes; UUPS is more gas-efficient
- Beacon proxies upgrade multiple instances simultaneously
- Always use OpenZeppelin's upgrades plugin for safety checks
- Upgradeability introduces centralization risk — mitigate with timelocks and multisigs

---

## Next

[DeFi Overview](/courses/blockchain/36-blockchain-defi-overview)
