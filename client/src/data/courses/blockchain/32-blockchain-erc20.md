---
title: ERC-20 Token Standard
---

ERC-20 is the most widely used token standard on Ethereum. It defines a common interface for fungible tokens — tokens where every unit is identical and interchangeable, like currencies or loyalty points.

---

## What is ERC-20?

ERC-20 (Ethereum Request for Comments 20) was proposed in 2015 by Fabian Vogelsteller. It standardizes how tokens behave so wallets, exchanges, and dApps can interact with any ERC-20 token using the same interface.

| Property | Description |
|----------|-------------|
| Standard | EIP-20 |
| Token Type | Fungible |
| Network | Ethereum (and EVM chains) |
| Examples | USDC, LINK, UNI, DAI |
| Total tokens | 500,000+ deployed |

---

## The ERC-20 Interface

Every ERC-20 token must implement these functions and events:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    // Returns the total supply of tokens
    function totalSupply() external view returns (uint256);

    // Returns the balance of a specific account
    function balanceOf(address account) external view returns (uint256);

    // Transfers tokens from caller to recipient
    function transfer(address to, uint256 amount) external returns (bool);

    // Returns the remaining allowance for a spender
    function allowance(address owner, address spender) external view returns (uint256);

    // Approves a spender to spend tokens on behalf of caller
    function approve(address spender, uint256 amount) external returns (bool);

    // Transfers tokens from one address to another (using allowance)
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

---

## Function Breakdown

| Function | Purpose | Who Calls |
|----------|---------|-----------|
| `totalSupply()` | Get total token supply | Anyone |
| `balanceOf(address)` | Check account balance | Anyone |
| `transfer(to, amount)` | Send your tokens | Token holder |
| `approve(spender, amount)` | Allow someone to spend | Token holder |
| `transferFrom(from, to, amount)` | Spend allowed tokens | Approved spender |
| `allowance(owner, spender)` | Check spending allowance | Anyone |

### The Approve + TransferFrom Pattern

This two-step process enables smart contracts (like DEXs) to move tokens on your behalf:

1. You call `approve(dexAddress, 1000)` — allowing the DEX to spend 1000 tokens
2. The DEX calls `transferFrom(yourAddress, buyerAddress, 500)` — moves 500 of your tokens

---

## Implementation Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** decimals;
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Approve to zero address");

        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");

        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }
}
```

---

## Events

Events allow off-chain applications to track token activity:

```solidity
// Emitted on every token transfer (including minting and burning)
event Transfer(address indexed from, address indexed to, uint256 value);

// Emitted when an allowance is set via approve()
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### Listening to Events in JavaScript

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_KEY");
const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];

const contract = new ethers.Contract(tokenAddress, abi, provider);

contract.on("Transfer", (from, to, value) => {
  console.log(`Transfer: ${from} -> ${to}: ${ethers.formatUnits(value, 6)} USDC`);
});
```

---

## Using OpenZeppelin

OpenZeppelin provides audited, battle-tested ERC-20 implementations:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    constructor() ERC20("GameToken", "GAME") Ownable(msg.sender) {
        // Mint 1 million tokens to deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    // Only owner can mint new tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Optional Extensions

| Extension | Purpose |
|-----------|---------|
| ERC20Burnable | Allow holders to destroy tokens |
| ERC20Capped | Set a maximum supply |
| ERC20Pausable | Emergency pause transfers |
| ERC20Permit | Gasless approvals (EIP-2612) |
| ERC20Votes | Governance voting power |

---

## Decimals Explained

ERC-20 tokens use integers internally. The `decimals` field (usually 18) tells UIs how to display values:

| Token | Decimals | 1 Token (internal) |
|-------|----------|-------------------|
| Most tokens | 18 | 1000000000000000000 |
| USDC | 6 | 1000000 |
| WBTC | 8 | 100000000 |

```javascript
// Converting between human-readable and internal values
const amount = ethers.parseUnits("100.5", 18); // 100.5 tokens → BigInt
const display = ethers.formatUnits(amount, 18); // BigInt → "100.5"
```

---

## Common Pitfalls

| Issue | Problem | Solution |
|-------|---------|----------|
| Approve race condition | Changing allowance from N to M lets spender use N+M | Set to 0 first, or use increaseAllowance |
| Missing zero-address check | Tokens sent to 0x0 are burned permanently | Validate recipient address |
| No event emission | Off-chain tools can't track transfers | Always emit Transfer and Approval |
| Wrong decimals handling | Users lose or gain tokens | Always multiply/divide by 10^decimals |

---

## Key Takeaways

- ERC-20 defines a standard interface for fungible tokens on Ethereum
- The six core functions enable transfers, allowances, and balance queries
- The approve/transferFrom pattern lets contracts manage tokens on your behalf
- Always emit Transfer and Approval events for off-chain tracking
- Use OpenZeppelin's implementation rather than writing your own from scratch
- Handle decimals carefully — most tokens use 18, but USDC uses 6
- Consider extensions like Burnable, Pausable, and Permit for production tokens

---

## Next

[ERC-721 NFT Standard](/courses/blockchain/33-blockchain-erc721)
