---
title: Wave-Particle Duality
---

# Wave-Particle Duality

One of the most mind-bending concepts in quantum mechanics is that quantum objects are neither purely particles nor purely waves — they exhibit properties of **both**, depending on how you observe them.

---

## The Classical View

In classical physics, particles and waves are completely separate:

**Particles**:
- Have definite position and momentum
- Collide and bounce
- Examples: billiard balls, bullets

**Waves**:
- Spread out in space
- Exhibit interference and diffraction
- Examples: water waves, sound waves

Quantum mechanics blurs this distinction entirely.

---

## Evidence for Wave-Particle Duality

### Light as Waves (1801)

**Thomas Young's Double-Slit Experiment** demonstrated that light behaves as a wave:

```
Light source → | slit A | → Screen
               | slit B |

Result: Interference pattern (alternating bright/dark bands)
```

When light passes through two slits, it creates an **interference pattern** — bright bands where wave crests align (constructive interference) and dark bands where crests meet troughs (destructive interference). Only waves can do this.

### Light as Particles (1905)

Einstein's explanation of the **photoelectric effect** showed that light also behaves as particles (photons):

- Shining light on a metal surface ejects electrons.
- Below a certain frequency, **no electrons are ejected** regardless of light intensity.
- Above that frequency, electrons are ejected immediately.

Classical wave theory couldn't explain this. Einstein proposed that light comes in discrete energy packets:

$$E = h\nu$$

Each photon carries energy $h\nu$. If a single photon doesn't have enough energy ($h\nu < \phi$, the work function), no electron is ejected.

### Electrons as Waves (1927)

**Davisson and Germer** showed that electrons (previously considered pure particles) also create diffraction patterns when scattered off a crystal — behavior characteristic of waves.

The wavelength of any particle is given by the **de Broglie relation**:

$$\lambda = \frac{h}{p} = \frac{h}{mv}$$

where $h$ is Planck's constant, $p$ is momentum, $m$ is mass, and $v$ is velocity.

---

## The Double-Slit Experiment with Electrons

This is the most famous experiment in quantum physics and beautifully illustrates wave-particle duality.

### Setup

```
Electron gun → | slit A | → Detection screen
               | slit B |
```

### What Happens

**Both slits open, no detector**:
Electrons create an **interference pattern** on the screen — just like waves! Each electron seems to pass through **both slits** simultaneously and interfere with itself.

```
Screen pattern:    |  |   ||   |  |   ||   |  |
                   Dark  Bright  Dark  Bright  Dark
```

**One slit open**:
Electrons create a simple blob pattern — behaving like particles passing through one slit.

**Both slits open, with a detector at the slits**:
When we try to observe which slit the electron goes through, the interference pattern **disappears**! The electrons behave like particles, passing through one slit or the other.

### The Mystery

- **Unobserved**: Electrons behave as waves (interference pattern).
- **Observed**: Electrons behave as particles (no interference).

The act of measurement fundamentally changes the behavior of quantum objects. This is directly connected to the **measurement problem** in quantum mechanics.

---

## What Does This Mean for Quantum Computing?

Wave-particle duality has profound implications for quantum computing:

### 1. Superposition

Just as a wave can be a combination of many frequencies, a qubit can be a combination of $|0\rangle$ and $|1\rangle$. The "wave-like" nature of qubits enables superposition.

### 2. Interference in Quantum Algorithms

Quantum algorithms rely on **interference** — the same phenomenon from the double-slit experiment:

- **Constructive interference**: Amplify the amplitudes of correct answers.
- **Destructive interference**: Cancel out the amplitudes of wrong answers.

This is how Grover's algorithm finds the right item and how Shor's algorithm factors numbers.

```
Correct answer amplitude:   ↑ + ↑ = ↑↑  (amplified)
Wrong answer amplitude:     ↑ + ↓ = 0   (cancelled)
```

### 3. Measurement Collapse

Just as observing which slit the electron goes through collapses the interference pattern, measuring a qubit collapses its superposition to $|0\rangle$ or $|1\rangle$. This is why:

- You must measure at the right time — too early and you destroy useful quantum information.
- Quantum algorithms are designed so that measurement at the end yields useful results with high probability.

---

## The de Broglie Wavelength in Practice

Everything has a de Broglie wavelength, but for everyday objects, it's incredibly small:

| Object | Mass (kg) | Velocity (m/s) | Wavelength |
|--------|-----------|-----------------|------------|
| Electron | $9.1 \times 10^{-31}$ | $10^6$ | $7.3 \times 10^{-10}$ m (atomic scale!) |
| Baseball | $0.145$ | $40$ | $1.1 \times 10^{-34}$ m (undetectable) |
| Human | $70$ | $1$ | $9.5 \times 10^{-36}$ m (absurdly small) |

Quantum effects are only significant when the wavelength is comparable to the system size — which is why we only see quantum behavior at the atomic scale.

---

## Complementarity Principle

Niels Bohr formalized wave-particle duality through his **complementarity principle**:

> Wave and particle behaviors are **complementary** — both are needed for a complete description, but they cannot be observed simultaneously.

You can design an experiment to see wave behavior (interference) or particle behavior (which-path information), but never both at the same time.

---

## Key Takeaways

- Quantum objects exhibit both wave and particle properties — this is wave-particle duality.
- The double-slit experiment is the classic demonstration: electrons create interference patterns unless observed.
- Measurement changes quantum behavior — a fundamental feature, not a limitation.
- Quantum algorithms exploit wave-like interference to amplify correct answers and suppress wrong ones.
- Wave-particle duality only manifests at quantum scales (atomic and subatomic).

---

## Try It Yourself

**Calculate**: What is the de Broglie wavelength of an electron moving at $2 \times 10^6$ m/s?

Given: $h = 6.626 \times 10^{-34}$ J·s, $m_e = 9.109 \times 10^{-31}$ kg

$$\lambda = \frac{h}{mv} = \frac{6.626 \times 10^{-34}}{(9.109 \times 10^{-31})(2 \times 10^6)}$$

$$\lambda = \frac{6.626 \times 10^{-34}}{1.822 \times 10^{-24}} = 3.64 \times 10^{-10} \text{ m} = 0.364 \text{ nm}$$

This is comparable to atomic spacing — which is why electrons can diffract off crystal lattices!

Next, we'll explore **Superposition** in depth →
