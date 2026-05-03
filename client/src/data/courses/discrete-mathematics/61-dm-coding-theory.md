---
title: Coding Theory
---

# Coding Theory

Coding theory studies how to transmit information reliably over noisy channels. Every time you scan a QR code, stream music, or download a file, error-detecting and error-correcting codes work behind the scenes to ensure data integrity.

## The Problem: Noisy Channels

When data is transmitted (over a wire, wirelessly, or stored on disk), bits can flip:

- Sent: `1011001`
- Received: `1010001` (bit 4 flipped!)

Without coding theory, we'd have no way to detect or fix such errors.

## Error Detection vs Error Correction

| Capability | What it does | Example |
|------------|-------------|---------|
| **Error detection** | Identifies that an error occurred | Parity bit, checksums |
| **Error correction** | Identifies and fixes errors | Hamming codes, Reed-Solomon |

**Trade-off:** More redundancy → more errors correctable, but lower data rate.

## Hamming Distance

The **Hamming distance** between two binary strings of equal length is the number of positions where they differ.

$$d(x, y) = |\{i : x_i \neq y_i\}|$$

### Examples

- $d(1011, 1001) = 1$ (differ at position 2)
- $d(1010, 0101) = 4$ (differ everywhere)
- $d(000, 111) = 3$

### Why Hamming Distance Matters

For a code $C$ (set of valid codewords), the **minimum distance** $d_{\min}$ determines:

- **Error detection:** can detect up to $d_{\min} - 1$ errors.
- **Error correction:** can correct up to $\lfloor (d_{\min} - 1) / 2 \rfloor$ errors.

**Proof intuition:** If valid codewords are far apart (large Hamming distance), a few bit flips won't land you on another valid codeword.

## Parity Check Codes

The simplest error-detecting code: add one parity bit.

### Even Parity

Add a bit so the total number of 1s is even:

| Data | Parity bit | Codeword |
|------|-----------|----------|
| `000` | `0` | `0000` |
| `001` | `1` | `0011` |
| `010` | `1` | `0101` |
| `011` | `0` | `0110` |
| `100` | `1` | `1001` |
| `101` | `0` | `1010` |
| `110` | `0` | `1100` |
| `111` | `1` | `1111` |

### Properties

- Minimum distance: $d_{\min} = 2$
- Detects: 1-bit errors (any odd number of errors)
- Corrects: 0 errors (detects but cannot locate the error)

### Limitation

If 2 bits flip, parity is preserved — the error goes undetected!

## Repetition Codes

The simplest error-correcting code: repeat each bit multiple times.

### Triple Repetition Code

| Data bit | Codeword |
|----------|----------|
| `0` | `000` |
| `1` | `111` |

- Minimum distance: $d_{\min} = 3$
- Corrects: 1-bit errors (majority vote)
- Rate: $1/3$ (very inefficient)

### Decoding by Majority Vote

- Receive `010` → majority is `0` → decoded as `0`
- Receive `110` → majority is `1` → decoded as `1`
- Receive `001` → majority is `0` → decoded as `0`

### General $(2t+1)$-Repetition Code

Repeating each bit $2t+1$ times corrects up to $t$ errors, but the rate is $1/(2t+1)$ — terrible for large $t$.

## Hamming Codes

Richard Hamming (1950) invented the first practical error-correcting codes with much better efficiency than repetition codes.

### The $(7, 4)$ Hamming Code

Encodes 4 data bits into 7 bits (3 parity bits added). Rate: $4/7 \approx 0.57$.

#### Bit Positions

Positions are numbered 1–7. Parity bits occupy positions that are powers of 2:

| Position | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|----------|---|---|---|---|---|---|---|
| Type | $p_1$ | $p_2$ | $d_1$ | $p_3$ | $d_2$ | $d_3$ | $d_4$ |

#### Parity Rules

Each parity bit checks specific positions (determined by binary representation):

- $p_1$ (pos 1): checks positions with bit 0 set in binary: 1, 3, 5, 7
- $p_2$ (pos 2): checks positions with bit 1 set: 2, 3, 6, 7
- $p_3$ (pos 4): checks positions with bit 2 set: 4, 5, 6, 7

Each parity bit is set so the XOR (parity) of its group is 0.

#### Encoding Example

Data: $d_1 d_2 d_3 d_4 = 1011$

Positions: _ _ 1 _ 0 1 1

Calculate parity bits:
- $p_1$: positions 1, 3, 5, 7 → $p_1 \oplus 1 \oplus 0 \oplus 1 = 0$ → $p_1 = 0$
- $p_2$: positions 2, 3, 6, 7 → $p_2 \oplus 1 \oplus 1 \oplus 1 = 0$ → $p_2 = 1$
- $p_3$: positions 4, 5, 6, 7 → $p_3 \oplus 0 \oplus 1 \oplus 1 = 0$ → $p_3 = 0$

Codeword: `0 1 1 0 0 1 1`

#### Properties

- Minimum distance: $d_{\min} = 3$
- Corrects: 1-bit errors
- Detects: 2-bit errors (with additional overall parity bit → SECDED)

## Syndrome Decoding

The **syndrome** tells us which bit (if any) is in error.

### Computing the Syndrome

For received word $r = r_1 r_2 r_3 r_4 r_5 r_6 r_7$:

$$s_1 = r_1 \oplus r_3 \oplus r_5 \oplus r_7$$
$$s_2 = r_2 \oplus r_3 \oplus r_6 \oplus r_7$$
$$s_3 = r_4 \oplus r_5 \oplus r_6 \oplus r_7$$

The syndrome $s = (s_3 s_2 s_1)_2$ gives the position of the error:
- $s = 000$: no error
- $s = 001$: error in position 1
- $s = 010$: error in position 2
- $s = 011$: error in position 3
- ...
- $s = 111$: error in position 7

### Example: Error Correction

Sent: `0110011` → Received: `0110111` (bit 5 flipped)

Syndrome:
- $s_1 = 0 \oplus 1 \oplus 1 \oplus 1 = 1$
- $s_2 = 1 \oplus 1 \oplus 1 \oplus 1 = 0$
- $s_3 = 0 \oplus 1 \oplus 1 \oplus 1 = 1$

$s = (101)_2 = 5$ → flip bit 5: `0110011` ✓

## Linear Codes

Hamming codes are a special case of **linear codes** — codes where any linear combination (XOR) of codewords is also a codeword.

### Generator Matrix $G$

The generator matrix maps data words to codewords:

$$\mathbf{c} = \mathbf{d} \cdot G$$

For the $(7,4)$ Hamming code:

$$G = \begin{pmatrix} 1 & 1 & 0 & 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 1 & 0 & 0 \\ 1 & 1 & 0 & 0 & 0 & 1 & 0 \\ 1 & 0 & 0 & 0 & 0 & 0 & 1 \end{pmatrix}$$

Wait — let's use systematic form. The $(7,4)$ Hamming code in systematic form:

$$G = \begin{pmatrix} 1 & 0 & 0 & 0 & 1 & 1 & 0 \\ 0 & 1 & 0 & 0 & 1 & 0 & 1 \\ 0 & 0 & 1 & 0 & 0 & 1 & 1 \\ 0 & 0 & 0 & 1 & 1 & 1 & 1 \end{pmatrix}$$

Data bits appear directly; parity bits are computed from them.

### Parity-Check Matrix $H$

The parity-check matrix verifies codewords:

$$H \cdot \mathbf{c}^T = \mathbf{0} \quad \text{(for valid codewords)}$$

For the $(7,4)$ Hamming code:

$$H = \begin{pmatrix} 1 & 1 & 0 & 1 & 1 & 0 & 0 \\ 1 & 0 & 1 & 1 & 0 & 1 & 0 \\ 0 & 1 & 1 & 1 & 0 & 0 & 1 \end{pmatrix}$$

The syndrome is $\mathbf{s} = H \cdot \mathbf{r}^T$ where $\mathbf{r}$ is the received word.

### Parameters $[n, k, d]$

A linear code is described by:
- $n$: block length (codeword bits)
- $k$: dimension (data bits)
- $d$: minimum distance

The $(7,4)$ Hamming code is a $[7, 4, 3]$ code.

### Singleton Bound

For any $[n, k, d]$ code:

$$d \leq n - k + 1$$

Codes meeting this bound are called **Maximum Distance Separable (MDS)** codes (e.g., Reed-Solomon codes).

## Applications

### QR Codes

QR codes use **Reed-Solomon** error correction, which can recover data even if up to 30% of the code is damaged. That's why QR codes still scan even when partially obscured.

### CDs and DVDs

Compact discs use two layers of Reed-Solomon codes (**Cross-Interleaved Reed-Solomon Coding, CIRC**) to handle scratches and dust. A 2.4mm scratch can be corrected!

### Internet Packets (TCP/IP)

- **Checksums** detect corrupted packets (IP header checksum, TCP checksum).
- Corrupted packets are retransmitted (ARQ — Automatic Repeat reQuest).
- Some protocols (like UDP with FEC) use forward error correction for real-time streaming.

### Space Communication

NASA's deep-space probes use powerful codes:
- Voyager: convolutional codes
- Mars rovers: turbo codes and LDPC codes
- Achieving near-Shannon-limit performance over billions of kilometers.

### Flash Memory (SSDs)

SSDs use **BCH codes** and **LDPC codes** to handle bit errors that increase as flash cells wear out.

## Code: Implementing Parity Check

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Calculate even parity bit for a data word
int calculateParity(const vector<int>& data) {
    int parity = 0;
    for (int bit : data) {
        parity ^= bit;
    }
    return parity;
}

// Encode with parity bit appended
vector<int> encodeParity(const vector<int>& data) {
    vector<int> encoded = data;
    encoded.push_back(calculateParity(data));
    return encoded;
}

// Check if received word has valid parity (returns true if no error detected)
bool checkParity(const vector<int>& received) {
    int parity = 0;
    for (int bit : received) {
        parity ^= bit;
    }
    return parity == 0;
}

int main() {
    vector<int> data = {1, 0, 1, 1};

    cout << "Data: ";
    for (int b : data) cout << b;
    cout << endl;

    vector<int> encoded = encodeParity(data);
    cout << "Encoded (with parity): ";
    for (int b : encoded) cout << b;
    cout << endl;

    cout << "Valid parity: " << (checkParity(encoded) ? "YES" : "NO") << endl;

    // Introduce single-bit error
    vector<int> corrupted = encoded;
    corrupted[2] ^= 1;
    cout << "\nCorrupted: ";
    for (int b : corrupted) cout << b;
    cout << endl;
    cout << "Valid parity: " << (checkParity(corrupted) ? "YES" : "NO") << endl;

    // Introduce two-bit error (undetectable!)
    vector<int> doubleError = encoded;
    doubleError[0] ^= 1;
    doubleError[1] ^= 1;
    cout << "\nDouble error: ";
    for (int b : doubleError) cout << b;
    cout << endl;
    cout << "Valid parity: " << (checkParity(doubleError) ? "YES" : "NO")
         << " (undetected!)" << endl;

    return 0;
}
```

```java
public class ParityCheck {
    static int calculateParity(int[] data) {
        int parity = 0;
        for (int bit : data) parity ^= bit;
        return parity;
    }

    static int[] encodeParity(int[] data) {
        int[] encoded = new int[data.length + 1];
        System.arraycopy(data, 0, encoded, 0, data.length);
        encoded[data.length] = calculateParity(data);
        return encoded;
    }

    static boolean checkParity(int[] received) {
        int parity = 0;
        for (int bit : received) parity ^= bit;
        return parity == 0;
    }

    static String bitsToString(int[] bits) {
        StringBuilder sb = new StringBuilder();
        for (int b : bits) sb.append(b);
        return sb.toString();
    }

    public static void main(String[] args) {
        int[] data = {1, 0, 1, 1};
        System.out.println("Data: " + bitsToString(data));

        int[] encoded = encodeParity(data);
        System.out.println("Encoded: " + bitsToString(encoded));
        System.out.println("Valid: " + checkParity(encoded));

        // Single-bit error
        int[] corrupted = encoded.clone();
        corrupted[2] ^= 1;
        System.out.println("\nCorrupted: " + bitsToString(corrupted));
        System.out.println("Valid: " + checkParity(corrupted));

        // Double error — undetectable
        int[] doubleErr = encoded.clone();
        doubleErr[0] ^= 1;
        doubleErr[1] ^= 1;
        System.out.println("\nDouble error: " + bitsToString(doubleErr));
        System.out.println("Valid: " + checkParity(doubleErr) + " (undetected!)");
    }
}
```

```python
def calculate_parity(data):
    """Calculate even parity bit"""
    parity = 0
    for bit in data:
        parity ^= bit
    return parity

def encode_parity(data):
    """Append parity bit to data"""
    return data + [calculate_parity(data)]

def check_parity(received):
    """Check if received word has valid (even) parity"""
    parity = 0
    for bit in received:
        parity ^= bit
    return parity == 0

# Demo
data = [1, 0, 1, 1]
print(f"Data:    {''.join(map(str, data))}")

encoded = encode_parity(data)
print(f"Encoded: {''.join(map(str, encoded))}")
print(f"Valid:   {check_parity(encoded)}")

# Single-bit error
corrupted = encoded.copy()
corrupted[2] ^= 1
print(f"\nCorrupted: {''.join(map(str, corrupted))}")
print(f"Valid:     {check_parity(corrupted)}")  # False — detected!

# Double-bit error
double_err = encoded.copy()
double_err[0] ^= 1
double_err[1] ^= 1
print(f"\nDouble error: {''.join(map(str, double_err))}")
print(f"Valid:        {check_parity(double_err)} (undetected!)")
```

```javascript
function calculateParity(data) {
    return data.reduce((p, bit) => p ^ bit, 0);
}

function encodeParity(data) {
    return [...data, calculateParity(data)];
}

function checkParity(received) {
    return received.reduce((p, bit) => p ^ bit, 0) === 0;
}

// Demo
const data = [1, 0, 1, 1];
console.log(`Data:    ${data.join("")}`);

const encoded = encodeParity(data);
console.log(`Encoded: ${encoded.join("")}`);
console.log(`Valid:   ${checkParity(encoded)}`);

// Single-bit error
const corrupted = [...encoded];
corrupted[2] ^= 1;
console.log(`\nCorrupted: ${corrupted.join("")}`);
console.log(`Valid:     ${checkParity(corrupted)}`);

// Double error
const doubleErr = [...encoded];
doubleErr[0] ^= 1;
doubleErr[1] ^= 1;
console.log(`\nDouble error: ${doubleErr.join("")}`);
console.log(`Valid:        ${checkParity(doubleErr)} (undetected!)`);
```

```csharp
using System;

class ParityCheckDemo {
    static int CalculateParity(int[] data) {
        int parity = 0;
        foreach (int bit in data) parity ^= bit;
        return parity;
    }

    static int[] EncodeParity(int[] data) {
        int[] encoded = new int[data.Length + 1];
        Array.Copy(data, encoded, data.Length);
        encoded[data.Length] = CalculateParity(data);
        return encoded;
    }

    static bool CheckParity(int[] received) {
        int parity = 0;
        foreach (int bit in received) parity ^= bit;
        return parity == 0;
    }

    static void Main() {
        int[] data = { 1, 0, 1, 1 };
        Console.WriteLine($"Data:    {string.Join("", data)}");

        int[] encoded = EncodeParity(data);
        Console.WriteLine($"Encoded: {string.Join("", encoded)}");
        Console.WriteLine($"Valid:   {CheckParity(encoded)}");

        int[] corrupted = (int[])encoded.Clone();
        corrupted[2] ^= 1;
        Console.WriteLine($"\nCorrupted: {string.Join("", corrupted)}");
        Console.WriteLine($"Valid:     {CheckParity(corrupted)}");

        int[] doubleErr = (int[])encoded.Clone();
        doubleErr[0] ^= 1;
        doubleErr[1] ^= 1;
        Console.WriteLine($"\nDouble error: {string.Join("", doubleErr)}");
        Console.WriteLine($"Valid:        {CheckParity(doubleErr)} (undetected!)");
    }
}
```

## Code: Hamming (7,4) Encode and Decode

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<int> hammingEncode(vector<int> data) {
    // data: 4 bits [d1, d2, d3, d4]
    // output: 7 bits [p1, p2, d1, p3, d2, d3, d4]
    int d1 = data[0], d2 = data[1], d3 = data[2], d4 = data[3];

    int p1 = d1 ^ d2 ^ d4;   // positions 1,3,5,7
    int p2 = d1 ^ d3 ^ d4;   // positions 2,3,6,7
    int p3 = d2 ^ d3 ^ d4;   // positions 4,5,6,7

    return {p1, p2, d1, p3, d2, d3, d4};
}

pair<vector<int>, int> hammingDecode(vector<int> received) {
    // Compute syndrome
    int s1 = received[0] ^ received[2] ^ received[4] ^ received[6];
    int s2 = received[1] ^ received[2] ^ received[5] ^ received[6];
    int s3 = received[3] ^ received[4] ^ received[5] ^ received[6];

    int errorPos = s1 * 1 + s2 * 2 + s3 * 4; // 0 = no error

    vector<int> corrected = received;
    if (errorPos > 0) {
        corrected[errorPos - 1] ^= 1; // fix the error
    }

    // Extract data bits (positions 3, 5, 6, 7 → indices 2, 4, 5, 6)
    vector<int> data = {corrected[2], corrected[4], corrected[5], corrected[6]};
    return {data, errorPos};
}

int main() {
    vector<int> data = {1, 0, 1, 1};
    cout << "Original data: ";
    for (int b : data) cout << b;
    cout << endl;

    vector<int> encoded = hammingEncode(data);
    cout << "Encoded (7 bits): ";
    for (int b : encoded) cout << b;
    cout << endl;

    // Introduce error at position 5
    vector<int> received = encoded;
    received[4] ^= 1;
    cout << "Received (error at pos 5): ";
    for (int b : received) cout << b;
    cout << endl;

    auto [decoded, errPos] = hammingDecode(received);
    cout << "Syndrome points to position: " << errPos << endl;
    cout << "Decoded data: ";
    for (int b : decoded) cout << b;
    cout << endl;
    cout << "Match original: " << (decoded == data ? "YES" : "NO") << endl;

    return 0;
}
```

```java
import java.util.Arrays;

public class HammingCode {
    static int[] hammingEncode(int[] data) {
        int d1 = data[0], d2 = data[1], d3 = data[2], d4 = data[3];
        int p1 = d1 ^ d2 ^ d4;
        int p2 = d1 ^ d3 ^ d4;
        int p3 = d2 ^ d3 ^ d4;
        return new int[]{p1, p2, d1, p3, d2, d3, d4};
    }

    static int[] hammingDecode(int[] received) {
        int s1 = received[0] ^ received[2] ^ received[4] ^ received[6];
        int s2 = received[1] ^ received[2] ^ received[5] ^ received[6];
        int s3 = received[3] ^ received[4] ^ received[5] ^ received[6];
        int errorPos = s1 + s2 * 2 + s3 * 4;

        int[] corrected = received.clone();
        if (errorPos > 0) {
            corrected[errorPos - 1] ^= 1;
        }

        return new int[]{corrected[2], corrected[4], corrected[5], corrected[6]};
    }

    public static void main(String[] args) {
        int[] data = {1, 0, 1, 1};
        System.out.println("Data:    " + Arrays.toString(data));

        int[] encoded = hammingEncode(data);
        System.out.println("Encoded: " + Arrays.toString(encoded));

        // Introduce error at position 3
        int[] received = encoded.clone();
        received[2] ^= 1;
        System.out.println("Received (error pos 3): " + Arrays.toString(received));

        int[] decoded = hammingDecode(received);
        System.out.println("Decoded: " + Arrays.toString(decoded));
        System.out.println("Correct: " + Arrays.equals(decoded, data));
    }
}
```

```python
def hamming_encode(data):
    """Encode 4 data bits into 7-bit Hamming code.
    Input: [d1, d2, d3, d4]
    Output: [p1, p2, d1, p3, d2, d3, d4]
    """
    d1, d2, d3, d4 = data
    p1 = d1 ^ d2 ^ d4   # covers positions 1,3,5,7
    p2 = d1 ^ d3 ^ d4   # covers positions 2,3,6,7
    p3 = d2 ^ d3 ^ d4   # covers positions 4,5,6,7
    return [p1, p2, d1, p3, d2, d3, d4]

def hamming_decode(received):
    """Decode 7-bit Hamming code, correcting single-bit errors.
    Returns (data_bits, error_position) where error_position=0 means no error.
    """
    r = received[:]
    s1 = r[0] ^ r[2] ^ r[4] ^ r[6]
    s2 = r[1] ^ r[2] ^ r[5] ^ r[6]
    s3 = r[3] ^ r[4] ^ r[5] ^ r[6]

    error_pos = s1 * 1 + s2 * 2 + s3 * 4

    if error_pos > 0:
        r[error_pos - 1] ^= 1  # correct the error

    # Extract data bits from positions 3, 5, 6, 7
    data = [r[2], r[4], r[5], r[6]]
    return data, error_pos

# Demo
data = [1, 0, 1, 1]
print(f"Original data: {''.join(map(str, data))}")

encoded = hamming_encode(data)
print(f"Encoded (7 bits): {''.join(map(str, encoded))}")

# Simulate single-bit error at each position
for err_pos in range(7):
    received = encoded[:]
    received[err_pos] ^= 1
    decoded, detected_pos = hamming_decode(received)
    status = "✓" if decoded == data else "✗"
    print(f"  Error at pos {err_pos+1}: received={''.join(map(str, received))} "
          f"→ syndrome={detected_pos} → decoded={''.join(map(str, decoded))} {status}")
```

```javascript
function hammingEncode(data) {
    const [d1, d2, d3, d4] = data;
    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p3 = d2 ^ d3 ^ d4;
    return [p1, p2, d1, p3, d2, d3, d4];
}

function hammingDecode(received) {
    const r = [...received];
    const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
    const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
    const s3 = r[3] ^ r[4] ^ r[5] ^ r[6];
    const errorPos = s1 + s2 * 2 + s3 * 4;

    if (errorPos > 0) {
        r[errorPos - 1] ^= 1;
    }

    const data = [r[2], r[4], r[5], r[6]];
    return { data, errorPos };
}

// Demo
const data = [1, 0, 1, 1];
console.log(`Original data: ${data.join("")}`);

const encoded = hammingEncode(data);
console.log(`Encoded: ${encoded.join("")}`);

// Test error correction at every position
for (let pos = 0; pos < 7; pos++) {
    const received = [...encoded];
    received[pos] ^= 1;
    const { data: decoded, errorPos } = hammingDecode(received);
    const correct = decoded.join("") === data.join("");
    console.log(`  Error at pos ${pos + 1}: ` +
                `received=${received.join("")} → ` +
                `syndrome=${errorPos} → ` +
                `decoded=${decoded.join("")} ${correct ? "✓" : "✗"}`);
}
```

```csharp
using System;

class HammingCodeDemo {
    static int[] HammingEncode(int[] data) {
        int d1 = data[0], d2 = data[1], d3 = data[2], d4 = data[3];
        int p1 = d1 ^ d2 ^ d4;
        int p2 = d1 ^ d3 ^ d4;
        int p3 = d2 ^ d3 ^ d4;
        return new int[] { p1, p2, d1, p3, d2, d3, d4 };
    }

    static (int[] data, int errorPos) HammingDecode(int[] received) {
        int[] r = (int[])received.Clone();
        int s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
        int s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
        int s3 = r[3] ^ r[4] ^ r[5] ^ r[6];
        int errorPos = s1 + s2 * 2 + s3 * 4;

        if (errorPos > 0) r[errorPos - 1] ^= 1;

        int[] data = { r[2], r[4], r[5], r[6] };
        return (data, errorPos);
    }

    static string BitsToString(int[] bits) => string.Join("", bits);

    static void Main() {
        int[] data = { 1, 0, 1, 1 };
        Console.WriteLine($"Data:    {BitsToString(data)}");

        int[] encoded = HammingEncode(data);
        Console.WriteLine($"Encoded: {BitsToString(encoded)}");

        // Test all single-bit error positions
        for (int pos = 0; pos < 7; pos++) {
            int[] received = (int[])encoded.Clone();
            received[pos] ^= 1;
            var (decoded, errPos) = HammingDecode(received);
            bool correct = BitsToString(decoded) == BitsToString(data);
            Console.WriteLine($"  Error pos {pos + 1}: " +
                $"received={BitsToString(received)} → " +
                $"syndrome={errPos} → " +
                $"decoded={BitsToString(decoded)} {(correct ? "✓" : "✗")}");
        }
    }
}
```

## Comparing Code Parameters

| Code | $[n, k, d]$ | Rate $k/n$ | Corrects | Detects |
|------|-------------|------------|----------|---------|
| Parity | $[n+1, n, 2]$ | $n/(n+1)$ | 0 | 1 |
| Triple repetition | $[3, 1, 3]$ | $1/3$ | 1 | 2 |
| Hamming $(7,4)$ | $[7, 4, 3]$ | $4/7$ | 1 | 2 |
| Hamming $(15,11)$ | $[15, 11, 3]$ | $11/15$ | 1 | 2 |
| Golay | $[23, 12, 7]$ | $12/23$ | 3 | 6 |

Hamming codes are optimal single-error-correcting codes: they achieve the **Hamming bound** (sphere-packing bound) with equality.

## The Hamming Bound

For a binary code of length $n$ correcting $t$ errors:

$$|C| \leq \frac{2^n}{\sum_{i=0}^{t} \binom{n}{i}}$$

Codes meeting this bound are called **perfect codes**. The Hamming codes and the Golay code are perfect.

## Shannon's Channel Coding Theorem

Claude Shannon (1948) proved that for any noisy channel, there exists a rate $C$ (channel capacity) such that:
- For any rate $R < C$, there exist codes achieving arbitrarily low error probability.
- For $R > C$, reliable communication is impossible.

This landmark result guarantees that error-free communication is theoretically possible — coding theory's job is to find practical codes approaching this limit.

## Key Takeaways

- **Error detection** finds errors; **error correction** also fixes them. The Hamming distance between codewords determines capability.
- **Parity codes** detect single errors ($d_{\min} = 2$) with minimal overhead but cannot correct.
- **Hamming codes** correct single errors with high efficiency: the $(7,4)$ code adds only 3 redundant bits to 4 data bits.
- **Syndrome decoding** pinpoints the error position by checking parity equations — the syndrome's binary value gives the error location directly.
- **Linear codes** are described by generator matrices $G$ (encoding) and parity-check matrices $H$ (error detection/correction).
- Real-world applications span QR codes, CDs/DVDs, internet protocols, satellite communications, and flash memory.
- **Shannon's theorem** guarantees reliable communication is possible at rates below channel capacity — modern LDPC and turbo codes approach this theoretical limit.
