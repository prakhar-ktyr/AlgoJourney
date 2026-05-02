---
title: "Quantum Hardware Technologies"
---

Building a quantum computer is one of the greatest engineering challenges of our time. Multiple competing technologies are being pursued, each with distinct physics, advantages, and trade-offs. Understanding these approaches is essential for anyone working in quantum computing.

## The Qubit Engineering Challenge

A useful physical qubit must satisfy the **DiVincenzo criteria**:

1. A well-defined two-level quantum system
2. Ability to initialize to a known state (e.g., $|0\rangle$)
3. Long coherence times (much longer than gate operation time)
4. A universal set of quantum gates
5. Qubit-specific measurement capability

The ratio of coherence time to gate time determines how many operations you can perform before errors dominate. This ratio, often expressed as $T_2 / t_{\text{gate}}$, ideally should be $> 10^4$ for fault-tolerant computation.

## Superconducting Qubits

**Used by:** IBM, Google, Rigetti, Alibaba

Superconducting qubits use tiny circuits made of superconducting materials (aluminum on silicon) cooled to approximately 15 millikelvin — colder than outer space.

### How They Work

The **transmon** qubit (the dominant design) is an anharmonic oscillator formed by a Josephson junction shunted by a capacitor. The energy levels are:

$$E_n \approx \hbar\omega_r\left(n + \frac{1}{2}\right) - \frac{E_C}{12}(6n^2 + 6n + 3)$$

The anharmonicity $E_C$ ensures the $|0\rangle \to |1\rangle$ transition frequency differs from $|1\rangle \to |2\rangle$, allowing us to treat it as a two-level system.

### Control and Measurement

- **Single-qubit gates**: microwave pulses at the qubit's resonant frequency (~5 GHz), typically ~20 ns duration
- **Two-qubit gates**: controlled interactions via tunable couplers or cross-resonance drives, ~100–300 ns
- **Readout**: dispersive measurement through a coupled resonator

### Advantages

- Fast gate times (~20–300 ns)
- Mature fabrication using semiconductor industry techniques
- Scalable chip-based architecture
- Strong industry investment and large qubit counts (IBM Eagle: 127 qubits, Condor: 1121 qubits)

### Disadvantages

- Short coherence times ($T_1, T_2 \sim 100$–$300 \,\mu\text{s}$)
- Requires dilution refrigerators at ~15 mK
- Limited connectivity (typically nearest-neighbor on a 2D grid)
- Sensitive to electromagnetic interference and material defects

## Trapped Ions

**Used by:** IonQ, Quantinuum (Honeywell), University of Innsbruck, Duke University

### How They Work

Individual atoms (typically ytterbium $^{171}\text{Yb}^+$ or calcium $^{40}\text{Ca}^+$) are stripped of an electron and confined in an electromagnetic trap (Paul trap or linear RF trap). The qubit is encoded in two internal energy levels of the ion:

$$|0\rangle = |S_{1/2}, F=0\rangle, \quad |1\rangle = |S_{1/2}, F=1\rangle$$

The ions are arranged in a linear chain, spaced by their mutual Coulomb repulsion (~5 $\mu$m apart).

### Control and Measurement

- **Single-qubit gates**: focused laser beams or microwave fields drive transitions between $|0\rangle$ and $|1\rangle$
- **Two-qubit gates**: laser-driven Mølmer-Sørensen gates use shared motional (phonon) modes of the ion chain
- **Readout**: state-dependent fluorescence — illuminate with a laser and detect photons (bright = $|1\rangle$, dark = $|0\rangle$)

### Advantages

- Very long coherence times ($T_2 > 1$ second, sometimes minutes)
- Highest gate fidelities achieved: >99.9% for single-qubit, >99.5% for two-qubit
- All-to-all connectivity (any ion can interact with any other via shared motional modes)
- Identical qubits (every ion of the same species is physically identical)

### Disadvantages

- Slower gate times (~10–100 $\mu$s for two-qubit gates)
- Scaling beyond ~50 ions in a single chain is challenging
- Complex laser systems and vacuum apparatus
- Shuttling ions between trap zones adds overhead

## Photonic Qubits

**Used by:** Xanadu, PsiQuantum, Quandela

### How They Work

Photons serve as qubits, with information encoded in polarization, path, or time-bin degrees of freedom:

$$|0\rangle = |H\rangle \text{ (horizontal)}, \quad |1\rangle = |V\rangle \text{ (vertical)}$$

Quantum gates are implemented using beam splitters, phase shifters, and nonlinear optical elements.

### Single-Qubit Gates

A half-wave plate rotates polarization:

$$\text{HWP}(\theta) = \begin{pmatrix} \cos 2\theta & \sin 2\theta \\ \sin 2\theta & -\cos 2\theta \end{pmatrix}$$

### Advantages

- Can operate at room temperature (no cryogenics needed for the qubits themselves)
- Photons don't interact with the environment easily — long coherence
- Natural fit for quantum networking and communication
- Can leverage existing telecom fiber infrastructure

### Disadvantages

- Photon loss is a major error source
- Two-qubit gates are **non-deterministic** (succeed probabilistically)
- Requires single-photon sources and detectors (still imperfect)
- Large resource overhead for fault tolerance (millions of photons)

## Topological Qubits

**Used by:** Microsoft

### The Concept

Topological qubits encode information in **non-local** properties of exotic quasiparticles called **anyons** (specifically, Majorana zero modes). The key idea:

- Information is stored in the **topology** of particle worldlines (braids), not local properties
- Small local perturbations cannot change topological properties
- This provides **built-in error protection**

### The Math

For Majorana fermions $\gamma_1, \gamma_2, \gamma_3, \gamma_4$, a qubit is encoded as:

$$|0\rangle: \quad i\gamma_1\gamma_2 = +1, \quad |1\rangle: \quad i\gamma_1\gamma_2 = -1$$

Braiding operations (exchanging anyons) implement gates that are inherently fault-tolerant.

### Current Status

- Still in **early research stage** — reliably creating and manipulating Majorana zero modes is extremely challenging
- Microsoft announced progress with topological superconductor devices in 2023
- If successful, could dramatically reduce the overhead for quantum error correction

## Neutral Atoms

**Used by:** Atom Computing, QuEra, Pasqal, ColdQuanta

### How They Work

Arrays of individual neutral atoms (rubidium, cesium) are trapped using tightly focused laser beams called **optical tweezers**. Qubits are encoded in atomic energy levels:

$$|0\rangle = |5S_{1/2}\rangle, \quad |1\rangle = |5P_{3/2}\rangle \text{ or Rydberg state}$$

Two-qubit gates use **Rydberg interactions**: when an atom is excited to a high-energy Rydberg state ($n \sim 50$–$100$), it creates a strong interaction ($\sim$ MHz) with nearby atoms, enabling controlled entanglement.

### The Rydberg Blockade

When one atom is in a Rydberg state, the interaction energy shift prevents a nearby atom from being excited:

$$V(r) = \frac{C_6}{r^6}$$

This blockade mechanism naturally implements a controlled-Z gate.

### Advantages

- Highly scalable: arrays of >1000 atoms demonstrated
- Long coherence times (~seconds for clock qubits)
- Flexible connectivity via atom rearrangement
- All qubits are identical (same atomic species)

### Disadvantages

- Mid-circuit measurement and feed-forward still developing
- Gate fidelities improving but behind trapped ions
- Atom loss during computation

## Comparison Table

| Technology | Gate Speed | Coherence | Fidelity (2Q) | Connectivity | Scale | Temperature |
|---|---|---|---|---|---|---|
| Superconducting | ~20–300 ns | ~100–300 μs | ~99.5% | Nearest-neighbor | ~1000+ | 15 mK |
| Trapped Ions | ~10–100 μs | ~1–60 s | ~99.5% | All-to-all | ~30–50 | Room (trap) |
| Photonic | ~1 ns | Very long | ~99% (1Q) | Flexible | ~200+ | Room temp |
| Topological | TBD | TBD (long) | TBD | TBD | ~0 (R&D) | mK |
| Neutral Atoms | ~1 μs | ~1–10 s | ~99.5% | Reconfigurable | ~1000+ | μK |

> **Note:** These numbers evolve rapidly. Check the latest publications for current state-of-the-art.

## Which Technology Will Win?

The honest answer: **we don't know yet.** It's possible that:

- Different technologies win for different applications
- A hybrid approach combining multiple platforms emerges
- An entirely new approach is discovered

The field is analogous to the early days of classical computing, where vacuum tubes, relays, and transistors all competed before one technology (silicon transistors) dominated.

## Key Takeaways

- **Superconducting qubits** lead in qubit count and gate speed but need extreme cooling and have short coherence
- **Trapped ions** offer the best fidelities and all-to-all connectivity but are harder to scale
- **Photonic** approaches work at room temperature and suit networking, but two-qubit gates are probabilistic
- **Topological qubits** promise built-in error protection but remain unproven experimentally
- **Neutral atoms** combine scalability with good coherence using Rydberg interactions
- No single technology has emerged as the clear winner — the race is ongoing

## Try It Yourself

1. Research the latest qubit counts and gate fidelities for IBM, Google, IonQ, and Quantinuum. How have they changed from the numbers above?
2. Calculate the number of gate operations possible before decoherence for a superconducting qubit ($T_2 = 200\,\mu\text{s}$, $t_{\text{gate}} = 50\,\text{ns}$) vs. a trapped ion ($T_2 = 10\,\text{s}$, $t_{\text{gate}} = 50\,\mu\text{s}$).
3. Explain in your own words why topological qubits would be inherently more error-resistant than other approaches.
4. For a quantum networking application, which qubit technology would you choose and why?

**Next: Current Challenges and Future of QC →**
