---
title: TypeScript tsconfig.json
---

# TypeScript tsconfig.json

The `tsconfig.json` file is the configuration file for a TypeScript project. It specifies the root files and the compiler options required to compile the project.

When you run the `tsc` command without specifying an input file, the compiler looks for a `tsconfig.json` in the current directory or parent directories.

---

## Creating a tsconfig.json

You can easily generate a default configuration file by running:

```bash
tsc --init
```

This creates a `tsconfig.json` file with dozens of available options (most of them commented out) and helpful descriptions.

---

## Important Compiler Options

The configuration is placed inside a `"compilerOptions"` object. Here are some of the most critical options:

### 1. `target`

Specifies the JavaScript version that TypeScript will compile down to.

- E.g., `"ES5"`, `"ES6"`, `"ES2020"`, `"ESNext"`.
- If you are building for older browsers, use `"ES5"`. For modern Node.js or modern browsers, use `"ES2022"` or `"ESNext"`.

### 2. `module`

Specifies the module system used in the generated JavaScript.

- E.g., `"CommonJS"` (for Node.js), `"ESNext"` (for modern bundlers like Vite or Webpack).

### 3. `outDir`

Specifies the folder where the compiled JavaScript files should be placed.

- E.g., `"./dist"` or `"./build"`.

### 4. `rootDir`

Specifies the root folder of your source TypeScript files. This helps maintain the directory structure in your `outDir`.

- E.g., `"./src"`.

### 5. `strict`

Enables a suite of strict type-checking options. It is **highly recommended** to set this to `true`.

- It enables `strictNullChecks`, `noImplicitAny`, and other safety flags simultaneously.

---

## Example Configuration

Here is a common, modern configuration setup:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

- **`include`**: Specifies an array of filenames or patterns to include in the program.
- **`exclude`**: Specifies an array of filenames or patterns that should be skipped during compilation.
