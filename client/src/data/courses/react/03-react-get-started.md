---
title: React Get Started
---

# React Get Started

To learn and test React, you should set up a React Environment on your computer.

This tutorial uses Vite to create React applications, but you can also use Create React App or Next.js. Vite is modern, extremely fast, and highly recommended for new React projects.

## What You Need

To create a React project, you must have **Node.js** installed on your machine.

* **Node.js**: A JavaScript runtime environment. You can download it from [nodejs.org](https://nodejs.org/).
* **npm** or **npm**: Node Package Manager, which comes bundled with Node.js.

## Create a React Project with Vite

Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.

Open your terminal or command prompt and run the following command to create a new React application named `my-react-app`:

```bash
npm create vite@latest my-react-app -- --template react
```

This command sets up a complete React development environment, including a development server, a build script, and basic configuration files.

## Run the React Application

Once the setup is complete, navigate into the project folder:

```bash
cd my-react-app
```

Install the required dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

A new browser window will not pop up automatically, but your terminal will display a local URL (usually `http://localhost:5173`). Open that URL in your browser, and you will see your new React application running!

## The React Project Structure

After creating the app, your folder structure will look something like this:

* `node_modules/`: Contains all the dependencies (packages) for your app.
* `public/`: Contains static assets like `favicon.ico`.
* `src/`: The most important folder! This is where you will write your React code. It contains files like `main.jsx`, `App.jsx`, and `App.css`.
* `index.html`: The main HTML file. Vite serves this file, and your React code is injected into a `<div id="root">` inside it.
* `package.json`: Contains metadata about your project and lists the dependencies.
* `vite.config.js`: Configuration file for Vite.

## Modifying the App

Let's make our first change. Open the `src/App.jsx` file in your code editor. It will look somewhat complex, but let's replace its entire contents with this simple code:

```jsx
function App() {
  return (
    <div>
      <h1>Hello React!</h1>
      <p>I am learning React.</p>
    </div>
  );
}

export default App;
```

Save the file. Because Vite has **Hot Module Replacement (HMR)**, your browser will update instantly without you having to refresh the page. You should now see "Hello React!" on the screen.

Congratulations! You have successfully run and modified your first React application.
