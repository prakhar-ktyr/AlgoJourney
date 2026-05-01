---
title: JavaScript Introduction
---

# JavaScript Introduction

## What is JavaScript?

JavaScript is a **high-level, interpreted, dynamically-typed, multi-paradigm programming language**. It was created by **Brendan Eich** at Netscape in May 1995 — famously written in just ten days — to add interactivity to web pages. Today it is standardized as **ECMAScript** and maintained by the TC39 committee, which ships a new version of the language every June.

Despite the name, JavaScript has nothing to do with Java. The name was a marketing decision in 1995, when Java was the hottest language on Earth. The two share C-like syntax and almost nothing else.

## Where JavaScript runs

- **Every web browser** — Chrome (V8), Firefox (SpiderMonkey), Safari (JavaScriptCore), Edge (V8). It is the only language all browsers natively understand.
- **Servers** — Node.js, Deno, and Bun let you run JavaScript outside the browser to build APIs, CLIs, and tools.
- **Desktop apps** — Electron (VS Code, Slack, Discord, WhatsApp Desktop) wraps a Chromium engine around your code.
- **Mobile apps** — React Native (Instagram, Discord), Expo, Capacitor, Ionic.
- **Embedded & IoT** — Espruino runs JS on microcontrollers; Johnny-Five drives robotics.
- **Edge computing** — Cloudflare Workers, Vercel Edge, Deno Deploy execute JS at the network edge.
- **Build tooling** — Vite, webpack, esbuild, Rollup, Prettier, ESLint — the toolchain for every modern web project is itself written in JS.

## Why learn JavaScript?

1. **Universal.** It is the only language that runs natively in every browser. You cannot build a modern interactive website without it.
2. **One language, full stack.** Front end (React, Vue, Svelte), back end (Node, Express, Fastify), database queries (MongoDB, Prisma), tests (Vitest, Jest), build scripts — all the same language.
3. **Largest ecosystem on Earth.** npm hosts over 3 million packages. Whatever you want to do, someone has packaged it.
4. **Job market.** JavaScript is the most-used language on the Stack Overflow Developer Survey every year since 2013.
5. **Beginner friendly.** No compilation, no `main()` function, no project setup — open the browser console and start typing.

## What JavaScript is _not_

JavaScript's strengths come with trade-offs you should know about up front:

- **Not the fastest language for CPU work.** It is JIT-compiled and very fast for what it is, but pure number-crunching loops are still slower than C, Rust, or Go.
- **Dynamically typed.** Type errors happen at runtime. We will cover **TypeScript** later, which restores compile-time safety.
- **Quirky equality and coercion.** `[] == ![]` is `true`. `0 == "0"` is `true`. Nearly every JavaScript book has a chapter on the parts to avoid. We'll teach you the safe subset from day one.
- **Single-threaded.** All JavaScript runs on one main thread. For parallelism you use `async`/`await`, Web Workers, or worker threads in Node.

## ECMAScript versions you will hear about

| Version       | Year | Highlights                                                              |
| ------------- | ---- | ----------------------------------------------------------------------- |
| ES5           | 2009 | `strict mode`, JSON, `Array.prototype.forEach`/`map`/`filter`           |
| ES6 / ES2015  | 2015 | `let`/`const`, arrow functions, classes, modules, promises, `Map`/`Set` |
| ES2017        | 2017 | `async`/`await`, `Object.entries`                                       |
| ES2020        | 2020 | optional chaining `?.`, nullish coalescing `??`, `BigInt`               |
| ES2021        | 2021 | `String.prototype.replaceAll`, logical assignment `||=` `&&=` `??=`     |
| ES2022        | 2022 | top-level `await`, class fields, `Array.prototype.at`                   |
| ES2023        | 2023 | `Array.prototype.findLast`, `toSorted`/`toReversed` (immutable)         |
| ES2024 / 2025 | 2024 | `Promise.withResolvers`, `Object.groupBy`, decorators                   |

This course assumes a modern engine (any browser from the last three years, or Node.js 20+). Everything you learn works in current Chrome, Firefox, Safari, and Edge.

## JavaScript engines

The "JavaScript" you run in a browser is executed by an engine — a sophisticated piece of software that parses, optimizes, and runs your code:

- **V8** — Google's engine, powers Chrome, Edge, Node.js, Deno, and Cloudflare Workers.
- **SpiderMonkey** — Mozilla's engine, the very first JavaScript engine, powers Firefox.
- **JavaScriptCore (Nitro)** — Apple's engine, powers Safari and Bun.
- **Hermes** — Meta's engine optimized for React Native on mobile.

You don't pick an engine — your runtime does. Just write standard JavaScript and it works everywhere.

## Next step

Now that you know what JavaScript is and why it matters, let's run your first program — both in the browser and on your machine.
