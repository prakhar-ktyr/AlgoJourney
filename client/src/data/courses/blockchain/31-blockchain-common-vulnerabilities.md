---
title: Common Smart Contract Vulnerabilities
---

Smart contracts are immutable once deployed, making security paramount. A single vulnerability can lead to millions of dollars in losses. This lesson covers the most critical vulnerabilities every Solidity developer must understand.

---

## Reentrancy Attack

Reentrancy occurs when an external contract calls back into the vulnerable contract before the first execution completes.

### The DAO Hack (2016)

The DAO lost ~$60 million in ETH due to a reentrancy vulnerability. The attacker repeatedly withdrew funds before the balance was updated.

```solidity
// VULNERABLE contract
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // BUG: External call BEFORE state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // This line executes AFTER the attacker re-enters
        balances[msg.sender] = 0;
    }
}
```

```solidity
// ATTACKER contract
contract Attacker {
    VulnerableVault public vault;

    constructor(address _vault) {
        vault = VulnerableVault(_vault);
    }

    function attack() external payable {
        vault.deposit{value: msg.value}();
        vault.withdraw();
    }

    // This is called when the vault sends ETH
    receive() external payable {
        if (address(vault).balance >= 1 ether) {
            vault.withdraw(); // Re-enter!
        }
    }
}
```

### Prevention: Checks-Effects-Interactions Pattern

```solidity
// SECURE contract
contract SecureVault {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // Effect: Update state BEFORE interaction
        balances[msg.sender] = 0;

        // Interaction: External call LAST
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

You can also use OpenZeppelin's `ReentrancyGuard`:

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureVault is ReentrancyGuard {
    function withdraw() public nonReentrant {
        // Safe from reentrancy
    }
}
```

---

## Integer Overflow / Underflow

| Solidity Version | Behavior | Mitigation |
|-----------------|----------|------------|
| < 0.8.0 | Silently wraps around | Use SafeMath library |
| >= 0.8.0 | Reverts automatically | Built-in protection |

```solidity
// Pre-0.8: uint8 max = 255, adding 1 wraps to 0
uint8 x = 255;
x += 1; // x = 0 (overflow!)

// Pre-0.8: uint8 min = 0, subtracting 1 wraps to 255
uint8 y = 0;
y -= 1; // y = 255 (underflow!)
```

In Solidity 0.8+, these operations revert automatically. Use `unchecked` blocks only when you explicitly want wrapping behavior for gas optimization.

---

## Front-Running

Front-running exploits the public mempool. Attackers see pending transactions and submit their own with higher gas to execute first.

| Attack Type | Description | Example |
|------------|-------------|---------|
| Displacement | Attacker's tx replaces victim's | Token purchase before large buy |
| Insertion | Attacker profits between two txs | Sandwich attack on DEX swap |
| Suppression | Attacker delays victim's tx | Blocking a liquidation |

### Mitigation Strategies

- Commit-reveal schemes
- Submarine sends (hidden transactions)
- Using Flashbots or private mempools
- Setting maximum slippage tolerance

---

## Access Control Issues

```solidity
// VULNERABLE: Anyone can call this
contract Vulnerable {
    address public owner;

    function setOwner(address _newOwner) public {
        owner = _newOwner; // No access check!
    }

    function withdrawAll() public {
        // No access check!
        payable(msg.sender).transfer(address(this).balance);
    }
}

// SECURE: Proper access control
contract Secure {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }
}
```

---

## tx.origin vs msg.sender

| Property | `msg.sender` | `tx.origin` |
|----------|-------------|-------------|
| Value | Immediate caller | Original EOA |
| Safe for auth | Yes | No |
| Through proxy | Contract address | Still EOA |

```solidity
// VULNERABLE: tx.origin phishing
contract VulnerableWallet {
    address public owner;

    function transfer(address to, uint256 amount) public {
        require(tx.origin == owner, "Not owner"); // WRONG!
        payable(to).transfer(amount);
    }
}

// Attacker tricks owner into calling their contract,
// which calls VulnerableWallet.transfer — tx.origin is still the owner!
```

**Always use `msg.sender` for authentication.**

---

## Unchecked Return Values

Low-level calls (`call`, `send`, `transfer`) can fail silently if you don't check the return value.

```solidity
// VULNERABLE
function withdraw(uint256 amount) public {
    payable(msg.sender).send(amount); // Might fail silently!
}

// SECURE
function withdraw(uint256 amount) public {
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Transfer failed");
}
```

---

## Denial of Service (DoS)

### Gas Limit DoS

```solidity
// VULNERABLE: Unbounded loop
contract Vulnerable {
    address[] public recipients;

    function distribute() public {
        for (uint i = 0; i < recipients.length; i++) {
            // If array is too large, this exceeds block gas limit
            payable(recipients[i]).transfer(1 ether);
        }
    }
}
```

### Mitigation: Pull over Push

```solidity
// SECURE: Let users withdraw individually
contract Secure {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

---

## Vulnerability Summary

| Vulnerability | Severity | Prevention |
|--------------|----------|------------|
| Reentrancy | Critical | CEI pattern, ReentrancyGuard |
| Integer overflow | High | Solidity 0.8+ or SafeMath |
| Front-running | Medium | Commit-reveal, Flashbots |
| Access control | Critical | Modifiers, OpenZeppelin Access |
| tx.origin auth | High | Use msg.sender |
| Unchecked returns | Medium | Always check return values |
| DoS | Medium | Pull pattern, bounded loops |

---

## Key Takeaways

- Always follow the Checks-Effects-Interactions pattern to prevent reentrancy
- Solidity 0.8+ has built-in overflow protection — use it
- Never use `tx.origin` for authentication; always use `msg.sender`
- Check return values of all external calls
- Prefer pull-over-push payment patterns to avoid DoS
- Use battle-tested libraries like OpenZeppelin whenever possible
- Get professional audits before deploying contracts handling real value

---

## Next

[ERC-20 Token Standard](/courses/blockchain/32-blockchain-erc20)
