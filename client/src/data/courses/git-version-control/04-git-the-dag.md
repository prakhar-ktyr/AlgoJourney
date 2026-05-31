---
title: The DAG Model
section: Git Internals (Deep Dive)
---

# The Directed Acyclic Graph (DAG)

Now that you know how Git stores Blobs, Trees, and Commits, we can zoom out and look at the mathematical model that ties the entire repository together: The **DAG**.

DAG stands for **Directed Acyclic Graph**.

- **Graph**: A collection of nodes connected by edges.
- **Directed**: The edges have a specific direction (they are one-way streets).
- **Acyclic**: There are no loops. If you follow the directed edges, you can never return to a node you have already visited.

## Commits as Nodes

In Git, every Commit object is a node in the DAG.

When you make a commit, it contains a pointer to its parent commit (the commit that came directly before it).

```text
Commit A <-- Commit B <-- Commit C
```

The direction of the edge is backwards in time. `Commit C` points to `Commit B`, meaning `B` is the parent of `C`. Because time only moves forward, the graph is strictly acyclic—you can never create a commit that points to a child in the future.

## Branching in the DAG

When multiple people work on a project simultaneously, the graph branches out.

Imagine you are on `Commit B` and you create a branch called `feature`. You make `Commit D`. Meanwhile, your coworker stays on the main branch and makes `Commit C`.

```text
          <-- Commit C (main)
         /
Commit A <-- Commit B
         \
          <-- Commit D (feature)
```

The DAG now has two distinct paths. Both `C` and `D` point to `B` as their parent.

## Merging in the DAG

When you finish your feature, you merge it back into the main branch. A merge in Git is simply a commit that has **two parents** instead of one.

```text
          <-- Commit C <------------
         /                          \
Commit A <-- Commit B                <-- Commit E (main)
         \                          /
          <-- Commit D (feature) <-'
```

`Commit E` is the merge commit. Its parents are `Commit C` and `Commit D`.

## Why the DAG matters

Understanding that Git history is just a DAG of commits (with branches acting as temporary sticky-notes pointing to specific nodes) is the key to unlocking advanced Git operations.

When you run `git log`, Git starts at the node your `HEAD` pointer is currently looking at, and simply walks backward through the graph, following the parent pointers, printing out the metadata for each node it visits.

When you use advanced commands like `git rebase` or `git cherry-pick`, you are essentially telling Git: "Take this specific subgraph of nodes, mathematically sever their parent pointers, calculate new hashes, and graft them onto a different node in the graph."

## Garbage Collection in the DAG

What happens if a node has no incoming pointers?

Suppose you create a commit, but then use `git reset --hard` to move your branch pointer backwards.

```text
Commit A <-- Commit B (main)      [Commit C - Abandoned]
```

`Commit C` is now "unreachable". No branch or tag points to it, and no other commit claims it as a parent.

In Git, unreachable nodes are not deleted immediately. They sit in the `.git/objects` folder taking up space. This is actually a safety mechanism—if you accidentally reset, the object still exists and you can recover it!

Eventually, Git runs a background process called **Garbage Collection** (`git gc`), which safely deletes any nodes in the DAG that have been unreachable for over 30 days.
