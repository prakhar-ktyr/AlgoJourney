---
title: Solidity Data Types & Variables
---

## Solidity Data Types & Variables

Solidity is statically typed — every variable must have its type declared at compile time. Understanding the type system is essential for writing efficient and secure smart contracts.

---

## Value Types

Value types are passed by value and always copied when assigned.

| Type | Description | Example |
|------|-------------|---------|
| `bool` | Boolean (true/false) | `bool active = true;` |
| `uint256` | Unsigned integer (0 to 2²⁵⁶−1) | `uint256 count = 42;` |
| `int256` | Signed integer (−2²⁵⁵ to 2²⁵⁵−1) | `int256 temp = -10;` |
| `address` | 20-byte Ethereum address | `address owner = msg.sender;` |
| `address payable` | Address that can receive ETH | `address payable wallet;` |
| `bytes1` to `bytes32` | Fixed-size byte arrays | `bytes32 hash;` |

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ValueTypes {
    bool public isActive = true;
    uint256 public maxSupply = 10000;
    int256 public temperature = -5;
    address public owner = 0x1234567890AbcdEF1234567890aBcdef12345678;
    bytes32 public dataHash;

    // Smaller uint sizes save gas in storage packing
    uint8 public smallNumber = 255;    // max for uint8
    uint128 public mediumNumber;
}
```

---

## Reference Types

Reference types store a reference to the data location. You must specify `storage`, `memory`, or `calldata`.

### Arrays

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArrayExample {
    // Dynamic storage array
    uint256[] public numbers;

    // Fixed-size array
    uint256[5] public fixedArray;

    function addNumber(uint256 _num) external {
        numbers.push(_num);
    }

    function getLength() external view returns (uint256) {
        return numbers.length;
    }

    // Memory array (temporary, fixed size once created)
    function createTemporary() external pure returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](3);
        temp[0] = 10;
        temp[1] = 20;
        temp[2] = 30;
        return temp;
    }
}
```

### Mappings

Mappings are hash tables — they cannot be iterated and have no length.

```solidity
contract MappingExample {
    // Simple mapping
    mapping(address => uint256) public balances;

    // Nested mapping
    mapping(address => mapping(address => uint256)) public allowances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}
```

### Structs

```solidity
contract StructExample {
    struct User {
        string name;
        uint256 age;
        address wallet;
        bool active;
    }

    mapping(address => User) public users;

    function createUser(string calldata _name, uint256 _age) external {
        users[msg.sender] = User(_name, _age, msg.sender, true);
    }
}
```

---

## Enums

Enums restrict a variable to a set of predefined constants.

```solidity
contract EnumExample {
    enum Status { Pending, Active, Completed, Cancelled }

    Status public currentStatus;

    function activate() external {
        currentStatus = Status.Active;
    }

    function isCompleted() external view returns (bool) {
        return currentStatus == Status.Completed;
    }
}
```

---

## Data Locations

| Location | Persistence | Modifiable | Gas Cost | Use Case |
|----------|-------------|------------|----------|----------|
| `storage` | Permanent (on-chain) | Yes | Expensive | State variables |
| `memory` | Temporary (within function) | Yes | Moderate | Function parameters, local vars |
| `calldata` | Temporary (read-only input) | No | Cheapest | External function parameters |

```solidity
contract DataLocations {
    string[] public names; // storage by default

    // calldata = read-only, cheapest for external input
    function addName(string calldata _name) external {
        names.push(_name);
    }

    // memory = modifiable temporary copy
    function getFirst() external view returns (string memory) {
        return names[0];
    }

    // storage reference = modify state directly
    function modifyFirst(string calldata _newName) external {
        string storage firstRef = names[0]; // not useful for string, but works for structs
        names[0] = _newName;
    }
}
```

---

## State vs Local Variables

| Feature | State Variable | Local Variable |
|---------|---------------|----------------|
| Declared in | Contract level | Inside functions |
| Stored in | Blockchain (storage) | Memory/stack |
| Persists | Between function calls | Only during execution |
| Gas cost | High (SSTORE = 20,000 gas) | Low |
| Default value | Zero/false/empty | Must be initialized |

---

## Constants and Immutables

```solidity
contract ConstantsExample {
    // constant: set at compile time, cannot change
    uint256 public constant MAX_SUPPLY = 10000;
    address public constant BURN_ADDRESS = address(0);

    // immutable: set once in constructor, then fixed
    address public immutable deployer;
    uint256 public immutable deployTime;

    constructor() {
        deployer = msg.sender;
        deployTime = block.timestamp;
    }
}
```

| Keyword | When Set | Gas for Reads | Stored In |
|---------|----------|---------------|-----------|
| `constant` | Compile time | Very cheap (inlined) | Bytecode |
| `immutable` | Constructor | Very cheap (inlined) | Bytecode |
| (neither) | Anytime | Expensive (SLOAD) | Storage slot |

---

## Key Takeaways

- Solidity has value types (bool, uint, int, address, bytes) and reference types (arrays, mappings, structs)
- Mappings are the most gas-efficient way to store key-value data but cannot be iterated
- Always specify data location (`storage`, `memory`, `calldata`) for reference types in functions
- Use `calldata` for external function inputs to save gas
- Use `constant` and `immutable` to reduce gas costs for values that do not change
- State variables cost 20,000 gas to write — minimize storage writes

---

[Next: Solidity Functions & Modifiers](./24-blockchain-solidity-functions)
