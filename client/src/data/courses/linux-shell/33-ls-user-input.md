---
title: User Input
---

# User Input

Interactive scripts need to get information from the user. The `read` command is your primary tool for this. It pauses the script and waits for the user to type something.

---

## Basic read Command

The `read` command reads a line of input and stores it in a variable:

```bash
#!/bin/bash

echo "What is your name?"
read name
echo "Hello, $name!"
```

**Run it:**

```bash
$ ./greet.sh
What is your name?
Alice
Hello, Alice!
```

If you don't specify a variable, the input goes into the special `$REPLY` variable:

```bash
#!/bin/bash

echo "Type something:"
read
echo "You typed: $REPLY"
```

---

## read with Prompt (-p)

The `-p` flag lets you display a prompt on the same line:

```bash
#!/bin/bash

read -p "Enter your name: " name
read -p "Enter your age: " age

echo "Hello, $name! You are $age years old."
```

**Output:**

```bash
Enter your name: Alice
Enter your age: 30
Hello, Alice! You are 30 years old.
```

This is cleaner than using `echo` + `read` on separate lines.

---

## Silent Input (-s)

Use `-s` for sensitive input like passwords (characters are not shown):

```bash
#!/bin/bash

read -p "Username: " username
read -sp "Password: " password
echo ""  # Move to a new line (read -s doesn't add one)

echo "Logging in as $username..."

# Never echo passwords in real scripts!
# This is just for demonstration
if [ "$password" = "secret123" ]; then
    echo "Access granted!"
else
    echo "Access denied!"
fi
```

**Output:**

```bash
Username: alice
Password:
Logging in as alice...
Access granted!
```

The password characters are invisible while typing.

---

## Timeout (-t)

Use `-t` to set a time limit (in seconds):

```bash
#!/bin/bash

read -t 5 -p "Quick! Enter your name (5 seconds): " name

if [ $? -eq 0 ]; then
    echo "Hello, $name!"
else
    echo ""
    echo "Too slow! Using default name."
    name="Guest"
    echo "Hello, $name!"
fi
```

**Practical use — auto-continue after timeout:**

```bash
#!/bin/bash

echo "Press Enter to continue or wait 10 seconds..."
read -t 10

echo "Proceeding with installation..."
```

---

## Character Limit (-n)

Use `-n` to read only a specific number of characters:

```bash
#!/bin/bash

read -n 1 -p "Continue? (y/n): " answer
echo ""  # New line after single char

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "Continuing..."
else
    echo "Aborted."
fi
```

**Note:** With `-n 1`, the script continues immediately after one character — no Enter needed!

**Reading a fixed-length code:**

```bash
#!/bin/bash

read -n 6 -p "Enter 6-digit code: " code
echo ""
echo "You entered: $code"
```

---

## Reading Multiple Variables

You can read multiple values in one line by specifying multiple variable names:

```bash
#!/bin/bash

read -p "Enter first and last name: " first last
echo "First name: $first"
echo "Last name: $last"
```

**Output:**

```bash
Enter first and last name: Alice Smith
First name: Alice
Last name: Smith
```

**What happens with extra words?**

```bash
Enter first and last name: Alice Marie Smith
First name: Alice
Last name: Marie Smith    # Last variable gets the rest!
```

**With fewer words than variables:**

```bash
Enter first and last name: Alice
First name: Alice
Last name:                 # Empty
```

---

## Reading into an Array (-a)

Use `-a` to split input into an array:

```bash
#!/bin/bash

read -p "Enter your favorite fruits (space-separated): " -a fruits

echo "You entered ${#fruits[@]} fruits:"
for i in "${!fruits[@]}"; do
    echo "  $((i+1)). ${fruits[$i]}"
done
```

**Output:**

```bash
Enter your favorite fruits (space-separated): apple banana cherry
You entered 3 fruits:
  1. apple
  2. banana
  3. cherry
```

---

## Custom Delimiter (-d)

By default, `read` uses newline as a delimiter. Use `-d` to change it:

```bash
#!/bin/bash

# Read until user types a period
echo "Enter text (end with a period):"
read -d "." text
echo ""
echo "You typed: $text"
```

**Reading comma-separated values:**

```bash
#!/bin/bash

read -p "Enter values (comma-separated, end with Enter): " input

# Split by comma using IFS
IFS=',' read -ra values <<< "$input"

echo "You entered ${#values[@]} values:"
for val in "${values[@]}"; do
    # Trim whitespace
    trimmed=$(echo "$val" | xargs)
    echo "  - $trimmed"
done
```

**Output:**

```bash
Enter values (comma-separated, end with Enter): apple, banana, cherry
You entered 3 values:
  - apple
  - banana
  - cherry
```

---

## Default Values

Use parameter expansion to provide defaults when the user just presses Enter:

```bash
#!/bin/bash

read -p "Enter hostname [localhost]: " hostname
hostname="${hostname:-localhost}"

read -p "Enter port [8080]: " port
port="${port:-8080}"

read -p "Enter protocol [https]: " protocol
protocol="${protocol:-https}"

echo ""
echo "Configuration:"
echo "  URL: $protocol://$hostname:$port"
```

**Output (user pressed Enter for all):**

```bash
Enter hostname [localhost]:
Enter port [8080]:
Enter protocol [https]:

Configuration:
  URL: https://localhost:8080
```

---

## The select Command — Simple Menus

`select` creates a numbered menu for the user:

```bash
#!/bin/bash

echo "Choose your favorite language:"
select lang in Python JavaScript Rust Go "Quit"; do
    case $lang in
        "Python")
            echo "Great choice! Python is versatile."
            ;;
        "JavaScript")
            echo "Nice! JS runs everywhere."
            ;;
        "Rust")
            echo "Impressive! Rust is fast and safe."
            ;;
        "Go")
            echo "Cool! Go is great for servers."
            ;;
        "Quit")
            echo "Goodbye!"
            break
            ;;
        *)
            echo "Invalid option. Try again."
            ;;
    esac
done
```

**Output:**

```bash
Choose your favorite language:
1) Python
2) JavaScript
3) Rust
4) Go
5) Quit
#? 1
Great choice! Python is versatile.
#? 5
Goodbye!
```

### Customizing the select Prompt

```bash
#!/bin/bash

PS3="Select an option (1-4): "  # Custom prompt

select action in "View files" "Create file" "Delete file" "Exit"; do
    case $REPLY in
        1) ls -la ;;
        2) read -p "Filename: " fname; touch "$fname" ;;
        3) read -p "Delete which file: " fname; rm -i "$fname" ;;
        4) break ;;
        *) echo "Invalid option" ;;
    esac
done
```

---

## Validating Input

Always validate user input! Never trust that users will type what you expect.

### Check for Empty Input

```bash
#!/bin/bash

while true; do
    read -p "Enter your name: " name
    if [ -n "$name" ]; then
        break
    fi
    echo "Name cannot be empty. Try again."
done

echo "Hello, $name!"
```

### Check for Numeric Input

```bash
#!/bin/bash

read -p "Enter your age: " age

# Method 1: Regex check
if [[ "$age" =~ ^[0-9]+$ ]]; then
    echo "Your age is $age"
else
    echo "Error: '$age' is not a valid number"
    exit 1
fi
```

```bash
#!/bin/bash

# Method 2: Range validation
read -p "Enter a number (1-100): " num

if [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -ge 1 ] && [ "$num" -le 100 ]; then
    echo "Valid: $num"
else
    echo "Error: Must be a number between 1 and 100"
    exit 1
fi
```

### Check for Yes/No

```bash
#!/bin/bash

read -p "Are you sure? (yes/no): " answer

case "${answer,,}" in  # ${answer,,} converts to lowercase
    yes|y)
        echo "Proceeding..."
        ;;
    no|n)
        echo "Cancelled."
        exit 0
        ;;
    *)
        echo "Please answer yes or no."
        exit 1
        ;;
esac
```

### Validate Email Format

```bash
#!/bin/bash

read -p "Enter your email: " email

if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email: $email"
else
    echo "Invalid email format"
    exit 1
fi
```



---

## Practical Examples

### Example 1: User Registration

```bash
#!/bin/bash

echo "=== User Registration ==="
echo ""

# Get username
while true; do
    read -p "Username (3-20 chars): " username
    if [[ ${#username} -ge 3 && ${#username} -le 20 ]]; then
        break
    fi
    echo "  Invalid! Use 3-20 characters."
done

# Get email
while true; do
    read -p "Email: " email
    if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        break
    fi
    echo "  Invalid email format."
done

# Get password
while true; do
    read -sp "Password (min 8 chars): " password
    echo ""
    if [ ${#password} -ge 8 ]; then
        read -sp "Confirm password: " password2
        echo ""
        if [ "$password" = "$password2" ]; then
            break
        fi
        echo "  Passwords don't match."
    else
        echo "  Too short!"
    fi
done

echo ""
echo "=== Registration Complete ==="
echo "Username: $username"
echo "Email: $email"
```

### Example 2: Configuration Wizard

```bash
#!/bin/bash

echo "=== Application Setup Wizard ==="
echo ""

read -p "Database host [localhost]: " db_host
db_host="${db_host:-localhost}"

read -p "Database port [5432]: " db_port
db_port="${db_port:-5432}"

read -p "Database name [myapp]: " db_name
db_name="${db_name:-myapp}"

read -sp "Database password: " db_pass
echo ""

echo ""
echo "=== Configuration Summary ==="
echo "Database : $db_host:$db_port/$db_name"
echo ""

read -n 1 -p "Save this configuration? (y/n): " save
echo ""

if [ "$save" = "y" ]; then
    echo "Configuration saved!"
else
    echo "Configuration discarded."
fi
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `read var` | Read input into variable |
| `read -p "text" var` | Show prompt |
| `read -s var` | Silent (no echo) |
| `read -t 5 var` | 5 second timeout |
| `read -n 1 var` | Read 1 character |
| `read -a arr` | Read into array |
| `read -d "." var` | Read until delimiter |
| `read -r var` | No backslash escape |
| `${var:-default}` | Default if unset |
| `select var in ...` | Menu selection |

---

## Try It Yourself

**Exercise 1:** Create a script that asks for the user's name, favorite color, and hobby, then prints a fun fact card.

**Exercise 2:** Build a simple quiz game that asks 5 questions, validates answers, and keeps score.

**Exercise 3:** Create a "mad libs" script that asks for nouns, verbs, and adjectives, then fills them into a story template.

---

## Summary

- `read` is the primary command for getting user input
- Use `-p` for inline prompts, `-s` for secrets, `-t` for timeouts
- `-n` limits character count, `-a` reads into arrays
- Always validate input — check for empty, numeric, format
- `select` creates easy numbered menus
- Default values (`${var:-default}`) improve user experience
- Combine `while` loops with validation for robust input handling

Next, we'll learn about **arithmetic operations** — doing math in shell scripts!
