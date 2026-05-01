---
title: JavaScript Get Started
---

# JavaScript Get Started

You don't need to install anything to start writing JavaScript — your browser already runs it. But for the rest of the course you'll also want **Node.js** so you can run scripts from the command line.

## Option 1: The browser console (zero install)

Every modern browser ships with developer tools. Try this right now:

1. Open a new browser tab.
2. Press **F12** (Windows/Linux) or **Cmd + Option + I** (macOS).
3. Click the **Console** tab.
4. Type the line below and press **Enter**:

```javascript
console.log("Hello from JavaScript!");
```

You should see the message printed back. Congratulations — you just ran a JavaScript program.

The console is a full **REPL** (Read–Eval–Print Loop). You can type any expression and it will print the result:

```javascript
2 + 2;            // 4
"abc".toUpperCase(); // "ABC"
[1, 2, 3].length; // 3
```

## Option 2: Inside an HTML page

To make JavaScript run as part of a web page, embed it with a `<script>` tag.

Create a file called `index.html`:

```html
<!doctype html>
<html>
  <head>
    <title>My first JS page</title>
  </head>
  <body>
    <h1>Hello, web!</h1>

    <script>
      console.log("This runs when the page loads.");
      document.querySelector("h1").textContent = "Hello from JavaScript!";
    </script>
  </body>
</html>
```

Double-click the file to open it in your browser. The `<h1>` text will be rewritten by JavaScript before you see it.

For real projects, put the JavaScript in its own file and link to it:

```html
<script src="app.js" defer></script>
```

The `defer` attribute tells the browser to download the file in parallel and execute it after the HTML is parsed — almost always what you want.

## Option 3: Install Node.js

Node.js lets you run `.js` files from the terminal, just like Python or Ruby.

1. Go to <https://nodejs.org> and download the **LTS** version.
2. Install it with the default options.
3. Open a terminal and verify the install:

```bash
node --version
# v20.11.0  (anything 20+ is great)

npm --version
# 10.2.4
```

Now create a file called `hello.js`:

```javascript
console.log("Hello from Node.js!");
console.log("Today is", new Date().toLocaleDateString());
```

Run it:

```bash
node hello.js
```

You should see both lines printed in the terminal.

## Option 4: A scratchpad in VS Code

VS Code has the best JavaScript support of any free editor:

1. Install **VS Code** from <https://code.visualstudio.com>.
2. Open a folder, create `playground.js`, and write code.
3. Press **F5**, choose **Node.js**, and the file runs in the integrated terminal.

Install the **ESLint** and **Prettier** extensions too — they catch bugs and format your code as you type. We will use both later in the course.

## The Node.js REPL

If you just want to experiment, run `node` with no arguments:

```bash
$ node
Welcome to Node.js v20.11.0.
> 1 + 1
2
> "hi".repeat(3)
'hihihi'
> .exit
```

Press **Ctrl + D** or type `.exit` to leave.

## Which one should I use while learning?

| Use case                                | Best tool                |
| --------------------------------------- | ------------------------ |
| Trying a one-liner                      | Browser console          |
| Testing a snippet repeatedly            | Node REPL                |
| Following this course's examples        | A `.js` file run by Node |
| Building anything with HTML or the DOM  | Browser + `<script>` tag |
| Real projects                           | VS Code + Node + npm     |

For the next several lessons we will mostly use the browser console and small `.js` files. Pick the workflow that feels easiest to you and let's continue.
