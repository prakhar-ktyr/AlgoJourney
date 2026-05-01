---
title: Bitcoin Wallets & Addresses
---

## What is a Bitcoin Wallet?

A Bitcoin wallet does not actually "store" bitcoins. Instead, it stores the **private keys** that prove ownership of UTXOs on the blockchain. The wallet software manages key generation, address derivation, transaction signing, and balance tracking.

---

## Hot vs Cold Wallets

| Feature | Hot Wallet | Cold Wallet |
|---------|-----------|-------------|
| Internet connection | Always connected | Offline / air-gapped |
| Convenience | High (instant access) | Lower (requires setup) |
| Security | Lower (attack surface) | Higher (isolated) |
| Use case | Daily spending | Long-term storage |
| Examples | Mobile apps, browser extensions | Hardware wallets, paper wallets |

### Hot Wallet Examples

- Mobile: BlueWallet, Muun, Phoenix
- Desktop: Electrum, Sparrow, Bitcoin Core
- Browser: MetaMask (limited BTC), Xverse

### Cold Wallet Examples

- Hardware: Ledger, Trezor, ColdCard, BitBox
- Air-gapped: Seed Signer, Jade (with QR)
- Paper: Printed private key (not recommended)

---

## Custodial vs Non-Custodial

| Aspect | Custodial | Non-Custodial |
|--------|-----------|---------------|
| Key control | Third party holds keys | You hold your keys |
| Recovery | Reset via email/ID | Seed phrase only |
| Risk | Exchange hack, freeze | Lost keys = lost funds |
| Privacy | KYC required | Pseudonymous |
| Motto | "Not your keys, not your coins" | Full sovereignty |

---

## HD Wallets (Hierarchical Deterministic)

Modern wallets use the **HD wallet** standard to derive an unlimited number of key pairs from a single master seed.

### Key BIPs (Bitcoin Improvement Proposals)

| BIP | Name | Purpose |
|-----|------|---------|
| BIP32 | HD Wallets | Defines hierarchical key derivation |
| BIP39 | Mnemonic Codes | Converts entropy into human-readable seed words |
| BIP44 | Multi-Account HD | Defines derivation path structure |

### Derivation Path

```text
m / purpose' / coin_type' / account' / change / address_index

Example (Bitcoin, first receiving address):
m / 44' / 0' / 0' / 0 / 0

Example (Bitcoin, first change address):
m / 44' / 0' / 0' / 1 / 0
```

| Path Segment | Meaning |
|-------------|---------|
| m | Master key (root) |
| 44' | BIP44 purpose |
| 0' | Bitcoin (coin type) |
| 0' | First account |
| 0 | External (receiving) chain |
| 0 | First address index |

---

## Seed Phrases (Mnemonic Recovery)

A seed phrase is a human-readable backup of your wallet's master seed:

```text
12-word example:
abandon ability able about above absent absorb abstract absurd abuse access accident

24-word example:
abandon ability able about above absent absorb abstract absurd abuse access accident
arena arena arena arena arena arena arena arena arena arena arena arena
```

### Important Rules

| Rule | Reason |
|------|--------|
| Never share your seed phrase | Anyone with it controls your funds |
| Store offline only | Digital copies can be hacked |
| Use metal backup | Paper degrades; metal survives fire/water |
| Verify backup immediately | Ensure you can restore before funding |
| Consider passphrase (25th word) | Adds additional security layer |

### How It Works

```text
Entropy (128 or 256 bits)
    ↓
BIP39 wordlist mapping (2048 words)
    ↓
Mnemonic phrase (12 or 24 words)
    ↓
PBKDF2 with optional passphrase
    ↓
512-bit master seed
    ↓
BIP32 key derivation
    ↓
Unlimited addresses
```

---

## Address Types

Bitcoin has evolved through several address formats:

| Type | Prefix | Example Start | BIP | Era |
|------|--------|--------------|-----|-----|
| P2PKH | 1 | 1A1zP1eP5QGefi... | — | 2009 (original) |
| P2SH | 3 | 3J98t1WpEZ73CNm... | BIP16 | 2012 |
| P2WPKH (Bech32) | bc1q | bc1qw508d6qejxtd... | BIP84/141 | 2017 (SegWit) |
| P2TR (Taproot) | bc1p | bc1p5d7rjq7g6rdk... | BIP86/341 | 2021 |

### Which Address Type to Use?

| Address Type | Fees | Privacy | Compatibility |
|-------------|------|---------|---------------|
| P2PKH (1...) | Highest | Lowest | Universal |
| P2SH (3...) | Medium | Medium | Wide |
| P2WPKH (bc1q...) | Low | Good | Most wallets |
| P2TR (bc1p...) | Lowest | Best | Growing support |

**Recommendation**: Use **Bech32 (bc1q)** or **Taproot (bc1p)** addresses for the lowest fees and best privacy.

---

## Hardware Wallets

Hardware wallets are dedicated devices that store private keys in a secure element:

```text
Transaction Signing Flow:
1. Wallet software constructs unsigned transaction
2. Unsigned tx sent to hardware wallet via USB/Bluetooth/QR
3. User verifies details on device screen
4. Hardware wallet signs tx with private key (never leaves device)
5. Signed tx returned to software for broadcast
```

| Feature | Benefit |
|---------|---------|
| Secure element chip | Keys never exposed to computer |
| Physical confirmation | Must press button to sign |
| Screen verification | Verify address/amount on device |
| PIN protection | Brute-force resistant |
| Recovery via seed | Device replaceable; funds recoverable |

---

## Key Takeaways

- Wallets store private keys, not bitcoins — the blockchain holds the actual record
- Hot wallets are convenient but less secure; cold wallets are ideal for long-term storage
- Non-custodial wallets give you full control (and full responsibility) over your funds
- HD wallets (BIP32/39/44) derive unlimited addresses from a single seed phrase
- Your seed phrase IS your wallet — protect it offline and never share it
- Use modern address types (Bech32/Taproot) for lower fees and better privacy
- Hardware wallets provide the best security for significant holdings

---

## Next

[Bitcoin Script →](15-blockchain-bitcoin-script)
