---
title: Creating Files & Directories
---

# Creating Files & Directories

Now that you can navigate the file system, it's time to **build** things! In this lesson, you'll learn to create files and directories, from simple one-liners to complex project structures.

---

## touch — Create Empty Files

The `touch` command creates an empty file. If the file already exists, it updates the timestamp.

### Create a Single File

```bash
touch hello.txt
```

```bash
# Verify it was created
ls -l hello.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:00 hello.txt
# Note: size is 0 (empty file)
```

### Create Multiple Files at Once

```bash
touch file1.txt file2.txt file3.txt
```

```bash
# Verify
ls -l file*.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:00 file1.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:00 file2.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:00 file3.txt
```

### touch Existing Files (Update Timestamp)

```bash
# Check current timestamp
ls -l hello.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:00 hello.txt

# Wait a minute, then touch again
touch hello.txt

ls -l hello.txt
# -rw-r--r-- 1 alice alice 0 Jan 15 10:05 hello.txt
# Timestamp updated! Content unchanged.
```

### Set Specific Timestamps

```bash
# Set a specific date/time
touch -t 202401011200 important.txt
# Sets timestamp to Jan 1, 2024, 12:00 PM

# Use date format: YYYYMMDDhhmm
touch -t 202312251500 christmas.txt

# Match another file's timestamp
touch -r reference.txt target.txt
# target.txt now has the same timestamp as reference.txt
```

### Create Files with Extensions

```bash
# Create various file types (all empty)
touch index.html
touch styles.css
touch app.js
touch README.md
touch .env
touch .gitignore
```

### Try It Yourself

```bash
# Create a workspace
cd /tmp
mkdir touch-practice && cd touch-practice

# Create some files
touch notes.txt todo.md script.sh

# List them
ls -la

# Update one timestamp
touch notes.txt

# Check the timestamp changed
ls -l notes.txt
```

---

## mkdir — Create Directories

The `mkdir` command creates new directories.

### Create a Single Directory

```bash
mkdir projects
```

```bash
# Verify
ls -ld projects
# drwxr-xr-x 2 alice alice 4096 Jan 15 10:00 projects/
```

### Create Multiple Directories

```bash
mkdir src tests docs config
```

```bash
# Verify
ls -la
# drwxr-xr-x 2 alice alice 4096 Jan 15 10:00 config/
# drwxr-xr-x 2 alice alice 4096 Jan 15 10:00 docs/
# drwxr-xr-x 2 alice alice 4096 Jan 15 10:00 src/
# drwxr-xr-x 2 alice alice 4096 Jan 15 10:00 tests/
```

### Common Error Without -p

```bash
# This FAILS if "a" doesn't exist:
mkdir a/b/c
# mkdir: cannot create directory 'a/b/c': No such file or directory
```

---

## mkdir -p — Create Nested Directories

The `-p` flag creates **all parent directories** as needed. It also doesn't error if the directory already exists.

```bash
# Creates all intermediate directories
mkdir -p projects/webapp/src/components

# Verify the entire tree was created
tree projects
# projects/
# └── webapp/
#     └── src/
#         └── components/
```

### Create Complex Structures

```bash
# Create multiple nested paths at once
mkdir -p project/{src,tests,docs}/{core,utils,helpers}

# View the result
tree project
# project/
# ├── docs/
# │   ├── core/
# │   ├── helpers/
# │   └── utils/
# ├── src/
# │   ├── core/
# │   ├── helpers/
# │   └── utils/
# └── tests/
#     ├── core/
#     ├── helpers/
#     └── utils/
```

### No Error on Existing Directories

```bash
# Without -p: errors if directory exists
mkdir projects
# mkdir: cannot create directory 'projects': File exists

# With -p: silently succeeds
mkdir -p projects
# No error!
```

### Try It Yourself

```bash
# Create a typical web project structure
mkdir -p mywebsite/{public/{css,js,images},src/{components,pages,utils},tests}

# Verify
tree mywebsite
```

---

## Creating Files with Content

Empty files aren't always useful. Here's how to create files with content directly from the terminal.

### echo with Redirect (>)

The `>` operator writes text to a file (overwrites if it exists):

```bash
# Create a file with content
echo "Hello, World!" > greeting.txt

# Verify
cat greeting.txt
# Hello, World!
```

### echo with Append (>>)

The `>>` operator **appends** to a file (doesn't overwrite):

```bash
# Create a file
echo "Line 1" > myfile.txt

# Append more lines
echo "Line 2" >> myfile.txt
echo "Line 3" >> myfile.txt

# Verify
cat myfile.txt
# Line 1
# Line 2
# Line 3
```

### Multi-line with echo -e

```bash
echo -e "#!/bin/bash\n\necho \"Hello from my script!\"\ndate" > script.sh

cat script.sh
# #!/bin/bash
#
# echo "Hello from my script!"
# date
```

### cat with Heredoc (<<)

For longer multi-line content, use a **heredoc**:

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
EOF
```

```bash
# Verify
cat index.html
# Shows the full HTML content
```

### cat > file (Interactive)

You can type content interactively:

```bash
cat > notes.txt
This is line 1
This is line 2
This is the last line
```

Press **Ctrl+D** when done (signals end of input).

```bash
# Verify
cat notes.txt
# This is line 1
# This is line 2
# This is the last line
```

### printf for Formatted Content

```bash
# printf gives more control over formatting
printf "Name: %s\nAge: %d\nCity: %s\n" "Alice" 30 "NYC" > profile.txt

cat profile.txt
# Name: Alice
# Age: 30
# City: NYC
```

### Try It Yourself

```bash
# Create a simple README
cat > README.md << 'EOF'
# My Project

A simple project to practice Linux commands.

## Getting Started

1. Clone this repo
2. Run the script
3. Have fun!
EOF

cat README.md
```

---

## Brace Expansion

Brace expansion is one of the most powerful features for creating multiple files/directories at once.

### Number Ranges

```bash
# Create numbered files
touch file{1..10}.txt

ls
# file1.txt  file2.txt  file3.txt  file4.txt  file5.txt
# file6.txt  file7.txt  file8.txt  file9.txt  file10.txt
```

### Zero-Padded Numbers

```bash
# Create zero-padded filenames
touch file{01..10}.txt

ls
# file01.txt  file02.txt  file03.txt  file04.txt  file05.txt
# file06.txt  file07.txt  file08.txt  file09.txt  file10.txt
```

### Comma-Separated Lists

```bash
# Create specific named files
touch {index,about,contact,faq}.html

ls
# about.html  contact.html  faq.html  index.html
```

### Directories with Braces

```bash
# Create multiple directories
mkdir {frontend,backend,database,docs}

# Create numbered directories
mkdir chapter{01..12}

# Nested creation
mkdir -p app/{models,views,controllers}
```

### Combining Braces

```bash
# Mix and match
touch {src,test}/app.{js,ts}
# Creates: src/app.js  src/app.ts  test/app.js  test/app.ts
# (directories must already exist)

# Create directories with sub-structure
mkdir -p project/{src,test}/{unit,integration}
```

### Alphabetic Ranges

```bash
# Letter sequences
touch file_{a..z}.txt
# Creates: file_a.txt through file_z.txt

# Uppercase
mkdir dir_{A..F}
# Creates: dir_A through dir_F
```

### Step Values

```bash
# Every other number
touch even{2..20..2}.txt
# Creates: even2.txt, even4.txt, ... even20.txt

# Every 5th number
mkdir batch{0..100..5}
# Creates: batch0, batch5, batch10, ... batch100
```

### Try It Yourself

```bash
# Create a complete blog structure
mkdir -p blog
cd blog
mkdir -p posts/{2023,2024}/{01..12}
touch posts/2024/01/first-post.md
touch posts/2024/01/second-post.md

tree posts -L 2

# Create test data files
touch data/sample{001..020}.csv

# Create a multi-file component structure
mkdir -p components/{Header,Footer,Sidebar,Nav}
touch components/{Header,Footer,Sidebar,Nav}/index.{jsx,css,test.jsx}
tree components
```

---

## Template Files: Copying Templates

Instead of creating files from scratch every time, copy from templates.

### Simple Copy

```bash
# Create a template once
cat > ~/.templates/component.jsx << 'EOF'
import React from "react";

const ComponentName = () => {
  return (
    <div>
      <h1>ComponentName</h1>
    </div>
  );
};

export default ComponentName;
EOF

# Use the template
cp ~/.templates/component.jsx ./Header.jsx
```

### Template with sed Replacement

```bash
# Copy and replace placeholder
cp ~/.templates/component.jsx ./Header.jsx
sed -i 's/ComponentName/Header/g' Header.jsx

# Or do it in one command:
sed 's/ComponentName/Header/g' ~/.templates/component.jsx > Header.jsx
```

### Template Directory Structure

```bash
# Create a template structure
mkdir -p ~/.templates/express-project/{src/{routes,middleware,models},tests,config}
touch ~/.templates/express-project/{package.json,README.md,.gitignore,.env.example}
touch ~/.templates/express-project/src/{index.js,app.js}

# Copy template to start new project
cp -r ~/.templates/express-project ~/Projects/my-new-api
cd ~/Projects/my-new-api
tree
```

### Try It Yourself

```bash
# Create a reusable script template
mkdir -p ~/.templates
cat > ~/.templates/bash-script.sh << 'EOF'
#!/bin/bash
# Script: SCRIPT_NAME
# Description: SCRIPT_DESC
# Author: $USER
# Date: $(date +%Y-%m-%d)

set -euo pipefail

main() {
    echo "Running SCRIPT_NAME..."
    # Your code here
}

main "$@"
EOF

# Use it
cp ~/.templates/bash-script.sh ./my-task.sh
chmod +x my-task.sh
```

---

## Best Practices: Naming Conventions

Good naming makes your life easier. Follow these conventions:

### Use Lowercase

```bash
# Good
touch readme.md
mkdir src

# Avoid (creates confusion)
touch README.md  # (this one is actually a convention for READMEs)
mkdir Src        # Inconsistent
```

### Use Hyphens or Underscores (Not Spaces)

```bash
# Good
touch my-project-notes.md
touch user_config.json
mkdir my-web-app

# Bad (spaces cause problems)
touch "my project notes.md"    # Requires quotes everywhere
mkdir "my web app"             # Tab completion gets confused
```

### Why Spaces Are Problematic

```bash
# With spaces, you need quotes everywhere:
cat "my file.txt"
cd "my folder"
cp "file name.txt" "other place/"

# Without spaces, life is simple:
cat my-file.txt
cd my-folder
cp file-name.txt other-place/
```

### Consistent Extensions

```bash
# Be consistent with extensions
touch config.json       # JSON config
touch config.yaml       # YAML config (pick one style)
touch setup.sh          # Shell scripts get .sh
touch Makefile          # Makefiles have no extension (convention)
```

### Descriptive Names

```bash
# Good — descriptive and clear
touch database-migration-001.sql
touch user-authentication.test.js
mkdir deployment-scripts

# Bad — vague
touch file1.sql
touch test.js
mkdir stuff
```

### Hidden Files (dot files)

```bash
# Start with a dot for configuration/hidden files
touch .env              # Environment variables
touch .gitignore        # Git ignore rules
touch .eslintrc.json    # ESLint config
mkdir .config           # Configuration directory

# These won't show with plain `ls` (need `ls -a`)
```

### Try It Yourself

```bash
# Create a well-named project
mkdir -p my-blog-app/{src,tests,docs,config}
touch my-blog-app/{README.md,.gitignore,.env.example}
touch my-blog-app/src/{server.js,database.js}
touch my-blog-app/config/{development.json,production.json}
touch my-blog-app/tests/server.test.js

tree my-blog-app
```

---

## Practical Exercises

### Exercise 1: Create a Web Project

```bash
# Create this structure in /tmp:
cd /tmp
mkdir -p web-project

cd web-project

# Create directories
mkdir -p {public/{css,js,images},src/{components,pages,utils},tests}

# Create main files
touch public/index.html
touch public/css/{styles,reset,responsive}.css
touch public/js/{main,utils}.js
touch src/components/{Header,Footer,Sidebar,Modal}.jsx
touch src/pages/{Home,About,Contact,Blog}.jsx
touch src/utils/{api,helpers,constants}.js
touch tests/{components,pages,utils}.test.js
touch {package.json,README.md,.gitignore,.env}

# Verify
tree
```

### Exercise 2: Create a Blog Structure

```bash
cd /tmp
mkdir blog-project && cd blog-project

# Create year/month structure
mkdir -p posts/{2023,2024}/{01..12}

# Add some posts
echo "# My First Post" > posts/2024/01/hello-world.md
echo "# Learning Linux" > posts/2024/01/linux-basics.md
echo "# Shell Scripting" > posts/2024/02/shell-scripts.md

# Create static assets
mkdir -p static/{images,css,js}
touch static/css/{main,blog,syntax-highlighting}.css

# Create config
echo "title: My Blog" > config.yaml

tree -L 3
```

### Exercise 3: Create a Node.js API Project

```bash
cd /tmp
mkdir -p node-api && cd node-api

# Create the structure
mkdir -p src/{routes,controllers,models,middleware,services}
mkdir -p tests/{unit,integration}
mkdir -p config

# Create entry point
cat > src/index.js << 'EOF'
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create route files
touch src/routes/{users,posts,auth}.js
touch src/controllers/{users,posts,auth}.js
touch src/models/{User,Post}.js
touch src/middleware/{auth,error,validate}.js

# Create config files
touch {package.json,.env,.env.example,.gitignore,README.md}

# Verify
tree
```

### Exercise 4: Brace Expansion Challenge

```bash
cd /tmp
mkdir brace-practice && cd brace-practice

# Challenge 1: Create files test-01.txt through test-20.txt
touch test-{01..20}.txt
ls

# Challenge 2: Create directories for months
mkdir month-{01..12}
ls

# Challenge 3: Create a matrix of files
mkdir -p {dev,staging,production}
touch {dev,staging,production}/{app,db,cache}.config
tree

# Challenge 4: Create numbered backups
touch backup-{001..005}-$(date +%Y%m%d).tar.gz
ls backup*
```

### Exercise 5: Project Template Script

```bash
# Create a reusable function to scaffold projects
create_project() {
  local name=$1
  mkdir -p "$name"/{src,tests,docs,scripts,config}
  touch "$name"/{README.md,.gitignore,package.json}
  touch "$name"/src/{index.js,app.js}
  touch "$name"/tests/app.test.js
  touch "$name"/docs/API.md
  echo "# $name" > "$name"/README.md
  echo "Project '$name' created!"
  tree "$name"
}

# Use it!
create_project my-awesome-app
create_project another-project
```

---

## Quick Reference

| Command | What It Does | Example |
|---------|-------------|---------|
| `touch file` | Create empty file | `touch notes.txt` |
| `touch f1 f2 f3` | Create multiple files | `touch a.txt b.txt` |
| `mkdir dir` | Create directory | `mkdir src` |
| `mkdir -p a/b/c` | Create nested dirs | `mkdir -p src/lib/utils` |
| `echo "text" > file` | Create file with content | `echo "hi" > hello.txt` |
| `echo "text" >> file` | Append to file | `echo "more" >> hello.txt` |
| `cat > file << EOF` | Heredoc (multi-line) | See examples above |
| `touch f{1..10}` | Brace expansion | `touch ch{01..12}.md` |
| `mkdir {a,b,c}` | Multiple dirs at once | `mkdir {src,test,docs}` |
| `cp template new` | Copy a template | `cp tpl.html page.html` |

---

## Summary

You can now create any file system structure you need:

- **touch** — create empty files or update timestamps
- **mkdir** and **mkdir -p** — create directories (including nested)
- **echo >** and **cat << EOF** — create files with content
- **Brace expansion** — generate many files/dirs in one command `{a,b,c}` and `{1..10}`
- **Templates** — copy and customize reusable structures
- **Naming conventions** — lowercase, hyphens, no spaces, descriptive names

The combination of `mkdir -p` and brace expansion can create entire project scaffolding in a single command!

In the next lesson, you'll learn how to view and read file contents without opening an editor.
