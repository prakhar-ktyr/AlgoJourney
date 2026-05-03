---
title: Number Bases & Representation
---

# Number Bases & Representation

## Introduction

Every number you write uses a **positional number system** — the value of a digit depends on its position. We typically use base 10 (decimal), but computers use base 2 (binary), and programmers frequently work with base 8 (octal) and base 16 (hexadecimal).

Understanding number bases is fundamental to computer science, digital logic, networking, and low-level programming.

---

## Positional Number Systems

In a base-$b$ (or radix-$b$) system, a number is represented as a sequence of digits $d_n d_{n-1} \ldots d_1 d_0$, where each digit satisfies $0 \leq d_i < b$. The value is:

$$\text{value} = \sum_{i=0}^{n} d_i \cdot b^i = d_n \cdot b^n + d_{n-1} \cdot b^{n-1} + \cdots + d_1 \cdot b + d_0$$

### Example in Base 10

The number $347_{10}$:

$$3 \cdot 10^2 + 4 \cdot 10^1 + 7 \cdot 10^0 = 300 + 40 + 7 = 347$$

### Example in Base 2

The number $1011_2$:

$$1 \cdot 2^3 + 0 \cdot 2^2 + 1 \cdot 2^1 + 1 \cdot 2^0 = 8 + 0 + 2 + 1 = 11_{10}$$

---

## Common Number Bases

| Base | Name | Digits Used | Common Use |
|------|------|-------------|------------|
| 2 | Binary | 0, 1 | Computers, digital logic |
| 8 | Octal | 0–7 | Unix file permissions |
| 10 | Decimal | 0–9 | Everyday life |
| 16 | Hexadecimal | 0–9, A–F | Memory addresses, colors |

---

## Binary (Base 2)

Binary is the language of computers. Every piece of data — numbers, text, images — is ultimately stored as sequences of 0s and 1s (bits).

### Powers of 2

| $2^0$ | $2^1$ | $2^2$ | $2^3$ | $2^4$ | $2^5$ | $2^6$ | $2^7$ | $2^8$ | $2^9$ | $2^{10}$ |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|----------|
| 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 |

### Counting in Binary

| Decimal | Binary | Decimal | Binary |
|---------|--------|---------|--------|
| 0 | 0000 | 8 | 1000 |
| 1 | 0001 | 9 | 1001 |
| 2 | 0010 | 10 | 1010 |
| 3 | 0011 | 11 | 1011 |
| 4 | 0100 | 12 | 1100 |
| 5 | 0101 | 13 | 1101 |
| 6 | 0110 | 14 | 1110 |
| 7 | 0111 | 15 | 1111 |

### Why Binary?

Electronic circuits have two stable states: high voltage (1) and low voltage (0). This makes binary the natural choice for digital hardware.

---

## Octal (Base 8)

Octal uses digits 0–7. Each octal digit corresponds to exactly **3 binary digits**:

| Octal | Binary | Octal | Binary |
|-------|--------|-------|--------|
| 0 | 000 | 4 | 100 |
| 1 | 001 | 5 | 101 |
| 2 | 010 | 6 | 110 |
| 3 | 011 | 7 | 111 |

**Example:** $752_8 = 111\;101\;010_2 = 490_{10}$

Octal is commonly seen in Unix/Linux file permissions: `chmod 755` means owner=rwx (7), group=r-x (5), others=r-x (5).

---

## Hexadecimal (Base 16)

Hexadecimal (hex) uses digits 0–9 and letters A–F (representing 10–15). Each hex digit corresponds to exactly **4 binary digits**:

| Hex | Decimal | Binary | Hex | Decimal | Binary |
|-----|---------|--------|-----|---------|--------|
| 0 | 0 | 0000 | 8 | 8 | 1000 |
| 1 | 1 | 0001 | 9 | 9 | 1001 |
| 2 | 2 | 0010 | A | 10 | 1010 |
| 3 | 3 | 0011 | B | 11 | 1011 |
| 4 | 4 | 0100 | C | 12 | 1100 |
| 5 | 5 | 0101 | D | 13 | 1101 |
| 6 | 6 | 0110 | E | 14 | 1110 |
| 7 | 7 | 0111 | F | 15 | 1111 |

**Example:** $\text{2F}_{16} = 0010\;1111_2 = 47_{10}$

Hex is used for memory addresses (`0x7FFF`), CSS colors (`#FF5733`), and MAC addresses (`AA:BB:CC:DD:EE:FF`).

---

## Converting Between Bases

### Any Base to Decimal (Expansion Method)

Multiply each digit by its positional weight and sum:

$$1101_2 = 1 \cdot 8 + 1 \cdot 4 + 0 \cdot 2 + 1 \cdot 1 = 13_{10}$$

$$\text{A3}_{16} = 10 \cdot 16 + 3 \cdot 1 = 163_{10}$$

### Decimal to Any Base (Division-Remainder Method)

Repeatedly divide by the target base and collect remainders (read bottom to top):

**Convert $156_{10}$ to binary:**

| Division | Quotient | Remainder |
|----------|----------|-----------|
| $156 \div 2$ | 78 | 0 |
| $78 \div 2$ | 39 | 0 |
| $39 \div 2$ | 19 | 1 |
| $19 \div 2$ | 9 | 1 |
| $9 \div 2$ | 4 | 1 |
| $4 \div 2$ | 2 | 0 |
| $2 \div 2$ | 1 | 0 |
| $1 \div 2$ | 0 | 1 |

Reading remainders bottom-to-top: $156_{10} = 10011100_2$

**Convert $255_{10}$ to hexadecimal:**

| Division | Quotient | Remainder |
|----------|----------|-----------|
| $255 \div 16$ | 15 | 15 (F) |
| $15 \div 16$ | 0 | 15 (F) |

Result: $255_{10} = \text{FF}_{16}$

### Binary ↔ Hex (Shortcut)

Group binary digits in fours (from right) and convert each group:

$$10110111_2 = 1011\;0111 = \text{B7}_{16}$$

### Binary ↔ Octal (Shortcut)

Group binary digits in threes (from right):

$$10110111_2 = 10\;110\;111 = 267_8$$

---

## Binary Arithmetic

### Binary Addition

Rules: $0+0=0$, $0+1=1$, $1+0=1$, $1+1=10$ (0 carry 1)

```
    1 0 1 1   (11)
  + 0 1 1 0   ( 6)
  ---------
  1 0 0 0 1   (17)
```

Carry propagation works just like decimal addition.

### Binary Subtraction

Rules: $0-0=0$, $1-0=1$, $1-1=0$, $0-1=1$ (borrow 1 from next position)

```
    1 1 0 1   (13)
  - 0 1 1 0   ( 6)
  ---------
    0 1 1 1   ( 7)
```

### Binary Multiplication

Same algorithm as decimal — shift and add:

```
      1 0 1 1   (11)
    ×   1 1 0   ( 6)
    ---------
      0 0 0 0   (1011 × 0)
    1 0 1 1 0   (1011 × 1, shifted)
  1 0 1 1 0 0   (1011 × 1, shifted twice)
  -----------
  1 0 0 0 0 1 0 (66)
```

---

## Two's Complement

**Two's complement** is the standard way computers represent negative integers.

### How It Works (for $n$-bit numbers)

1. Positive numbers are stored as normal binary.
2. To negate a number: **invert all bits** and **add 1**.
3. The most significant bit (MSB) is the **sign bit**: 0 = positive, 1 = negative.

### Example: Represent $-5$ in 8-bit Two's Complement

1. Start with $+5$: `00000101`
2. Invert all bits: `11111010`
3. Add 1: `11111011`

So $-5$ in 8-bit two's complement is `11111011`.

### Range of $n$-bit Two's Complement

$$-2^{n-1} \leq x \leq 2^{n-1} - 1$$

| Bits | Minimum | Maximum |
|------|---------|---------|
| 8 | $-128$ | $127$ |
| 16 | $-32{,}768$ | $32{,}767$ |
| 32 | $-2{,}147{,}483{,}648$ | $2{,}147{,}483{,}647$ |

### Why Two's Complement?

- Addition of positive and negative numbers uses the **same circuit** — no special subtraction hardware needed.
- There's only **one representation of zero** (unlike sign-magnitude which has +0 and -0).
- Overflow detection is simple.

### Two's Complement Addition Example

Compute $5 + (-3)$ in 8 bits:

```
  0 0 0 0 0 1 0 1   (+5)
+ 1 1 1 1 1 1 0 1   (-3)
-------------------
  0 0 0 0 0 0 1 0   (+2)  ✓
```

The carry out of the MSB is discarded, and we get the correct answer.

---

## Representation in Computers

### Integer Types

| Type | Bits | Range (signed) |
|------|------|----------------|
| `byte` / `int8` | 8 | $-128$ to $127$ |
| `short` / `int16` | 16 | $-32{,}768$ to $32{,}767$ |
| `int` / `int32` | 32 | $\approx \pm 2.1 \times 10^9$ |
| `long` / `int64` | 64 | $\approx \pm 9.2 \times 10^{18}$ |

Unsigned variants use the sign bit as an extra data bit, doubling the positive range.

### Floating-Point (IEEE 754 — Brief Overview)

Real numbers are approximated using **floating-point** representation:

$$\text{value} = (-1)^s \times m \times 2^e$$

where $s$ is the sign bit, $m$ is the mantissa (significand), and $e$ is the exponent.

| Type | Bits | Precision | Range |
|------|------|-----------|-------|
| `float` | 32 | ~7 decimal digits | $\approx \pm 3.4 \times 10^{38}$ |
| `double` | 64 | ~15 decimal digits | $\approx \pm 1.8 \times 10^{308}$ |

**Key insight:** Floating-point cannot represent all real numbers exactly. For instance, $0.1_{10}$ has an infinite binary representation, leading to well-known precision issues.

---

## Code: Base Conversion

### Convert Any Base to Decimal

```cpp
#include <iostream>
#include <string>
#include <cmath>
#include <algorithm>
using namespace std;

int charToValue(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    return -1;
}

long long toDecimal(const string& number, int base) {
    long long result = 0;
    long long power = 1;
    for (int i = number.size() - 1; i >= 0; i--) {
        int digit = charToValue(number[i]);
        if (digit < 0 || digit >= base) return -1; // Invalid
        result += digit * power;
        power *= base;
    }
    return result;
}

string fromDecimal(long long number, int base) {
    if (number == 0) return "0";
    string result;
    const char digits[] = "0123456789ABCDEF";
    while (number > 0) {
        result += digits[number % base];
        number /= base;
    }
    reverse(result.begin(), result.end());
    return result;
}

string convertBase(const string& number, int fromBase, int toBase) {
    long long decimal = toDecimal(number, fromBase);
    if (decimal < 0) return "INVALID";
    return fromDecimal(decimal, toBase);
}

int main() {
    cout << "Binary 1101 to decimal: " << toDecimal("1101", 2) << endl;
    cout << "Decimal 255 to hex: " << fromDecimal(255, 16) << endl;
    cout << "Hex FF to binary: " << convertBase("FF", 16, 2) << endl;
    cout << "Octal 77 to decimal: " << toDecimal("77", 8) << endl;
    return 0;
}
```

```csharp
using System;
using System.Text;

class BaseConverter
{
    static int CharToValue(char c)
    {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        return -1;
    }

    static long ToDecimal(string number, int fromBase)
    {
        long result = 0;
        long power = 1;
        for (int i = number.Length - 1; i >= 0; i--)
        {
            int digit = CharToValue(number[i]);
            if (digit < 0 || digit >= fromBase) return -1;
            result += digit * power;
            power *= fromBase;
        }
        return result;
    }

    static string FromDecimal(long number, int toBase)
    {
        if (number == 0) return "0";
        const string digits = "0123456789ABCDEF";
        var sb = new StringBuilder();
        while (number > 0)
        {
            sb.Insert(0, digits[(int)(number % toBase)]);
            number /= toBase;
        }
        return sb.ToString();
    }

    static string ConvertBase(string number, int fromBase, int toBase)
    {
        long dec = ToDecimal(number, fromBase);
        if (dec < 0) return "INVALID";
        return FromDecimal(dec, toBase);
    }

    static void Main()
    {
        Console.WriteLine($"Binary 1101 to decimal: {ToDecimal("1101", 2)}");
        Console.WriteLine($"Decimal 255 to hex: {FromDecimal(255, 16)}");
        Console.WriteLine($"Hex FF to binary: {ConvertBase("FF", 16, 2)}");
        Console.WriteLine($"Octal 77 to decimal: {ToDecimal("77", 8)}");
    }
}
```

```java
public class BaseConverter {

    static int charToValue(char c) {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        return -1;
    }

    static long toDecimal(String number, int base) {
        long result = 0;
        long power = 1;
        for (int i = number.length() - 1; i >= 0; i--) {
            int digit = charToValue(number.charAt(i));
            if (digit < 0 || digit >= base) return -1;
            result += digit * power;
            power *= base;
        }
        return result;
    }

    static String fromDecimal(long number, int base) {
        if (number == 0) return "0";
        String digits = "0123456789ABCDEF";
        StringBuilder sb = new StringBuilder();
        while (number > 0) {
            sb.insert(0, digits.charAt((int)(number % base)));
            number /= base;
        }
        return sb.toString();
    }

    static String convertBase(String number, int fromBase, int toBase) {
        long dec = toDecimal(number, fromBase);
        if (dec < 0) return "INVALID";
        return fromDecimal(dec, toBase);
    }

    public static void main(String[] args) {
        System.out.println("Binary 1101 to decimal: " + toDecimal("1101", 2));
        System.out.println("Decimal 255 to hex: " + fromDecimal(255, 16));
        System.out.println("Hex FF to binary: " + convertBase("FF", 16, 2));
        System.out.println("Octal 77 to decimal: " + toDecimal("77", 8));
    }
}
```

```python
def char_to_value(c):
    """Convert a character to its numeric value"""
    if '0' <= c <= '9':
        return ord(c) - ord('0')
    if 'A' <= c <= 'F':
        return ord(c) - ord('A') + 10
    if 'a' <= c <= 'f':
        return ord(c) - ord('a') + 10
    return -1

def to_decimal(number, base):
    """Convert a number string from given base to decimal"""
    result = 0
    power = 1
    for c in reversed(number):
        digit = char_to_value(c)
        if digit < 0 or digit >= base:
            return -1
        result += digit * power
        power *= base
    return result

def from_decimal(number, base):
    """Convert a decimal integer to given base string"""
    if number == 0:
        return "0"
    digits = "0123456789ABCDEF"
    result = []
    while number > 0:
        result.append(digits[number % base])
        number //= base
    return "".join(reversed(result))

def convert_base(number, from_base, to_base):
    """Convert number string from one base to another"""
    dec = to_decimal(number, from_base)
    if dec < 0:
        return "INVALID"
    return from_decimal(dec, to_base)

# Examples
print(f"Binary 1101 to decimal: {to_decimal('1101', 2)}")
print(f"Decimal 255 to hex: {from_decimal(255, 16)}")
print(f"Hex FF to binary: {convert_base('FF', 16, 2)}")
print(f"Octal 77 to decimal: {to_decimal('77', 8)}")

# Python also has built-in functions:
print(f"\nUsing built-ins:")
print(f"  bin(13) = {bin(13)}")
print(f"  oct(63) = {oct(63)}")
print(f"  hex(255) = {hex(255)}")
print(f"  int('FF', 16) = {int('FF', 16)}")
```

```javascript
function charToValue(c) {
  if (c >= "0" && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0);
  if (c >= "A" && c <= "F") return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
  if (c >= "a" && c <= "f") return c.charCodeAt(0) - "a".charCodeAt(0) + 10;
  return -1;
}

function toDecimal(number, base) {
  let result = 0;
  let power = 1;
  for (let i = number.length - 1; i >= 0; i--) {
    const digit = charToValue(number[i]);
    if (digit < 0 || digit >= base) return -1;
    result += digit * power;
    power *= base;
  }
  return result;
}

function fromDecimal(number, base) {
  if (number === 0) return "0";
  const digits = "0123456789ABCDEF";
  let result = "";
  while (number > 0) {
    result = digits[number % base] + result;
    number = Math.floor(number / base);
  }
  return result;
}

function convertBase(number, fromBase, toBase) {
  const dec = toDecimal(number, fromBase);
  if (dec < 0) return "INVALID";
  return fromDecimal(dec, toBase);
}

// Examples
console.log(`Binary 1101 to decimal: ${toDecimal("1101", 2)}`);
console.log(`Decimal 255 to hex: ${fromDecimal(255, 16)}`);
console.log(`Hex FF to binary: ${convertBase("FF", 16, 2)}`);
console.log(`Octal 77 to decimal: ${toDecimal("77", 8)}`);

// JavaScript also has built-in methods:
console.log(`\nUsing built-ins:`);
console.log(`  (13).toString(2) = ${(13).toString(2)}`);
console.log(`  (63).toString(8) = ${(63).toString(8)}`);
console.log(`  (255).toString(16) = ${(255).toString(16)}`);
console.log(`  parseInt("FF", 16) = ${parseInt("FF", 16)}`);
```

---

## Two's Complement Implementation

```cpp
#include <iostream>
#include <string>
#include <bitset>
using namespace std;

int main() {
    int8_t num = 5;
    int8_t neg = -5;
    cout << "5 in binary:  " << bitset<8>(num) << endl;
    cout << "-5 in binary: " << bitset<8>(neg) << endl;
    cout << "5 + (-5) =    " << bitset<8>(num + neg) << " = " << (int)(num + neg) << endl;

    // Manual two's complement
    uint8_t original = 0b00000101;  // 5
    uint8_t inverted = ~original;    // Invert bits
    uint8_t twos_comp = inverted + 1; // Add 1
    cout << "\nManual two's complement of 5:" << endl;
    cout << "  Original: " << bitset<8>(original) << endl;
    cout << "  Inverted: " << bitset<8>(inverted) << endl;
    cout << "  +1:       " << bitset<8>(twos_comp) << " = " << (int)(int8_t)twos_comp << endl;
    return 0;
}
```

```csharp
using System;

class TwosComplement
{
    static string ToBinaryString(int value, int bits)
    {
        return Convert.ToString(value & ((1 << bits) - 1), 2).PadLeft(bits, '0');
    }

    static void Main()
    {
        sbyte num = 5;
        sbyte neg = -5;
        Console.WriteLine($" 5 in binary: {ToBinaryString(num, 8)}");
        Console.WriteLine($"-5 in binary: {ToBinaryString(neg, 8)}");
        Console.WriteLine($"5 + (-5) =    {ToBinaryString(num + neg, 8)} = {num + neg}");

        // Manual two's complement
        byte original = 0b00000101;
        byte inverted = (byte)~original;
        byte twosComp = (byte)(inverted + 1);
        Console.WriteLine($"\nManual two's complement of 5:");
        Console.WriteLine($"  Original: {Convert.ToString(original, 2).PadLeft(8, '0')}");
        Console.WriteLine($"  Inverted: {Convert.ToString(inverted, 2).PadLeft(8, '0')}");
        Console.WriteLine($"  +1:       {Convert.ToString(twosComp, 2).PadLeft(8, '0')} = {(sbyte)twosComp}");
    }
}
```

```java
public class TwosComplement {
    public static void main(String[] args) {
        byte num = 5;
        byte neg = -5;

        System.out.printf(" 5 in binary: %8s%n",
            Integer.toBinaryString(num & 0xFF)).replace(' ', '0');
        System.out.printf("-5 in binary: %s%n",
            String.format("%8s", Integer.toBinaryString(neg & 0xFF)).replace(' ', '0'));

        // Manual two's complement
        int original = 0b00000101;
        int inverted = (~original) & 0xFF;
        int twosComp = (inverted + 1) & 0xFF;

        System.out.println("\nManual two's complement of 5:");
        System.out.printf("  Original: %s%n",
            String.format("%8s", Integer.toBinaryString(original)).replace(' ', '0'));
        System.out.printf("  Inverted: %s%n",
            String.format("%8s", Integer.toBinaryString(inverted)).replace(' ', '0'));
        System.out.printf("  +1:       %s = %d%n",
            String.format("%8s", Integer.toBinaryString(twosComp)).replace(' ', '0'),
            (byte) twosComp);
    }
}
```

```python
def to_binary(value, bits=8):
    """Display value in two's complement binary"""
    if value < 0:
        value = (1 << bits) + value  # Two's complement
    return format(value, f'0{bits}b')

def twos_complement(value, bits=8):
    """Compute two's complement of a positive number"""
    inverted = ((1 << bits) - 1) ^ value  # Invert bits
    return (inverted + 1) & ((1 << bits) - 1)  # Add 1

# Display
print(f" 5 in binary: {to_binary(5)}")
print(f"-5 in binary: {to_binary(-5)}")
print(f"5 + (-5) =    {to_binary(0)} = 0")

# Manual two's complement
original = 0b00000101
inverted = original ^ 0xFF  # Invert all 8 bits
twos_comp = (inverted + 1) & 0xFF

print(f"\nManual two's complement of 5:")
print(f"  Original: {format(original, '08b')}")
print(f"  Inverted: {format(inverted, '08b')}")
print(f"  +1:       {format(twos_comp, '08b')} = {twos_comp - 256}")
```

```javascript
function toBinary(value, bits = 8) {
  if (value < 0) {
    value = (1 << bits) + value;
  }
  return value.toString(2).padStart(bits, "0");
}

function twosComplement(value, bits = 8) {
  const mask = (1 << bits) - 1;
  const inverted = value ^ mask; // Invert bits
  return (inverted + 1) & mask;  // Add 1
}

console.log(` 5 in binary: ${toBinary(5)}`);
console.log(`-5 in binary: ${toBinary(-5)}`);
console.log(`5 + (-5) =    ${toBinary(0)} = 0`);

// Manual two's complement
const original = 0b00000101;
const inverted = original ^ 0xFF;
const twosComp = (inverted + 1) & 0xFF;

console.log(`\nManual two's complement of 5:`);
console.log(`  Original: ${original.toString(2).padStart(8, "0")}`);
console.log(`  Inverted: ${inverted.toString(2).padStart(8, "0")}`);
console.log(`  +1:       ${twosComp.toString(2).padStart(8, "0")} = ${twosComp - 256}`);
```

---

## Fractional Numbers in Different Bases

The positional system extends to fractions using negative powers:

$$101.11_2 = 1 \cdot 2^2 + 0 \cdot 2^1 + 1 \cdot 2^0 + 1 \cdot 2^{-1} + 1 \cdot 2^{-2} = 4 + 0 + 1 + 0.5 + 0.25 = 5.75_{10}$$

### Converting Decimal Fractions to Binary

Multiply the fractional part by 2 repeatedly and collect the integer parts:

**Convert $0.625_{10}$ to binary:**

| Step | Multiply | Integer Part | Remainder |
|------|----------|--------------|-----------|
| 1 | $0.625 \times 2 = 1.25$ | 1 | 0.25 |
| 2 | $0.25 \times 2 = 0.5$ | 0 | 0.5 |
| 3 | $0.5 \times 2 = 1.0$ | 1 | 0.0 |

Reading top-to-bottom: $0.625_{10} = 0.101_2$

> **Warning:** Some fractions (like $0.1_{10}$) have infinite binary representations, which is why floating-point arithmetic can produce surprising results like $0.1 + 0.2 \neq 0.3$.

---

## Practice Problems

1. Convert $1010110_2$ to decimal, octal, and hexadecimal.
2. Convert $200_{10}$ to binary using the division-remainder method.
3. Add $10111_2 + 11010_2$ in binary and verify in decimal.
4. Represent $-42$ in 8-bit two's complement.
5. What is the range of a 12-bit two's complement integer?
6. Convert $\text{DEAD}_{16}$ to decimal.

---

## Key Takeaways

- **Positional systems** give digits value based on position: value = digit × base^position.
- **Binary** (base 2) is fundamental to computing; every digital system operates in binary.
- **Hexadecimal** (base 16) is a compact way to write binary — each hex digit = 4 bits.
- The **division-remainder method** converts decimal to any base.
- **Binary arithmetic** follows the same rules as decimal, just with carry at 2 instead of 10.
- **Two's complement** represents negative integers: invert bits and add 1. It allows addition and subtraction with the same hardware.
- Computers store integers in fixed-width two's complement and approximate reals with IEEE 754 floating-point.
- Base conversion shortcuts: group bits in 3s for octal, 4s for hex.
