---
title: Testing Smart Contracts
---

## Testing Smart Contracts

Smart contracts are immutable once deployed and often handle real money. Comprehensive testing is not optional — it is the primary defense against costly bugs and exploits.

---

## Why Testing Matters

| Reason | Impact |
|--------|--------|
| Immutable code | Cannot fix bugs after deployment |
| Financial risk | Exploits drain real funds (billions lost historically) |
| Gas optimization | Tests verify optimizations don't break logic |
| Complex interactions | Multi-contract systems need integration tests |
| Upgrade safety | Proxy upgrades must preserve storage layout |

---

## Testing with Hardhat + ethers.js

Hardhat uses Mocha (test runner) + Chai (assertions) + ethers.js (blockchain interaction).

### Example Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    mapping(address => uint256) public balances;
    address public owner;

    error InsufficientBalance(uint256 requested, uint256 available);
    error Unauthorized();

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
}
```

### Hardhat Test File

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
  let vault, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();
  });

  describe("deposit", function () {
    it("should accept ETH deposits", async function () {
      await vault.connect(user1).deposit({ value: ethers.parseEther("1.0") });
      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("1.0"));
    });

    it("should emit Deposited event", async function () {
      await expect(vault.connect(user1).deposit({ value: ethers.parseEther("1.0") }))
        .to.emit(vault, "Deposited")
        .withArgs(user1.address, ethers.parseEther("1.0"));
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      await vault.connect(user1).deposit({ value: ethers.parseEther("2.0") });
    });

    it("should allow withdrawal of deposited funds", async function () {
      await vault.connect(user1).withdraw(ethers.parseEther("1.0"));
      expect(await vault.balances(user1.address)).to.equal(ethers.parseEther("1.0"));
    });

    it("should revert if insufficient balance", async function () {
      await expect(vault.connect(user1).withdraw(ethers.parseEther("5.0")))
        .to.be.revertedWithCustomError(vault, "InsufficientBalance");
    });
  });
});
```

---

## Testing with Foundry (Forge)

Foundry tests are written in Solidity, giving direct access to contract internals.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VaultTest is Test {
    Vault public vault;
    address public user1 = address(0x1);

    function setUp() public {
        vault = new Vault();
        // Fund test user
        vm.deal(user1, 10 ether);
    }

    function testDeposit() public {
        vm.prank(user1); // next call will be from user1
        vault.deposit{value: 1 ether}();
        assertEq(vault.balances(user1), 1 ether);
    }

    function testWithdraw() public {
        vm.startPrank(user1);
        vault.deposit{value: 2 ether}();
        vault.withdraw(1 ether);
        vm.stopPrank();
        assertEq(vault.balances(user1), 1 ether);
    }

    function testRevertInsufficientBalance() public {
        vm.prank(user1);
        vault.deposit{value: 1 ether}();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(Vault.InsufficientBalance.selector, 5 ether, 1 ether)
        );
        vault.withdraw(5 ether);
    }

    function testEmitDeposited() public {
        vm.expectEmit(true, false, false, true);
        emit Vault.Deposited(user1, 1 ether);

        vm.prank(user1);
        vault.deposit{value: 1 ether}();
    }
}
```

---

## Testing Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| Unit tests | Test individual functions | Every function |
| Integration tests | Test multi-contract interactions | DeFi protocols |
| Fork tests | Test against real mainnet state | Integrations with deployed contracts |
| Fuzz tests | Random inputs to find edge cases | Math operations, parsing |
| Invariant tests | Properties that must always hold | Token supplies, balances |
| Gas snapshots | Track gas usage changes | Optimization work |

---

## Fuzz Testing

Fuzz testing automatically generates random inputs to find edge cases:

```solidity
// Foundry fuzz test — Forge generates random values for `amount`
function testFuzz_Deposit(uint256 amount) public {
    // Bound amount to reasonable range
    amount = bound(amount, 0.01 ether, 100 ether);
    vm.deal(user1, amount);

    vm.prank(user1);
    vault.deposit{value: amount}();

    assertEq(vault.balances(user1), amount);
}
```

---

## Test Coverage

```bash
# Hardhat (requires plugin)
npx hardhat coverage

# Foundry
forge coverage
forge coverage --report lcov  # For IDE integration
```

| Coverage Level | Target |
|---------------|--------|
| Minimum acceptable | 80% |
| Good | 90%+ |
| Critical contracts (DeFi) | 95%+ |

---

## Gas Reporting

```bash
# Hardhat
REPORT_GAS=true npx hardhat test

# Foundry
forge test --gas-report
forge snapshot  # Save gas snapshot for comparison
forge snapshot --diff  # Compare against previous snapshot
```

Sample output:

| Function | Min Gas | Avg Gas | Max Gas |
|----------|---------|---------|---------|
| deposit | 43,210 | 43,210 | 43,210 |
| withdraw | 28,450 | 30,120 | 31,800 |

---

## Running Tests

```bash
# Hardhat
npx hardhat test                     # All tests
npx hardhat test test/Vault.js       # Specific file
npx hardhat test --grep "deposit"    # Match test name

# Foundry
forge test                           # All tests
forge test --match-contract VaultTest # Specific contract
forge test --match-test testDeposit  # Specific test
forge test -vvvv                     # Full execution traces
```

---

## Key Takeaways

- Testing is mandatory for smart contracts — bugs cannot be patched after deployment
- Hardhat tests use JavaScript (Mocha/Chai); Foundry tests use Solidity (faster, native)
- Write unit tests for every function, integration tests for multi-contract flows
- Fuzz testing finds edge cases that manual testing misses
- Track gas usage with reports and snapshots to catch regressions
- Aim for 90%+ coverage on any contract handling user funds

---

[Next: Smart Contract Security](./30-blockchain-contract-security)
