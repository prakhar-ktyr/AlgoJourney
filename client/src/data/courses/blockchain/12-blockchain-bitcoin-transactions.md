---
title: Bitcoin Transactions
---

## Introduction

A Bitcoin transaction is a signed data structure that transfers value from one or more inputs to one or more outputs. Unlike traditional bank transfers, Bitcoin uses the **UTXO (Unspent Transaction Output)** model rather than account balances.

---

## The UTXO Model

In Bitcoin, there are no "accounts" or "balances" in the traditional sense. Instead, the system tracks **unspent transaction outputs** (UTXOs).

Think of UTXOs like physical cash:

```text
Traditional Bank:  Account A has balance $500
Bitcoin (UTXO):    Address A owns: UTXO1 ($200) + UTXO2 ($150) + UTXO3 ($150)
```

### Key UTXO Rules

| Rule | Description |
|------|-------------|
| A UTXO can only be spent once | Prevents double-spending |
| An entire UTXO must be consumed | You cannot partially spend a UTXO |
| Change is returned as a new UTXO | Similar to getting change from a $20 bill |
| UTXOs are locked by scripts | Only the owner can unlock and spend them |

---

## Transaction Structure

A Bitcoin transaction consists of these components:

```json
{
  "version": 2,
  "inputs": [
    {
      "txid": "abc123...previous_tx_hash",
      "vout": 0,
      "scriptSig": "signature + public_key",
      "sequence": 4294967295
    }
  ],
  "outputs": [
    {
      "value": 0.05000000,
      "scriptPubKey": "OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG"
    },
    {
      "value": 0.04990000,
      "scriptPubKey": "OP_DUP OP_HASH160 <changePubKeyHash> OP_EQUALVERIFY OP_CHECKSIG"
    }
  ],
  "locktime": 0
}
```

### Inputs

| Field | Purpose |
|-------|---------|
| txid | Hash of the previous transaction containing the UTXO |
| vout | Index of the specific output being spent |
| scriptSig | Unlocking script (proof of ownership) |
| sequence | Used for RBF (Replace-By-Fee) and timelocks |

### Outputs

| Field | Purpose |
|-------|---------|
| value | Amount of BTC being sent (in satoshis) |
| scriptPubKey | Locking script (conditions to spend this output) |

---

## Transaction Lifecycle

```text
1. Creation     → Wallet builds and signs the transaction
2. Broadcast    → Transaction sent to connected peers
3. Mempool      → Unconfirmed tx waits in nodes' memory pools
4. Inclusion    → Miner includes tx in a candidate block
5. Confirmation → Block is mined and added to the blockchain
6. Deep Confirm → Additional blocks mined on top (more security)
```

---

## Fees and the Fee Market

Bitcoin transactions require fees to incentivize miners. Fees are calculated as:

```text
Fee = Sum(Inputs) - Sum(Outputs)
```

The fee is implicitly defined — it is the difference between what you spend and what you explicitly assign to outputs. There is no "fee" field.

### Fee Estimation

| Priority | Target Confirmation | Typical Fee Rate |
|----------|-------------------|-----------------|
| High | Next block (~10 min) | 50+ sat/vB |
| Medium | Within 3 blocks (~30 min) | 20-50 sat/vB |
| Low | Within 6+ blocks (~1 hour) | 5-20 sat/vB |
| Economy | Eventually | 1-5 sat/vB |

Fee rates are measured in **satoshis per virtual byte (sat/vB)**.

---

## The Mempool

The mempool (memory pool) is where unconfirmed transactions wait:

- Each full node maintains its own mempool
- Miners select transactions from the mempool based on fee rate (highest first)
- Mempool size fluctuates with network demand
- Transactions may be dropped if the mempool is full and their fee is too low
- Default mempool size limit is 300 MB

---

## Confirmations

| Confirmations | Security Level | Use Case |
|---------------|---------------|----------|
| 0 (unconfirmed) | Very low | Small, trusted payments |
| 1 | Low | Small purchases |
| 3 | Medium | Standard transactions |
| 6 | High | Large amounts (industry standard) |
| 60+ | Very high | Exchange deposits |

Each confirmation means another block has been mined on top of the block containing your transaction, making reversal exponentially harder.

---

## Change Addresses

When you spend a UTXO, you must consume it entirely. Any leftover value is sent back to yourself as **change**:

```text
Example:
  You own a UTXO worth 1.0 BTC
  You want to send 0.3 BTC to Alice

  Input:   1.0 BTC (your UTXO)
  Output1: 0.3 BTC → Alice's address
  Output2: 0.6999 BTC → Your change address
  Fee:     0.0001 BTC (implicit)
```

Modern wallets generate a **new change address** for each transaction to improve privacy. This is handled automatically by HD wallets.

---

## Transaction Types

| Type | Description |
|------|-------------|
| P2PKH | Pay to Public Key Hash (legacy, starts with 1) |
| P2SH | Pay to Script Hash (starts with 3) |
| P2WPKH | Pay to Witness Public Key Hash (SegWit, starts with bc1q) |
| P2TR | Pay to Taproot (starts with bc1p) |

---

## Key Takeaways

- Bitcoin uses the UTXO model, not account balances — think of UTXOs as individual "coins"
- Transactions consume entire UTXOs as inputs and create new UTXOs as outputs
- Fees are implicit (inputs minus outputs) and create a competitive fee market
- Unconfirmed transactions sit in the mempool until a miner includes them in a block
- 6 confirmations is the industry standard for high-value transactions
- Change addresses are automatically created to return unspent value to the sender

---

## Next

[Bitcoin Mining →](13-blockchain-bitcoin-mining)
