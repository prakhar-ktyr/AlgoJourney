---
title: Arithmetic Operations
---

# Arithmetic Operations

Bash treats everything as strings by default. To perform math, you need special syntax. This lesson covers all the ways to do arithmetic in shell scripts.

---

## The Problem: Strings, Not Numbers

In bash, `+` doesn't add numbers — it's just a character:

```bash
#!/bin/bash

a=5
b=3
result=$a+$b
echo $result    # 5+3 (string concatenation, NOT 8!)
```

You need special constructs to tell bash "treat these as numbers."

---

## $(( )) — Arithmetic Expansion

The **recommended** way to do integer math in bash:

```bash
#!/bin/bash

a=10
b=3

echo $((a + b))     # 13
echo $((a - b))     # 7
echo $((a * b))     # 30
echo $((a / b))     # 3 (integer division — no decimals!)
echo $((a % b))     # 1 (modulo — remainder)
echo $((a ** b))    # 1000 (exponentiation: 10^3)
```

### Storing results in variables

```bash
#!/bin/bash

x=15
y=4

sum=$((x + y))
diff=$((x - y))
product=$((x * y))
quotient=$((x / y))
remainder=$((x % y))

echo "Sum: $sum"           # 19
echo "Difference: $diff"   # 11
echo "Product: $product"   # 60
echo "Quotient: $quotient" # 3
echo "Remainder: $remainder" # 3
```

### Complex expressions

```bash
#!/bin/bash

# Parentheses for order of operations:
echo $(( (5 + 3) * 2 ))       # 16
echo $(( 5 + 3 * 2 ))         # 11 (multiplication first)
echo $(( (10 - 2) / (3 + 1) )) # 2

# Using variables in expressions:
width=10
height=5
area=$((width * height))
perimeter=$((2 * (width + height)))

echo "Area: $area"             # 50
echo "Perimeter: $perimeter"   # 30
```

### Assignment operators

```bash
#!/bin/bash

count=10

# Arithmetic assignment (inside (( )) without $):
((count += 5))    # count = count + 5
echo $count       # 15

((count -= 3))    # count = count - 3
echo $count       # 12

((count *= 2))    # count = count * 2
echo $count       # 24

((count /= 4))    # count = count / 4
echo $count       # 6

((count %= 4))    # count = count % 4
echo $count       # 2
```

---

## (( )) — Arithmetic Evaluation

Use `(( ))` (without `$`) for arithmetic commands — especially useful for increment/decrement and conditions:

### Increment and decrement

```bash
#!/bin/bash

count=0

# Post-increment:
((count++))
echo $count    # 1

((count++))
echo $count    # 2

# Post-decrement:
((count--))
echo $count    # 1

# Pre-increment:
echo $((++count))   # 2 (increments THEN returns)

# Pre-decrement:
echo $((--count))   # 1 (decrements THEN returns)
```

### Increment in loops

```bash
#!/bin/bash

# Counting with arithmetic:
sum=0
for i in {1..10}; do
    ((sum += i))
done
echo "Sum of 1-10: $sum"    # 55

# C-style for loop:
for ((i = 0; i < 5; i++)); do
    echo "Iteration: $i"
done
```

### Arithmetic conditions

```bash
#!/bin/bash

x=10
y=20

# (( )) returns true (0) if non-zero, false (1) if zero:
if ((x > y)); then
    echo "$x is greater"
elif ((x < y)); then
    echo "$y is greater"
else
    echo "They are equal"
fi

# Comparison operators in (( )):
# ==  Equal
# !=  Not equal
# <   Less than
# >   Greater than
# <=  Less than or equal
# >=  Greater than or equal
```

**Example — checking even/odd:**

```bash
#!/bin/bash

read -p "Enter a number: " num

if ((num % 2 == 0)); then
    echo "$num is even"
else
    echo "$num is odd"
fi
```

---

## The let Command

`let` performs arithmetic and assigns the result:

```bash
#!/bin/bash

let "result = 5 + 3"
echo $result    # 8

let "a = 10"
let "b = 3"
let "sum = a + b"
echo $sum       # 13

# Multiple operations:
let "x = 5" "y = 10" "z = x + y"
echo $z    # 15

# Increment:
let "count = 0"
let "count++"
let "count++"
echo $count    # 2
```

**Note:** `let` is essentially equivalent to `(( ))` but less commonly used in modern scripts.

---

## The expr Command (Legacy)

`expr` is an older external command for arithmetic. You might see it in old scripts:

```bash
#!/bin/bash

# Note: spaces around operators are REQUIRED
result=$(expr 5 + 3)
echo $result    # 8

result=$(expr 10 - 4)
echo $result    # 6

# Multiplication needs escaping (or quoting) because * is special:
result=$(expr 5 \* 3)
echo $result    # 15

result=$(expr 10 / 3)
echo $result    # 3

result=$(expr 10 % 3)
echo $result    # 1
```

**Modern recommendation:** Avoid `expr`. Use `$(( ))` instead — it's faster (built-in) and easier to read.

```bash
# Old way (don't use):
result=$(expr $a + $b)

# Modern way (preferred):
result=$((a + b))
```

---

## Floating Point with bc

Bash **cannot** do floating-point math natively. Use `bc` (basic calculator):

```bash
#!/bin/bash

# Integer division in bash — loses precision:
echo $((10 / 3))    # 3 (not 3.333...)

# Floating point with bc:
echo "10 / 3" | bc              # 3 (still integer by default!)
echo "scale=2; 10 / 3" | bc    # 3.33
echo "scale=4; 10 / 3" | bc    # 3.3333
```

### Basic bc usage

```bash
#!/bin/bash

# Addition:
echo "5.5 + 3.2" | bc        # 8.7

# Subtraction:
echo "10.8 - 4.3" | bc       # 6.5

# Multiplication:
echo "3.14 * 2" | bc         # 6.28

# Division with precision:
echo "scale=3; 22 / 7" | bc  # 3.142

# Power:
echo "2 ^ 10" | bc           # 1024

# Square root:
echo "scale=4; sqrt(2)" | bc # 1.4142
```

### Storing bc results in variables

```bash
#!/bin/bash

pi=$(echo "scale=10; 4*a(1)" | bc -l)   # Calculate pi using arctan
echo "Pi = $pi"

radius=5
area=$(echo "scale=2; $pi * $radius * $radius" | bc)
circumference=$(echo "scale=2; 2 * $pi * $radius" | bc)

echo "Circle with radius $radius:"
echo "  Area: $area"
echo "  Circumference: $circumference"
```

### bc with scale (decimal places)

```bash
#!/bin/bash

# scale sets the number of decimal places:
echo "scale=0; 10/3" | bc    # 3
echo "scale=1; 10/3" | bc    # 3.3
echo "scale=2; 10/3" | bc    # 3.33
echo "scale=5; 10/3" | bc    # 3.33333
echo "scale=10; 10/3" | bc   # 3.3333333333
```



---

## Practical Examples

### Example 1: Calculator Script

```bash
#!/bin/bash
# calculator.sh — Simple command-line calculator

read -p "Enter first number: " num1
read -p "Enter operator (+, -, *, /, %): " op
read -p "Enter second number: " num2

# Check for division by zero:
if [ "$op" = "/" ] || [ "$op" = "%" ]; then
    if [ "$num2" = "0" ]; then
        echo "Error: Division by zero!"
        exit 1
    fi
fi

# Check if numbers contain decimals:
if [[ "$num1" == *.* ]] || [[ "$num2" == *.* ]]; then
    # Use bc for floating point:
    case $op in
        +) result=$(echo "scale=4; $num1 + $num2" | bc);;
        -) result=$(echo "scale=4; $num1 - $num2" | bc);;
        '*') result=$(echo "scale=4; $num1 * $num2" | bc);;
        /) result=$(echo "scale=4; $num1 / $num2" | bc);;
        %) result=$(echo "scale=4; $num1 % $num2" | bc);;
        *) echo "Invalid operator!"; exit 1;;
    esac
else
    # Use arithmetic expansion for integers:
    case $op in
        +) result=$((num1 + num2));;
        -) result=$((num1 - num2));;
        '*') result=$((num1 * num2));;
        /) result=$((num1 / num2));;
        %) result=$((num1 % num2));;
        *) echo "Invalid operator!"; exit 1;;
    esac
fi

echo "$num1 $op $num2 = $result"
```

### Example 2: Temperature Converter

```bash
#!/bin/bash
# temp_convert.sh — Convert between Celsius and Fahrenheit

echo "Temperature Converter"
echo "1) Celsius to Fahrenheit"
echo "2) Fahrenheit to Celsius"
read -p "Choose (1 or 2): " choice

case $choice in
    1)
        read -p "Enter temperature in Celsius: " celsius
        fahrenheit=$(echo "scale=2; ($celsius * 9/5) + 32" | bc)
        echo "${celsius}°C = ${fahrenheit}°F"
        ;;
    2)
        read -p "Enter temperature in Fahrenheit: " fahrenheit
        celsius=$(echo "scale=2; ($fahrenheit - 32) * 5/9" | bc)
        echo "${fahrenheit}°F = ${celsius}°C"
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac
```

### Example 3: File Size Calculator

```bash
#!/bin/bash
# filesize.sh — Calculate and display human-readable file sizes

bytes=${1:-0}

if [ "$bytes" -eq 0 ]; then
    read -p "Enter size in bytes: " bytes
fi

if ((bytes < 1024)); then
    echo "${bytes} B"
elif ((bytes < 1048576)); then
    result=$(echo "scale=2; $bytes / 1024" | bc)
    echo "${result} KB"
elif ((bytes < 1073741824)); then
    result=$(echo "scale=2; $bytes / 1048576" | bc)
    echo "${result} MB"
else
    result=$(echo "scale=2; $bytes / 1073741824" | bc)
    echo "${result} GB"
fi
```

### Example 4: Time Duration Calculator

```bash
#!/bin/bash
# duration.sh — Convert seconds to hours:minutes:seconds

read -p "Enter total seconds: " total_seconds

hours=$((total_seconds / 3600))
remaining=$((total_seconds % 3600))
minutes=$((remaining / 60))
seconds=$((remaining % 60))

printf "%02d:%02d:%02d\n" $hours $minutes $seconds
```

### Example 5: Percentage Calculator

```bash
#!/bin/bash
# percentage.sh — Calculate percentages

read -p "Enter the part: " part
read -p "Enter the whole: " whole

if [ "$whole" -eq 0 ]; then
    echo "Error: Cannot divide by zero!"
    exit 1
fi

percentage=$(echo "scale=2; ($part / $whole) * 100" | bc)
echo "$part out of $whole = ${percentage}%"
```

---

## Common Pitfalls

### Pitfall 1: Spaces in arithmetic

```bash
# These all work:
echo $((5+3))       # 8
echo $(( 5 + 3 ))   # 8 (spaces are fine inside (( )))
echo $((5 + 3))     # 8

# But NOT with let:
let "x = 5 + 3"     # OK with quotes
let x=5+3           # OK without spaces
# let x = 5 + 3     # ERROR without quotes
```

### Pitfall 2: Integer division truncates

```bash
#!/bin/bash

echo $((7 / 2))     # 3 (not 3.5!)
echo $((1 / 3))     # 0 (not 0.333!)

# Solution: use bc for decimals
echo "scale=2; 7 / 2" | bc    # 3.50
```

### Pitfall 3: Leading zeros = octal

```bash
#!/bin/bash

# Careful with leading zeros!
echo $((010))       # 8 (010 is octal for 8!)
echo $((08))        # Error! 8 is not a valid octal digit

# To force base-10:
echo $((10#010))    # 10 (force decimal interpretation)
echo $((10#08))     # 8
```

---

## Summary

| Method | Syntax | Use Case |
|--------|--------|----------|
| $(( )) | `$((a + b))` | Integer math (recommended) |
| (( )) | `((count++))` | Arithmetic commands, conditions |
| let | `let "x = 5 + 3"` | Alternative assignment |
| expr | `expr 5 + 3` | Legacy — avoid |
| bc | `echo "1/3" \| bc` | Floating-point math |
| bc -l | `echo "s(1)" \| bc -l` | Math library functions |

**Integer operators in $(( )):**

| Operator | Meaning |
|----------|---------|
| + | Addition |
| - | Subtraction |
| * | Multiplication |
| / | Integer division |
| % | Modulo (remainder) |
| ** | Exponentiation |
| ++ | Increment |
| -- | Decrement |

---

## Next Steps

Now that you can do calculations, the next lesson covers **conditional statements** — making decisions in your scripts with if/else, test commands, and logical operators.
