---
title: Reinforcement Learning Basics
---

# Reinforcement Learning Basics

**Reinforcement Learning (RL)** is a type of machine learning where an agent learns to make decisions by interacting with an environment and receiving rewards or penalties.

Unlike supervised learning (which needs labeled data), RL learns from **trial and error**.

---

## The RL Framework

```
┌─────────┐    action aₜ     ┌─────────────┐
│  Agent  │ ───────────────► │ Environment │
│         │ ◄─────────────── │             │
└─────────┘  state sₜ₊₁,    └─────────────┘
              reward rₜ₊₁
```

At each time step $t$:
1. Agent observes state $s_t$
2. Agent takes action $a_t$
3. Environment returns new state $s_{t+1}$ and reward $r_{t+1}$
4. Agent updates its strategy

The goal: **maximize cumulative reward over time**.

---

## Key Concepts

| Concept | Symbol | Description |
|---------|--------|-------------|
| State | $s$ | Current situation of the environment |
| Action | $a$ | What the agent can do |
| Reward | $r$ | Immediate feedback signal |
| Policy | $\pi(a|s)$ | Strategy: probability of taking action $a$ in state $s$ |
| Value function | $V(s)$ | Expected total reward from state $s$ |
| Q-function | $Q(s,a)$ | Expected total reward from state $s$ taking action $a$ |
| Discount factor | $\gamma$ | How much to value future vs. immediate rewards (0–1) |
| Episode | — | One complete sequence from start to terminal state |

---

## Markov Decision Process (MDP)

RL problems are formalized as **MDPs**:

- **States** $S$: all possible situations
- **Actions** $A$: all possible moves
- **Transition** $P(s'|s,a)$: probability of reaching $s'$ from $s$ via $a$
- **Reward** $R(s,a)$: immediate reward for taking action $a$ in state $s$
- **Discount** $\gamma \in [0, 1]$: importance of future rewards

The **Markov property**: the future depends only on the current state, not the history.

The **return** (cumulative discounted reward):

$$G_t = r_{t+1} + \gamma r_{t+2} + \gamma^2 r_{t+3} + \cdots = \sum_{k=0}^{\infty} \gamma^k r_{t+k+1}$$

---

## The Bellman Equation

The **value function** satisfies the Bellman equation:

$$V(s) = \max_a \left[ R(s,a) + \gamma \sum_{s'} P(s'|s,a)\, V(s') \right]$$

This says: the value of a state = best immediate reward + discounted value of the next state.

For the **Q-function**:

$$Q(s,a) = R(s,a) + \gamma \sum_{s'} P(s'|s,a) \max_{a'} Q(s', a')$$

If we know $Q(s,a)$ for all state-action pairs, the optimal policy is simply:

$$\pi^*(s) = \arg\max_a Q(s,a)$$

---

## Q-Learning

**Q-Learning** is a model-free algorithm that learns $Q(s,a)$ without knowing the transition probabilities.

### Update Rule

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ r + \gamma \max_{a'} Q(s',a') - Q(s,a) \right]$$

Where:
- $\alpha$ is the learning rate
- $r + \gamma \max_{a'} Q(s',a')$ is the **TD target** (temporal difference)
- $r + \gamma \max_{a'} Q(s',a') - Q(s,a)$ is the **TD error**

### Tabular Q-Learning

```python
import numpy as np

# Simple grid world example
num_states = 16   # 4x4 grid
num_actions = 4   # up, down, left, right

# Initialize Q-table
Q = np.zeros((num_states, num_actions))

# Hyperparameters
alpha = 0.1       # Learning rate
gamma = 0.99      # Discount factor
epsilon = 0.1     # Exploration rate
episodes = 1000

for episode in range(episodes):
    state = 0  # Start state
    done = False

    while not done:
        # Epsilon-greedy action selection
        if np.random.random() < epsilon:
            action = np.random.randint(num_actions)  # Explore
        else:
            action = np.argmax(Q[state])              # Exploit

        # Take action, observe next state and reward
        next_state, reward, done = env_step(state, action)

        # Q-Learning update
        best_next = np.max(Q[next_state])
        Q[state, action] += alpha * (
            reward + gamma * best_next - Q[state, action]
        )

        state = next_state
```

---

## Deep Q-Network (DQN)

When the state space is too large for a table (e.g., images), we use a **neural network** to approximate $Q(s,a)$.

**DQN** (Mnih et al., 2015) achieved human-level play on Atari games.

### Key Innovations

| Technique | Purpose |
|-----------|---------|
| Experience replay | Break correlation between consecutive samples |
| Target network | Stabilize training targets |
| ε-greedy | Balance exploration and exploitation |

### Experience Replay

Instead of learning from consecutive experiences (correlated), store transitions in a **replay buffer** and sample random mini-batches:

```python
from collections import deque
import random

class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            np.array(states),
            np.array(actions),
            np.array(rewards, dtype=np.float32),
            np.array(next_states),
            np.array(dones, dtype=np.float32),
        )

    def __len__(self):
        return len(self.buffer)
```

### Target Network

Use a **separate network** for computing targets, updated less frequently:

$$L = \left( r + \gamma \max_{a'} Q_{\text{target}}(s', a') - Q_{\text{online}}(s, a) \right)^2$$

---

## Code: DQN for CartPole

```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import gymnasium as gym
from collections import deque
import random


class DQN(nn.Module):
    """Deep Q-Network."""

    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
        )

    def forward(self, x):
        return self.network(x)


class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.FloatTensor(np.array(states)),
            torch.LongTensor(actions),
            torch.FloatTensor(rewards),
            torch.FloatTensor(np.array(next_states)),
            torch.FloatTensor(dones),
        )

    def __len__(self):
        return len(self.buffer)


def train_dqn():
    # Environment
    env = gym.make("CartPole-v1")
    state_dim = env.observation_space.shape[0]  # 4
    action_dim = env.action_space.n              # 2

    # Networks
    policy_net = DQN(state_dim, action_dim)
    target_net = DQN(state_dim, action_dim)
    target_net.load_state_dict(policy_net.state_dict())

    optimizer = optim.Adam(policy_net.parameters(), lr=1e-3)
    buffer = ReplayBuffer(capacity=10000)

    # Hyperparameters
    gamma = 0.99
    epsilon_start = 1.0
    epsilon_end = 0.01
    epsilon_decay = 500
    batch_size = 64
    target_update = 10  # Update target net every N episodes

    episode_rewards = []

    for episode in range(300):
        state, _ = env.reset()
        total_reward = 0

        # Epsilon decay
        epsilon = epsilon_end + (epsilon_start - epsilon_end) * \
            np.exp(-episode / epsilon_decay)

        while True:
            # Epsilon-greedy action selection
            if random.random() < epsilon:
                action = env.action_space.sample()
            else:
                with torch.no_grad():
                    state_tensor = torch.FloatTensor(state).unsqueeze(0)
                    q_values = policy_net(state_tensor)
                    action = q_values.argmax().item()

            # Step environment
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            # Store transition
            buffer.push(state, action, reward, next_state, float(done))
            state = next_state
            total_reward += reward

            # Train if buffer has enough samples
            if len(buffer) >= batch_size:
                states, actions, rewards, next_states, dones = \
                    buffer.sample(batch_size)

                # Current Q-values
                current_q = policy_net(states).gather(1, actions.unsqueeze(1))

                # Target Q-values (from target network)
                with torch.no_grad():
                    max_next_q = target_net(next_states).max(1)[0]
                    target_q = rewards + gamma * max_next_q * (1 - dones)

                # Loss and update
                loss = nn.MSELoss()(current_q.squeeze(), target_q)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            if done:
                break

        episode_rewards.append(total_reward)

        # Update target network
        if episode % target_update == 0:
            target_net.load_state_dict(policy_net.state_dict())

        if (episode + 1) % 50 == 0:
            avg_reward = np.mean(episode_rewards[-50:])
            print(f"Episode {episode+1}, Avg Reward: {avg_reward:.1f}, "
                  f"Epsilon: {epsilon:.3f}")

    env.close()
    return policy_net


# Train the agent
model = train_dqn()
```

---

## Policy Gradient Methods

Instead of learning $Q(s,a)$ and deriving a policy, **policy gradient** methods learn the policy directly.

### REINFORCE Algorithm

The policy $\pi_\theta(a|s)$ is a neural network. We optimize:

$$\nabla J(\theta) = \mathbb{E}\left[\nabla \log \pi_\theta(a|s) \cdot G_t\right]$$

Where $G_t$ is the return from time $t$.

```python
class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
            nn.Softmax(dim=-1),
        )

    def forward(self, x):
        return self.network(x)


def reinforce_update(policy, optimizer, episode_log_probs, episode_rewards, gamma):
    # Compute discounted returns
    returns = []
    G = 0
    for r in reversed(episode_rewards):
        G = r + gamma * G
        returns.insert(0, G)
    returns = torch.FloatTensor(returns)

    # Normalize returns (reduce variance)
    returns = (returns - returns.mean()) / (returns.std() + 1e-8)

    # Policy gradient loss
    loss = 0
    for log_prob, G_t in zip(episode_log_probs, returns):
        loss -= log_prob * G_t  # Negative because we maximize

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

---

## Actor-Critic

**Actor-Critic** combines value-based and policy-based methods:

- **Actor**: the policy network $\pi_\theta(a|s)$ — decides actions
- **Critic**: the value network $V_\phi(s)$ — evaluates how good a state is

The advantage:

$$A(s, a) = r + \gamma V(s') - V(s)$$

Update the actor using the advantage (lower variance than raw returns).

```python
class ActorCritic(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
        )
        self.actor = nn.Linear(128, action_dim)   # Policy head
        self.critic = nn.Linear(128, 1)           # Value head

    def forward(self, x):
        shared = self.shared(x)
        action_probs = torch.softmax(self.actor(shared), dim=-1)
        value = self.critic(shared)
        return action_probs, value
```

---

## PPO (Proximal Policy Optimization)

**PPO** (Schulman et al., 2017) is the most popular RL algorithm today (used for ChatGPT's RLHF).

Key idea: limit how much the policy changes in one update using a clipped objective:

$$L^{CLIP}(\theta) = \mathbb{E}\left[\min\left(r_t(\theta) A_t,\ \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) A_t\right)\right]$$

Where $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}$ is the probability ratio.

This prevents destructively large policy updates.

---

## RL vs. Supervised Learning

| Aspect | Supervised Learning | Reinforcement Learning |
|--------|--------------------|-----------------------|
| Data | Fixed dataset with labels | Generated by interaction |
| Feedback | Correct answer given | Only a reward signal |
| Timing | Immediate feedback | Delayed rewards |
| Exploration | Not needed | Critical (explore vs exploit) |
| Stationarity | Data is i.i.d. | Distribution changes as policy changes |
| Goal | Minimize prediction error | Maximize cumulative reward |

---

## RL Applications

| Domain | Example |
|--------|---------|
| Games | AlphaGo, Atari, StarCraft II |
| Robotics | Manipulation, locomotion |
| NLP | RLHF for language models |
| Finance | Portfolio optimization |
| Autonomous driving | Decision making |
| Resource management | Data center cooling |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| RL framework | Agent, environment, state, action, reward |
| MDP | Formal model for sequential decisions |
| Q-Learning | Learn action-value function, off-policy |
| DQN | Neural network Q-function + replay + target net |
| Policy Gradient | Learn policy directly, REINFORCE |
| Actor-Critic | Policy + value networks together |
| PPO | Stable policy updates via clipping |

---

## Try It Yourself

1. Modify the DQN to solve `LunarLander-v2`
2. Implement Double DQN (use online net to select actions, target net to evaluate)
3. Add a baseline to REINFORCE to reduce variance
4. Try `stable-baselines3` library for PPO on continuous control tasks

RL is how we train agents to make **sequential decisions** — from game AI to the alignment of large language models!
