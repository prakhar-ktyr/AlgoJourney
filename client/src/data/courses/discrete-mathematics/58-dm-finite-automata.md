---
title: Finite State Machines & Automata
---

# Finite State Machines & Automata

Finite automata are abstract computational models that recognize patterns in input sequences. They form the theoretical foundation for lexical analysis in compilers, regular expressions, protocol verification, and many pattern-matching algorithms.

---

## Deterministic Finite Automaton (DFA)

A **DFA** is a 5-tuple $(Q, \Sigma, \delta, q_0, F)$ where:

- $Q$ — a finite set of **states**
- $\Sigma$ — a finite **input alphabet**
- $\delta: Q \times \Sigma \to Q$ — the **transition function** (total, deterministic)
- $q_0 \in Q$ — the **start state**
- $F \subseteq Q$ — the set of **accept (final) states**

### How a DFA Processes Input

1. Begin in state $q_0$
2. Read input symbols one at a time, left to right
3. For each symbol $a$, move from current state $q$ to state $\delta(q, a)$
4. After reading all input: **accept** if the current state is in $F$; otherwise **reject**

### Example: DFA that Accepts Strings Ending in "01"

Let $\Sigma = \{0, 1\}$. We want to accept all binary strings whose last two characters are "01".

- $Q = \{q_0, q_1, q_2\}$
- Start state: $q_0$ (haven't seen the pattern yet)
- Accept states: $F = \{q_2\}$
- Transitions:

| State | Input 0 | Input 1 |
|-------|---------|---------|
| $q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_1$ | $q_2$ |
| $q_2$ | $q_1$ | $q_0$ |

**Trace:** Input "1101"
- Start: $q_0$
- Read '1': $q_0 \to q_0$
- Read '1': $q_0 \to q_0$
- Read '0': $q_0 \to q_1$
- Read '1': $q_1 \to q_2$ ✓ (accept state)

---

## Language Recognized by a DFA

The **language** of a DFA $M$, written $L(M)$, is the set of all strings that $M$ accepts:

$$L(M) = \{w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F\}$$

where $\hat{\delta}$ is the extended transition function that processes entire strings:

$$\hat{\delta}(q, \epsilon) = q$$
$$\hat{\delta}(q, wa) = \delta(\hat{\delta}(q, w), a)$$

A language $L$ is called a **regular language** if there exists some DFA $M$ with $L(M) = L$.

---

## Non-deterministic Finite Automaton (NFA)

An **NFA** is a 5-tuple $(Q, \Sigma, \delta, q_0, F)$ where:

- $\delta: Q \times (\Sigma \cup \{\epsilon\}) \to \mathcal{P}(Q)$ — the transition function maps to a **set** of states

Key differences from DFA:
1. From a state on a given input, the NFA can move to **multiple** states (or none)
2. **$\epsilon$-transitions**: the NFA can change state without consuming input
3. The NFA **accepts** if **any** sequence of choices leads to an accept state

### Example: NFA for Strings Containing "01"

$\Sigma = \{0, 1\}$, accept any string that contains the substring "01":

- $Q = \{q_0, q_1, q_2\}$
- Start: $q_0$, Accept: $F = \{q_2\}$
- Transitions:

| State | Input 0 | Input 1 | $\epsilon$ |
|-------|---------|---------|:---:|
| $q_0$ | $\{q_0, q_1\}$ | $\{q_0\}$ | $\emptyset$ |
| $q_1$ | $\emptyset$ | $\{q_2\}$ | $\emptyset$ |
| $q_2$ | $\{q_2\}$ | $\{q_2\}$ | $\emptyset$ |

From $q_0$ on input '0', we non-deterministically go to both $q_0$ and $q_1$. If any path reaches $q_2$, the string is accepted.

### NFA vs DFA: Expressive Power

**Theorem:** NFAs and DFAs recognize exactly the same class of languages (regular languages). Every NFA can be converted to an equivalent DFA.

NFAs are often easier to design, but DFAs are more efficient to simulate (no backtracking).

---

## NFA to DFA Conversion (Subset Construction)

The **subset construction** (also called the powerset construction) converts an NFA to an equivalent DFA:

### Algorithm

1. The DFA states are subsets of NFA states: $Q_{\text{DFA}} \subseteq \mathcal{P}(Q_{\text{NFA}})$
2. Start state of DFA: $\epsilon\text{-closure}(\{q_0\})$ (all states reachable from $q_0$ via $\epsilon$-transitions)
3. For each DFA state $S$ and input symbol $a$:
   $$\delta_{\text{DFA}}(S, a) = \epsilon\text{-closure}\left(\bigcup_{q \in S} \delta_{\text{NFA}}(q, a)\right)$$
4. A DFA state $S$ is accepting if $S \cap F_{\text{NFA}} \neq \emptyset$

### Example

Convert the NFA above (accepting strings containing "01"):

- Start state: $\epsilon\text{-closure}(\{q_0\}) = \{q_0\}$
- From $\{q_0\}$ on '0': $\delta(q_0, 0) = \{q_0, q_1\}$ → DFA state $\{q_0, q_1\}$
- From $\{q_0\}$ on '1': $\delta(q_0, 1) = \{q_0\}$ → stays at $\{q_0\}$
- From $\{q_0, q_1\}$ on '0': $\delta(q_0, 0) \cup \delta(q_1, 0) = \{q_0, q_1\} \cup \emptyset = \{q_0, q_1\}$
- From $\{q_0, q_1\}$ on '1': $\delta(q_0, 1) \cup \delta(q_1, 1) = \{q_0\} \cup \{q_2\} = \{q_0, q_2\}$ ✓ (accept)
- From $\{q_0, q_2\}$ on '0': $\{q_0, q_1, q_2\}$ ✓
- From $\{q_0, q_2\}$ on '1': $\{q_0, q_2\}$ ✓
- Continue until no new states...

The resulting DFA has at most $2^3 = 8$ states (usually fewer are reachable).

### Worst-Case Blowup

An NFA with $n$ states can require up to $2^n$ DFA states. In practice, the reachable subset is usually much smaller.

---

## Regular Languages and Regular Expressions

### Regular Expressions

Regular expressions define patterns over an alphabet $\Sigma$:

| Syntax | Meaning |
|--------|---------|
| $a$ (literal) | Matches the single character $a$ |
| $\epsilon$ | Matches the empty string |
| $\emptyset$ | Matches nothing |
| $R_1 \cdot R_2$ | Concatenation: $R_1$ followed by $R_2$ |
| $R_1 \mid R_2$ | Union: $R_1$ or $R_2$ |
| $R^*$ | Kleene star: zero or more repetitions of $R$ |

### Equivalence

**Kleene's Theorem:** A language is regular if and only if it can be described by a regular expression.

$$\text{Regular expressions} \equiv \text{NFAs} \equiv \text{DFAs}$$

### Examples

| Regular Expression | Language |
|---|---|
| $(0 \mid 1)^*01$ | All binary strings ending in "01" |
| $a^*b^*$ | Zero or more $a$'s followed by zero or more $b$'s |
| $(ab)^*$ | Even-length strings alternating $a$ and $b$: $\epsilon, ab, abab, \ldots$ |
| $\Sigma^*$ | All strings over $\Sigma$ |

---

## Closure Properties of Regular Languages

Regular languages are closed under:

- **Union:** $L_1 \cup L_2$ is regular if $L_1$ and $L_2$ are
- **Intersection:** $L_1 \cap L_2$ is regular
- **Complement:** $\overline{L}$ is regular (swap accept/non-accept states in DFA)
- **Concatenation:** $L_1 \cdot L_2$ is regular
- **Kleene star:** $L^*$ is regular
- **Reversal:** $L^R$ is regular

---

## The Pumping Lemma

The pumping lemma provides a tool for proving that certain languages are **not** regular.

### Statement

If $L$ is a regular language, then there exists a constant $p$ (the "pumping length") such that for every string $w \in L$ with $|w| \geq p$, we can write $w = xyz$ where:

1. $|y| > 0$ (the pumped portion is non-empty)
2. $|xy| \leq p$ (the pump occurs within the first $p$ characters)
3. $xy^iz \in L$ for all $i \geq 0$ (we can "pump" $y$ any number of times)

### Example: $L = \{0^n 1^n \mid n \geq 0\}$ is Not Regular

Proof by contradiction using the pumping lemma:

1. Assume $L$ is regular with pumping length $p$
2. Choose $w = 0^p 1^p \in L$ (clearly $|w| = 2p \geq p$)
3. Write $w = xyz$ where $|xy| \leq p$ and $|y| > 0$
4. Since $|xy| \leq p$, both $x$ and $y$ consist entirely of 0's: $y = 0^k$ for some $k \geq 1$
5. Pump: $xy^0z = xz = 0^{p-k}1^p$. Since $k \geq 1$, we have fewer 0's than 1's → $xz \notin L$
6. Contradiction! Therefore $L$ is not regular.

This proves that a simple DFA/NFA cannot count and match quantities — we need more powerful models (like pushdown automata or Turing machines).

---

## Applications

### Lexical Analysis (Compilers)

Tokenizers in compilers use DFAs to recognize:
- Identifiers: `[a-zA-Z_][a-zA-Z0-9_]*`
- Numbers: `[0-9]+(\.[0-9]+)?`
- Keywords: `if|else|while|for|return`
- Operators: `\+\+|--|==|!=`

Tools like **lex** and **flex** compile regular expressions into efficient DFA-based scanners.

### Pattern Matching

Regular expressions in `grep`, `sed`, and programming languages are directly implemented using NFA/DFA engines.

### Protocol Design and Verification

Network protocols (TCP, HTTP) can be modeled as finite state machines:
- States represent protocol phases (LISTEN, SYN_SENT, ESTABLISHED, etc.)
- Transitions model events (receive SYN, send ACK, timeout)
- Verification checks that no invalid state is reachable

### Hardware Controllers

Vending machines, traffic lights, elevators — any system with finite memory and discrete inputs/outputs can be modeled as a finite state machine.

---

## Code: Implement a Simple DFA

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
using namespace std;

class DFA {
    int numStates;
    int startState;
    unordered_set<int> acceptStates;
    // transitions[state][symbol] = nextState
    vector<unordered_map<char, int>> transitions;

public:
    DFA(int numStates, int startState, unordered_set<int> acceptStates)
        : numStates(numStates), startState(startState),
          acceptStates(acceptStates), transitions(numStates) {}

    void addTransition(int from, char symbol, int to) {
        transitions[from][symbol] = to;
    }

    bool accepts(const string& input) {
        int current = startState;
        for (char c : input) {
            if (transitions[current].find(c) == transitions[current].end()) {
                return false; // No transition defined → reject (dead state)
            }
            current = transitions[current][c];
        }
        return acceptStates.count(current) > 0;
    }

    void trace(const string& input) {
        int current = startState;
        cout << "Input: \"" << input << "\"" << endl;
        cout << "  q" << current;

        for (char c : input) {
            if (transitions[current].find(c) == transitions[current].end()) {
                cout << " --" << c << "--> DEAD (reject)" << endl;
                return;
            }
            int next = transitions[current][c];
            cout << " --" << c << "--> q" << next;
            current = next;
        }

        cout << (acceptStates.count(current) ? " [ACCEPT]" : " [REJECT]") << endl;
    }
};

int main() {
    cout << "=== DFA: Accepts binary strings ending in '01' ===" << endl;

    // States: q0, q1, q2. Accept: q2.
    DFA dfa(3, 0, {2});
    dfa.addTransition(0, '0', 1);
    dfa.addTransition(0, '1', 0);
    dfa.addTransition(1, '0', 1);
    dfa.addTransition(1, '1', 2);
    dfa.addTransition(2, '0', 1);
    dfa.addTransition(2, '1', 0);

    // Test strings
    vector<string> tests = {"01", "001", "1101", "10", "0", "1", "0101", ""};
    for (const string& s : tests) {
        dfa.trace(s);
    }

    cout << "\n=== DFA: Accepts strings with even number of 0's ===" << endl;

    // States: q0 (even 0s), q1 (odd 0s). Accept: q0.
    DFA dfa2(2, 0, {0});
    dfa2.addTransition(0, '0', 1);
    dfa2.addTransition(0, '1', 0);
    dfa2.addTransition(1, '0', 0);
    dfa2.addTransition(1, '1', 1);

    vector<string> tests2 = {"", "1", "0", "00", "010", "0110"};
    for (const string& s : tests2) {
        cout << "  \"" << s << "\" → " << (dfa2.accepts(s) ? "ACCEPT" : "REJECT") << endl;
    }

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class DFA
{
    private int numStates;
    private int startState;
    private HashSet<int> acceptStates;
    private Dictionary<char, int>[] transitions;

    public DFA(int numStates, int startState, HashSet<int> acceptStates)
    {
        this.numStates = numStates;
        this.startState = startState;
        this.acceptStates = acceptStates;
        transitions = new Dictionary<char, int>[numStates];
        for (int i = 0; i < numStates; i++)
            transitions[i] = new Dictionary<char, int>();
    }

    public void AddTransition(int from, char symbol, int to)
    {
        transitions[from][symbol] = to;
    }

    public bool Accepts(string input)
    {
        int current = startState;
        foreach (char c in input)
        {
            if (!transitions[current].ContainsKey(c))
                return false;
            current = transitions[current][c];
        }
        return acceptStates.Contains(current);
    }

    public void Trace(string input)
    {
        int current = startState;
        Console.Write($"  \"{input}\": q{current}");

        foreach (char c in input)
        {
            if (!transitions[current].ContainsKey(c))
            {
                Console.WriteLine($" --{c}--> DEAD [REJECT]");
                return;
            }
            current = transitions[current][c];
            Console.Write($" --{c}--> q{current}");
        }
        Console.WriteLine(acceptStates.Contains(current) ? " [ACCEPT]" : " [REJECT]");
    }

    static void Main()
    {
        Console.WriteLine("=== DFA: Binary strings ending in '01' ===\n");

        var dfa = new DFA(3, 0, new HashSet<int> { 2 });
        dfa.AddTransition(0, '0', 1);
        dfa.AddTransition(0, '1', 0);
        dfa.AddTransition(1, '0', 1);
        dfa.AddTransition(1, '1', 2);
        dfa.AddTransition(2, '0', 1);
        dfa.AddTransition(2, '1', 0);

        string[] tests = { "01", "001", "1101", "10", "0", "1", "0101", "" };
        foreach (string s in tests)
            dfa.Trace(s);

        // NFA to DFA subset construction demonstration
        Console.WriteLine("\n=== Subset Construction (NFA → DFA) ===");
        Console.WriteLine("NFA states: {q0, q1, q2}");
        Console.WriteLine("Alphabet: {0, 1}");
        Console.WriteLine("NFA transitions:");
        Console.WriteLine("  q0 --0--> {q0, q1}");
        Console.WriteLine("  q0 --1--> {q0}");
        Console.WriteLine("  q1 --1--> {q2}");
        Console.WriteLine("  q2 --0,1--> {q2}");
        Console.WriteLine("\nDFA states (subsets):");
        Console.WriteLine("  {q0} --0--> {q0,q1}");
        Console.WriteLine("  {q0} --1--> {q0}");
        Console.WriteLine("  {q0,q1} --0--> {q0,q1}");
        Console.WriteLine("  {q0,q1} --1--> {q0,q2}*");
        Console.WriteLine("  {q0,q2}* --0--> {q0,q1,q2}*");
        Console.WriteLine("  {q0,q2}* --1--> {q0,q2}*");
    }
}
```

```java
import java.util.*;

public class FiniteAutomaton {

    // DFA implementation
    static class DFA {
        int numStates, startState;
        Set<Integer> acceptStates;
        Map<Character, Integer>[] transitions;

        @SuppressWarnings("unchecked")
        DFA(int numStates, int startState, Set<Integer> acceptStates) {
            this.numStates = numStates;
            this.startState = startState;
            this.acceptStates = acceptStates;
            this.transitions = new HashMap[numStates];
            for (int i = 0; i < numStates; i++)
                transitions[i] = new HashMap<>();
        }

        void addTransition(int from, char symbol, int to) {
            transitions[from].put(symbol, to);
        }

        boolean accepts(String input) {
            int current = startState;
            for (char c : input.toCharArray()) {
                if (!transitions[current].containsKey(c)) return false;
                current = transitions[current].get(c);
            }
            return acceptStates.contains(current);
        }

        String trace(String input) {
            StringBuilder sb = new StringBuilder();
            int current = startState;
            sb.append("q").append(current);

            for (char c : input.toCharArray()) {
                if (!transitions[current].containsKey(c)) {
                    sb.append(" --").append(c).append("--> DEAD");
                    return sb.toString() + " [REJECT]";
                }
                current = transitions[current].get(c);
                sb.append(" --").append(c).append("--> q").append(current);
            }
            sb.append(acceptStates.contains(current) ? " [ACCEPT]" : " [REJECT]");
            return sb.toString();
        }
    }

    // NFA implementation with subset construction
    static class NFA {
        int numStates, startState;
        Set<Integer> acceptStates;
        // transitions[state][symbol] = set of next states ('\0' for epsilon)
        Map<Character, Set<Integer>>[] transitions;

        @SuppressWarnings("unchecked")
        NFA(int numStates, int startState, Set<Integer> acceptStates) {
            this.numStates = numStates;
            this.startState = startState;
            this.acceptStates = acceptStates;
            transitions = new HashMap[numStates];
            for (int i = 0; i < numStates; i++)
                transitions[i] = new HashMap<>();
        }

        void addTransition(int from, char symbol, int to) {
            transitions[from].computeIfAbsent(symbol, k -> new HashSet<>()).add(to);
        }

        Set<Integer> epsilonClosure(Set<Integer> states) {
            Set<Integer> closure = new HashSet<>(states);
            Deque<Integer> stack = new ArrayDeque<>(states);
            while (!stack.isEmpty()) {
                int s = stack.pop();
                Set<Integer> epsTargets = transitions[s].getOrDefault('\0', Collections.emptySet());
                for (int t : epsTargets) {
                    if (closure.add(t)) stack.push(t);
                }
            }
            return closure;
        }

        Set<Integer> move(Set<Integer> states, char symbol) {
            Set<Integer> result = new HashSet<>();
            for (int s : states) {
                result.addAll(transitions[s].getOrDefault(symbol, Collections.emptySet()));
            }
            return result;
        }

        // Convert this NFA to a DFA using subset construction
        DFA toDFA(char[] alphabet) {
            Map<Set<Integer>, Integer> stateMap = new HashMap<>();
            List<Set<Integer>> dfaStates = new ArrayList<>();
            Queue<Set<Integer>> worklist = new LinkedList<>();

            Set<Integer> start = epsilonClosure(Set.of(startState));
            stateMap.put(start, 0);
            dfaStates.add(start);
            worklist.add(start);

            List<Map<Character, Integer>> dfaTransitions = new ArrayList<>();

            while (!worklist.isEmpty()) {
                Set<Integer> current = worklist.poll();
                int currentId = stateMap.get(current);
                dfaTransitions.add(new HashMap<>());

                for (char a : alphabet) {
                    Set<Integer> next = epsilonClosure(move(current, a));
                    if (next.isEmpty()) continue;

                    if (!stateMap.containsKey(next)) {
                        stateMap.put(next, dfaStates.size());
                        dfaStates.add(next);
                        worklist.add(next);
                    }
                    dfaTransitions.get(currentId).put(a, stateMap.get(next));
                }
            }

            // Determine accept states
            Set<Integer> dfaAccept = new HashSet<>();
            for (int i = 0; i < dfaStates.size(); i++) {
                for (int s : dfaStates.get(i)) {
                    if (acceptStates.contains(s)) {
                        dfaAccept.add(i);
                        break;
                    }
                }
            }

            // Build DFA
            DFA dfa = new DFA(dfaStates.size(), 0, dfaAccept);
            for (int i = 0; i < dfaTransitions.size(); i++) {
                for (var entry : dfaTransitions.get(i).entrySet()) {
                    dfa.addTransition(i, entry.getKey(), entry.getValue());
                }
            }

            System.out.println("Subset construction: " + numStates + " NFA states → " + dfaStates.size() + " DFA states");
            return dfa;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== DFA: Binary strings ending in '01' ===\n");

        DFA dfa = new DFA(3, 0, Set.of(2));
        dfa.addTransition(0, '0', 1);
        dfa.addTransition(0, '1', 0);
        dfa.addTransition(1, '0', 1);
        dfa.addTransition(1, '1', 2);
        dfa.addTransition(2, '0', 1);
        dfa.addTransition(2, '1', 0);

        for (String s : new String[]{"01", "001", "1101", "10", "0101", ""}) {
            System.out.println("  \"" + s + "\": " + dfa.trace(s));
        }

        System.out.println("\n=== NFA → DFA Conversion ===\n");

        // NFA: accepts strings containing "01"
        NFA nfa = new NFA(3, 0, Set.of(2));
        nfa.addTransition(0, '0', 0);
        nfa.addTransition(0, '0', 1);
        nfa.addTransition(0, '1', 0);
        nfa.addTransition(1, '1', 2);
        nfa.addTransition(2, '0', 2);
        nfa.addTransition(2, '1', 2);

        DFA converted = nfa.toDFA(new char[]{'0', '1'});
        for (String s : new String[]{"01", "101", "110", "00", "11", "1001"}) {
            System.out.println("  \"" + s + "\": " + (converted.accepts(s) ? "ACCEPT" : "REJECT"));
        }
    }
}
```

```python
class DFA:
    """Deterministic Finite Automaton."""

    def __init__(self, states, alphabet, transitions, start, accept):
        """
        states: set of state labels
        alphabet: set of input symbols
        transitions: dict mapping (state, symbol) -> next_state
        start: start state
        accept: set of accept states
        """
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions
        self.start = start
        self.accept = accept

    def accepts(self, input_string):
        """Check if the DFA accepts the given string."""
        current = self.start
        for symbol in input_string:
            key = (current, symbol)
            if key not in self.transitions:
                return False  # No transition → implicit dead state
            current = self.transitions[key]
        return current in self.accept

    def trace(self, input_string):
        """Show the state transitions for a given input."""
        current = self.start
        path = [f"q{current}"]
        for symbol in input_string:
            key = (current, symbol)
            if key not in self.transitions:
                path.append(f"--{symbol}--> DEAD")
                return " ".join(path) + " [REJECT]"
            current = self.transitions[key]
            path.append(f"--{symbol}--> q{current}")
        result = "ACCEPT" if current in self.accept else "REJECT"
        return " ".join(path) + f" [{result}]"


class NFA:
    """Non-deterministic Finite Automaton with epsilon transitions."""

    def __init__(self, states, alphabet, transitions, start, accept):
        """
        transitions: dict mapping (state, symbol) -> set of next states
                     Use symbol='' for epsilon transitions
        """
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions
        self.start = start
        self.accept = accept

    def epsilon_closure(self, states):
        """Compute epsilon closure of a set of states."""
        closure = set(states)
        stack = list(states)
        while stack:
            state = stack.pop()
            eps_targets = self.transitions.get((state, ''), set())
            for t in eps_targets:
                if t not in closure:
                    closure.add(t)
                    stack.append(t)
        return frozenset(closure)

    def move(self, states, symbol):
        """Compute the set of states reachable from `states` on `symbol`."""
        result = set()
        for s in states:
            result.update(self.transitions.get((s, symbol), set()))
        return result

    def to_dfa(self):
        """Convert NFA to DFA using subset construction."""
        start_closure = self.epsilon_closure({self.start})
        dfa_states = {start_closure}
        worklist = [start_closure]
        dfa_transitions = {}
        state_id = {start_closure: 0}
        next_id = 1

        while worklist:
            current = worklist.pop()
            for symbol in self.alphabet:
                next_states = self.epsilon_closure(self.move(current, symbol))
                if not next_states:
                    continue
                if next_states not in dfa_states:
                    dfa_states.add(next_states)
                    state_id[next_states] = next_id
                    next_id += 1
                    worklist.append(next_states)
                dfa_transitions[(state_id[current], symbol)] = state_id[next_states]

        # Determine accept states
        dfa_accept = set()
        for state_set, sid in state_id.items():
            if state_set & self.accept:
                dfa_accept.add(sid)

        all_states = set(range(next_id))
        print(f"Subset construction: {len(self.states)} NFA states → {len(all_states)} DFA states")

        return DFA(all_states, self.alphabet, dfa_transitions, 0, dfa_accept)


if __name__ == "__main__":
    print("=== DFA: Binary strings ending in '01' ===\n")

    # DFA for strings ending in "01"
    transitions = {
        (0, '0'): 1, (0, '1'): 0,
        (1, '0'): 1, (1, '1'): 2,
        (2, '0'): 1, (2, '1'): 0,
    }
    dfa = DFA(
        states={0, 1, 2},
        alphabet={'0', '1'},
        transitions=transitions,
        start=0,
        accept={2}
    )

    test_strings = ["01", "001", "1101", "10", "0", "1", "0101", ""]
    for s in test_strings:
        print(f"  \"{s}\": {dfa.trace(s)}")

    print("\n=== NFA → DFA Conversion ===\n")

    # NFA: accepts strings containing "01"
    nfa_transitions = {
        (0, '0'): {0, 1},
        (0, '1'): {0},
        (1, '1'): {2},
        (2, '0'): {2},
        (2, '1'): {2},
    }
    nfa = NFA(
        states={0, 1, 2},
        alphabet={'0', '1'},
        transitions=nfa_transitions,
        start=0,
        accept={2}
    )

    converted_dfa = nfa.to_dfa()
    print()
    test_strings2 = ["01", "101", "110", "00", "11", "1001"]
    for s in test_strings2:
        result = "ACCEPT" if converted_dfa.accepts(s) else "REJECT"
        print(f"  \"{s}\": {result}")
```

```javascript
class DFA {
  /**
   * @param {Set<number>} states
   * @param {Set<string>} alphabet
   * @param {Object} transitions - { "state,symbol": nextState }
   * @param {number} start
   * @param {Set<number>} accept
   */
  constructor(states, alphabet, transitions, start, accept) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
    this.start = start;
    this.accept = accept;
  }

  accepts(input) {
    let current = this.start;
    for (const symbol of input) {
      const key = `${current},${symbol}`;
      if (!(key in this.transitions)) return false;
      current = this.transitions[key];
    }
    return this.accept.has(current);
  }

  trace(input) {
    let current = this.start;
    const parts = [`q${current}`];
    for (const symbol of input) {
      const key = `${current},${symbol}`;
      if (!(key in this.transitions)) {
        parts.push(`--${symbol}--> DEAD`);
        return parts.join(" ") + " [REJECT]";
      }
      current = this.transitions[key];
      parts.push(`--${symbol}--> q${current}`);
    }
    const result = this.accept.has(current) ? "ACCEPT" : "REJECT";
    return parts.join(" ") + ` [${result}]`;
  }
}

class NFA {
  /**
   * @param {Set<number>} states
   * @param {Set<string>} alphabet
   * @param {Object} transitions - { "state,symbol": Set<number> }
   * @param {number} start
   * @param {Set<number>} accept
   */
  constructor(states, alphabet, transitions, start, accept) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
    this.start = start;
    this.accept = accept;
  }

  epsilonClosure(states) {
    const closure = new Set(states);
    const stack = [...states];
    while (stack.length > 0) {
      const s = stack.pop();
      const key = `${s},`;
      const targets = this.transitions[key] || new Set();
      for (const t of targets) {
        if (!closure.has(t)) {
          closure.add(t);
          stack.push(t);
        }
      }
    }
    return closure;
  }

  move(states, symbol) {
    const result = new Set();
    for (const s of states) {
      const key = `${s},${symbol}`;
      const targets = this.transitions[key] || new Set();
      for (const t of targets) result.add(t);
    }
    return result;
  }

  toDFA() {
    const setToKey = (s) => [...s].sort().join(",");
    const startClosure = this.epsilonClosure(new Set([this.start]));
    const startKey = setToKey(startClosure);

    const dfaStates = new Map(); // key -> id
    dfaStates.set(startKey, 0);
    const stateSets = [startClosure]; // id -> set
    const worklist = [startClosure];
    const dfaTransitions = {};
    let nextId = 1;

    while (worklist.length > 0) {
      const current = worklist.pop();
      const currentId = dfaStates.get(setToKey(current));

      for (const symbol of this.alphabet) {
        const next = this.epsilonClosure(this.move(current, symbol));
        if (next.size === 0) continue;

        const nextKey = setToKey(next);
        if (!dfaStates.has(nextKey)) {
          dfaStates.set(nextKey, nextId);
          stateSets.push(next);
          nextId++;
          worklist.push(next);
        }
        dfaTransitions[`${currentId},${symbol}`] = dfaStates.get(nextKey);
      }
    }

    // Determine accept states
    const dfaAccept = new Set();
    for (let i = 0; i < stateSets.length; i++) {
      for (const s of stateSets[i]) {
        if (this.accept.has(s)) {
          dfaAccept.add(i);
          break;
        }
      }
    }

    console.log(`Subset construction: ${this.states.size} NFA states → ${nextId} DFA states`);

    return new DFA(
      new Set(Array.from({ length: nextId }, (_, i) => i)),
      this.alphabet,
      dfaTransitions,
      0,
      dfaAccept
    );
  }
}

// --- Main ---
console.log("=== DFA: Binary strings ending in '01' ===\n");

const dfa = new DFA(
  new Set([0, 1, 2]),
  new Set(["0", "1"]),
  {
    "0,0": 1, "0,1": 0,
    "1,0": 1, "1,1": 2,
    "2,0": 1, "2,1": 0,
  },
  0,
  new Set([2])
);

for (const s of ["01", "001", "1101", "10", "0", "1", "0101", ""]) {
  console.log(`  "${s}": ${dfa.trace(s)}`);
}

console.log("\n=== NFA → DFA Conversion ===\n");

// NFA: accepts strings containing "01"
const nfa = new NFA(
  new Set([0, 1, 2]),
  new Set(["0", "1"]),
  {
    "0,0": new Set([0, 1]),
    "0,1": new Set([0]),
    "1,1": new Set([2]),
    "2,0": new Set([2]),
    "2,1": new Set([2]),
  },
  0,
  new Set([2])
);

const convertedDFA = nfa.toDFA();
console.log();
for (const s of ["01", "101", "110", "00", "11", "1001"]) {
  console.log(`  "${s}": ${convertedDFA.accepts(s) ? "ACCEPT" : "REJECT"}`);
}
```

---

## Key Takeaways

1. A **DFA** $(Q, \Sigma, \delta, q_0, F)$ processes input deterministically — exactly one transition per state-symbol pair — making it efficient to simulate in $O(n)$ time for input of length $n$.

2. An **NFA** allows multiple transitions (or none) from a state, plus $\epsilon$-transitions. Despite the added flexibility, NFAs recognize exactly the same languages as DFAs (**regular languages**).

3. The **subset construction** converts any NFA to an equivalent DFA by treating sets of NFA states as single DFA states. Worst case is $2^n$ states, but reachable subsets are typically much fewer.

4. **Regular expressions**, NFAs, and DFAs are all equivalent in expressive power (Kleene's theorem). Each has practical advantages: regex for specification, NFA for easy construction, DFA for efficient execution.

5. The **pumping lemma** proves certain languages (like $\{0^n1^n\}$) are not regular — finite automata cannot count unboundedly.

6. Applications span **compilers** (lexical analysis), **pattern matching** (grep, regex engines), **protocol verification** (state machine models), and **hardware design** (controllers).
