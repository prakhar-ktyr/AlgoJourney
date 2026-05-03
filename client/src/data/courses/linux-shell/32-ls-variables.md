---
title: Variables & Data Types
---

# Variables & Data Types

Variables store data that your script can use and manipulate. In Bash, variables are fundamental — almost every script uses them.

---

## Declaring Variables

In Bash, you create a variable by assigning a value to a name:

```bash
#!/bin/bash

name="Alice"
age=30
city="New York"

echo "Name: $name"
echo "Age: $age"
echo "City: $city"
```

**Output:**

```bash
Name: Alice
Age: 30
City: New York
```

**CRITICAL RULE: No spaces around the `=` sign!**

```bash
# CORRECT
name="Alice"

# WRONG — these will ALL fail!
name = "Alice"    # Error: "name: command not found"
name ="Alice"     # Error: "name: command not found"
name= "Alice"    # Tries to run "Alice" as a command
```

---

## Accessing Variables

Use `$` or `${}` to access a variable's value:

```bash
#!/bin/bash

greeting="Hello"
name="World"

# Both of these work:
echo "$greeting, $name!"
echo "${greeting}, ${name}!"
```

### When to Use ${} (Curly Braces)

Curly braces are needed when the variable name could be ambiguous:

```bash
#!/bin/bash

fruit="apple"

# Without braces — tries to find variable "fruits"
echo "I like ${fruit}s"     # "I like apples"
echo "I like $fruits"       # "I like " (empty — no variable named "fruits")

# Braces help with adjacent text
file="report"
echo "${file}_final.txt"    # "report_final.txt"
echo "$file_final.txt"      # ".txt" (looks for $file_final)
```

**Rule of thumb:** When in doubt, use `${variable}` — it's always safe.

---

## Quoting

Quoting is one of the most important concepts in Bash:

### Double Quotes (Expand Variables)

Double quotes allow variable expansion and command substitution:

```bash
#!/bin/bash

name="Alice"
echo "Hello, $name"          # Hello, Alice
echo "Today is $(date)"      # Today is Mon Jan 15 ...
echo "Home: $HOME"           # Home: /home/alice
```

### Single Quotes (Literal — No Expansion)

Single quotes treat everything literally:

```bash
#!/bin/bash

name="Alice"
echo 'Hello, $name'          # Hello, $name (literal dollar sign)
echo 'Today is $(date)'      # Today is $(date) (literal text)
echo 'Home: $HOME'           # Home: $HOME (no expansion)
```

### No Quotes (Dangerous!)

Without quotes, word splitting and globbing can cause problems:

```bash
#!/bin/bash

filename="my document.txt"

# BAD — splits into two arguments
ls $filename
# Tries: ls "my" "document.txt"

# GOOD — keeps as one argument
ls "$filename"
# Tries: ls "my document.txt"
```

### Mixing Quotes

```bash
#!/bin/bash

name="Alice"
echo "She said 'hello'"            # She said 'hello'
echo 'He said "goodbye"'           # He said "goodbye"
echo "It's $name's turn"           # It's Alice's turn
echo "The cost is \$5.00"          # The cost is $5.00 (escaped $)
```

---

## Variable Naming Rules

Valid variable names follow these rules:

1. Can contain: letters, numbers, underscores
2. Must start with: a letter or underscore
3. Case-sensitive: `name` and `Name` are different
4. Convention: UPPERCASE for constants/environment vars, lowercase for local vars

```bash
#!/bin/bash

# Valid names
name="Alice"
_private="secret"
user_name="bob"
file2="data.txt"
MAX_RETRIES=3

# Invalid names (will cause errors)
# 2name="bad"       # Can't start with number
# my-var="bad"      # Hyphens not allowed
# my var="bad"      # Spaces not allowed
# my.var="bad"      # Dots not allowed
```

**Naming conventions:**

```bash
#!/bin/bash

# Constants and environment variables — UPPERCASE
readonly MAX_CONNECTIONS=100
export DATABASE_URL="localhost:5432"

# Local/script variables — lowercase or snake_case
current_user="alice"
file_count=0
is_valid=true
```

---

## Environment Variables

Environment variables are available to the current shell and any child processes.

### Viewing Environment Variables

```bash
# Show all environment variables
env

# Show specific variable
echo $HOME
echo $PATH
echo $USER

# Another way to see them
printenv
printenv HOME
```

### Creating Environment Variables

```bash
#!/bin/bash

# Regular variable — only available in this script
my_var="local only"

# Environment variable — available to child processes
export MY_ENV_VAR="available everywhere"

# Set and export in one line
export API_KEY="abc123"

# Make an existing variable an environment variable
greeting="hello"
export greeting
```

**Difference between regular and environment variables:**

```bash
#!/bin/bash
# parent.sh

regular_var="I'm local"
export env_var="I'm exported"

bash -c 'echo "Regular: $regular_var"'   # Empty!
bash -c 'echo "Exported: $env_var"'      # "I'm exported"
```

### Common Environment Variables

| Variable | Description |
|----------|-------------|
| `$HOME` | User's home directory |
| `$USER` | Current username |
| `$PATH` | Command search path |
| `$PWD` | Current working directory |
| `$SHELL` | Current shell |
| `$TERM` | Terminal type |
| `$EDITOR` | Default text editor |
| `$LANG` | System language/locale |

---

## Special Variables

Bash provides several special variables that are extremely useful:

```bash
#!/bin/bash
# special-vars.sh

echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "Number of arguments: $#"
echo "All arguments (separate): $@"
echo "All arguments (single string): $*"
echo "Exit code of last command: $?"
echo "Process ID of this script: $$"
echo "PID of last background process: $!"
```

**Run it:**

```bash
./special-vars.sh hello world
```

**Output:**

```bash
Script name: ./special-vars.sh
First argument: hello
Second argument: world
Number of arguments: 2
All arguments (separate): hello world
All arguments (single string): hello world
Exit code of last command: 0
Process ID of this script: 12345
PID of last background process:
```

### $@ vs $* — The Difference

```bash
#!/bin/bash
# difference.sh

echo "--- Using \$@ (each arg separate) ---"
for arg in "$@"; do
    echo "  Arg: '$arg'"
done

echo "--- Using \$* (all args as one) ---"
for arg in "$*"; do
    echo "  Arg: '$arg'"
done
```

**Run:**

```bash
./difference.sh "hello world" foo bar
```

**Output:**

```bash
--- Using $@ (each arg separate) ---
  Arg: 'hello world'
  Arg: 'foo'
  Arg: 'bar'
--- Using $* (all args as one) ---
  Arg: 'hello world foo bar'
```

**Rule:** Almost always use `"$@"` (with quotes) when passing arguments along.

---

## Readonly Variables

Use `readonly` to create constants that cannot be changed:

```bash
#!/bin/bash

readonly PI=3.14159
readonly APP_NAME="MyApp"
readonly VERSION="1.0.0"

echo "Running $APP_NAME v$VERSION"

# This will cause an error:
PI=3.14
# Error: PI: readonly variable
```

You can also declare and make readonly in one step:

```bash
#!/bin/bash

declare -r MAX_USERS=100
# Same as: readonly MAX_USERS=100

echo "Max users: $MAX_USERS"
```

---

## Unsetting Variables

Use `unset` to remove a variable:

```bash
#!/bin/bash

name="Alice"
echo "Name: $name"    # Name: Alice

unset name
echo "Name: $name"    # Name: (empty)
```

**Note:** You cannot unset readonly variables:

```bash
#!/bin/bash

readonly CONSTANT="fixed"
unset CONSTANT
# Error: CONSTANT: readonly variable
```

---

## Variable Types

In Bash, **everything is a string by default!** There are no true data types like in other languages.

```bash
#!/bin/bash

# These are all strings:
number=42
text="hello"
mixed="file123"

# "42" is stored as the string "42", not an integer
```

### Declaring Variable Types with declare

You can hint at types using `declare`:

```bash
#!/bin/bash

# Integer variable — arithmetic only
declare -i count=0
count=count+1        # Works! No need for $(())
count="hello"        # Becomes 0 (can't convert)
echo "$count"        # 0

# Uppercase variable
declare -u upper="hello"
echo "$upper"        # HELLO

# Lowercase variable
declare -l lower="HELLO"
echo "$lower"        # hello

# Array
declare -a fruits=("apple" "banana" "cherry")
echo "${fruits[0]}"  # apple

# Associative array (dictionary/hashmap)
declare -A colors
colors[red]="#FF0000"
colors[blue]="#0000FF"
echo "${colors[red]}"  # #FF0000
```

---

## Local Variables in Functions

Variables declared inside functions are global by default. Use `local` to scope them:

```bash
#!/bin/bash

# Without local — variable leaks out
bad_function() {
    result="I leaked!"
}
bad_function
echo "$result"    # "I leaked!" — still accessible!

# With local — variable stays in function
good_function() {
    local result="I'm contained"
    echo "Inside: $result"
}
good_function
echo "Outside: $result"  # "Outside: I leaked!" (from before)
```



---

## Default Values

Handle unset or empty variables gracefully:

```bash
#!/bin/bash

# Use default if variable is unset/empty
echo "${name:-Anonymous}"     # "Anonymous" (name is unset)

name="Alice"
echo "${name:-Anonymous}"     # "Alice" (name is set)

# Set default AND assign it
echo "${name:=Anonymous}"     # Assigns if unset

# Display error if unset
echo "${name:?Error: name is required}"

# Use alternative if set
name="Alice"
echo "${name:+User: $name}"  # "User: Alice" (shows only if set)
```

**Practical example:**

```bash
#!/bin/bash

# Use defaults for configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-myapp}"

echo "Connecting to $DB_HOST:$DB_PORT/$DB_NAME"
```

---

## Practical Example: Path Manipulation

```bash
#!/bin/bash

filepath="/home/user/documents/report.final.pdf"

# Extract parts
directory=$(dirname "$filepath")
filename=$(basename "$filepath")
extension="${filename##*.}"
name_only="${filename%.*}"

echo "Full path : $filepath"
echo "Directory : $directory"
echo "Filename  : $filename"
echo "Extension : $extension"
echo "Name only : $name_only"
```

**Output:**

```bash
Full path : /home/user/documents/report.final.pdf
Directory : /home/user/documents
Filename  : report.final.pdf
Extension : pdf
Name only : report.final
```

---

## Quick Reference

| Operation | Syntax |
|-----------|--------|
| Assign | `var="value"` |
| Access | `$var` or `${var}` |
| Length | `${#var}` |
| Substring | `${var:offset:length}` |
| Replace | `${var/old/new}` |
| Default | `${var:-default}` |
| Export | `export var="value"` |
| Readonly | `readonly var="value"` |
| Unset | `unset var` |
| Local | `local var="value"` |
| Integer | `declare -i var` |
| Command output | `var=$(command)` |

---

## Summary

- Variables are assigned with `=` (no spaces!)
- Access with `$var` or `${var}`
- Double quotes expand variables; single quotes are literal
- Use `export` for environment variables
- Special variables (`$0`, `$1`, `$#`, `$@`, `$?`) are essential
- Everything in Bash is a string — use `declare -i` for integers
- Use `local` in functions to prevent variable leakage
- Default values (`${var:-default}`) make scripts robust

Next, we'll learn about **user input** — making your scripts interactive!
