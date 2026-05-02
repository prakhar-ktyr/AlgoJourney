---
title: "Quantum Tunneling"
---

# Quantum Tunneling

Quantum tunneling is one of the most fascinating and counterintuitive phenomena in quantum mechanics. A particle can pass through a potential energy barrier that it classically does not have enough energy to overcome. This isn't science fiction — it's real physics that powers technologies you use every day.

---

## Classical vs Quantum Barriers

### Classical Picture

Imagine rolling a ball toward a hill. If the ball doesn't have enough kinetic energy to reach the top, it rolls back. **In classical physics, the barrier is absolute** — no energy means no crossing.

Mathematically, if a particle has energy $E$ and encounters a barrier of height $V_0$ where $E < V_0$, classically:

$$\text{Transmission} = 0 \quad \text{(classical, when } E < V_0\text{)}$$

### Quantum Picture

In quantum mechanics, a particle is described by a wavefunction $\psi(x)$. When this wave encounters a barrier, it doesn't abruptly stop — it **exponentially decays** inside the barrier. If the barrier is thin enough, there's a nonzero probability of finding the particle on the other side!

$$\psi(x) \sim e^{-\kappa x} \quad \text{inside the barrier}$$

Where $\kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}$ is the decay constant.

---

## The Mathematics of Tunneling

### Rectangular Barrier

Consider a particle of mass $m$ and energy $E$ encountering a rectangular potential barrier of height $V_0$ and width $L$:

$$V(x) = \begin{cases} 0 & x < 0 \\ V_0 & 0 \leq x \leq L \\ 0 & x > L \end{cases}$$

The **transmission coefficient** $T$ (probability of tunneling through) is:

$$T = \frac{1}{1 + \frac{V_0^2 \sinh^2(\kappa L)}{4E(V_0 - E)}}$$

Where:
- $\kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}$
- $\sinh(x) = \frac{e^x - e^{-x}}{2}$

### Simplified Approximation

For a thick barrier ($\kappa L \gg 1$), this simplifies to:

$$T \approx \frac{16E(V_0 - E)}{V_0^2} \cdot e^{-2\kappa L}$$

The key insight: **tunneling probability decreases exponentially with barrier width and the square root of the energy deficit.**

$$T \propto e^{-2L\sqrt{2m(V_0 - E)}/\hbar}$$

---

## Numerical Example

**Problem:** An electron with energy $E = 5$ eV encounters a barrier of height $V_0 = 10$ eV and width $L = 1$ nm. What is the probability of tunneling?

**Solution:**

Step 1: Calculate $\kappa$

$$\kappa = \frac{\sqrt{2m_e(V_0 - E)}}{\hbar} = \frac{\sqrt{2 \times 9.109 \times 10^{-31} \times 5 \times 1.602 \times 10^{-19}}}{1.055 \times 10^{-34}}$$

$$\kappa = \frac{\sqrt{1.455 \times 10^{-49}}}{1.055 \times 10^{-34}} = \frac{1.206 \times 10^{-24.5}}{1.055 \times 10^{-34}} \approx 1.145 \times 10^{10} \text{ m}^{-1}$$

Step 2: Calculate $\kappa L$

$$\kappa L = 1.145 \times 10^{10} \times 10^{-9} = 11.45$$

Step 3: Calculate transmission coefficient

$$T \approx \frac{16 \times 5 \times 5}{100} \cdot e^{-2 \times 11.45} = 4 \cdot e^{-22.9} \approx 4 \times 1.12 \times 10^{-10}$$

$$T \approx 4.5 \times 10^{-10}$$

So there's about a **0.000000045%** chance of the electron tunneling through. That seems tiny, but when billions of electrons hit the barrier per second, tunneling becomes significant!

---

## Real-World Examples

### 1. Alpha Decay

Heavy nuclei (like Uranium-238) emit alpha particles through quantum tunneling. The alpha particle is trapped by the nuclear potential well but has a small probability of tunneling through:

- Barrier height: ~30 MeV
- Alpha particle energy: ~5 MeV
- Barrier width: ~30 fm

The tunneling probability per attempt is tiny ($\sim 10^{-38}$), but the alpha particle "hits" the barrier $\sim 10^{21}$ times per second, giving half-lives of billions of years.

### 2. Tunnel Diodes

In semiconductor tunnel diodes, electrons tunnel through a thin potential barrier between heavily doped p-n junctions. This creates a region of **negative differential resistance** — as voltage increases, current decreases — enabling ultra-fast switching.

### 3. Scanning Tunneling Microscope (STM)

The STM uses quantum tunneling to image surfaces at the atomic level:
- A sharp conducting tip is brought within ~1 nm of a surface
- A voltage is applied between tip and surface
- Electrons tunnel across the vacuum gap
- Tunneling current is **exponentially sensitive** to distance: $I \propto e^{-2\kappa d}$
- Even a 0.1 nm change in distance dramatically changes the current

This gives STM its incredible atomic-scale resolution — it can literally "see" individual atoms!

### 4. Flash Memory

Your USB drive and SSD use quantum tunneling! Data is stored by trapping electrons on a floating gate. To write or erase data, electrons must tunnel through a thin oxide barrier (~10 nm).

---

## Connection to Quantum Computing

### Quantum Annealing

Quantum annealing is a computational approach used by systems like D-Wave's quantum computers. It exploits tunneling to solve optimization problems:

1. The system is initialized in a superposition of all possible solutions
2. The energy landscape represents the optimization problem
3. Classical optimization can get stuck in local minima
4. **Quantum tunneling allows the system to pass through energy barriers** between local minima to find the global minimum

$$\text{Classical: stuck in local minimum} \xrightarrow{\text{tunneling}} \text{Quantum: finds global minimum}$$

This gives quantum annealing a potential advantage over classical simulated annealing for certain problems.

### Tunneling in Superconducting Qubits

Superconducting qubits (transmons, flux qubits) rely on the Josephson effect — Cooper pairs of electrons tunneling through a thin insulating barrier between two superconductors. The Josephson junction is the fundamental nonlinear element that makes superconducting qubits possible.

---

## Python Code: Tunneling Simulation

```python
import numpy as np
import matplotlib.pyplot as plt

def transmission_coefficient(E, V0, L, m):
    """
    Calculate the transmission coefficient for a rectangular barrier.
    
    Parameters:
    - E: particle energy (eV)
    - V0: barrier height (eV)
    - L: barrier width (nm)
    - m: particle mass (kg)
    """
    hbar = 1.055e-34  # J·s
    eV_to_J = 1.602e-19
    nm_to_m = 1e-9
    
    E_J = E * eV_to_J
    V0_J = V0 * eV_to_J
    L_m = L * nm_to_m
    
    if E >= V0:
        # Above barrier — oscillating solution
        k2 = np.sqrt(2 * m * (E_J - V0_J)) / hbar
        T = 1 / (1 + (V0_J**2 * np.sin(k2 * L_m)**2) / 
                 (4 * E_J * (E_J - V0_J)))
    else:
        # Below barrier — tunneling
        kappa = np.sqrt(2 * m * (V0_J - E_J)) / hbar
        kappa_L = kappa * L_m
        if kappa_L > 500:  # Prevent overflow
            T = 0.0
        else:
            T = 1 / (1 + (V0_J**2 * np.sinh(kappa_L)**2) / 
                     (4 * E_J * (V0_J - E_J)))
    return T

# Parameters
m_e = 9.109e-31  # electron mass (kg)
V0 = 10  # barrier height (eV)

# Plot T vs energy for different barrier widths
energies = np.linspace(0.1, 15, 500)
widths = [0.1, 0.3, 0.5, 1.0]  # nm

plt.figure(figsize=(10, 6))
for L in widths:
    T_values = [transmission_coefficient(E, V0, L, m_e) for E in energies]
    plt.plot(energies, T_values, linewidth=2, label=f'L = {L} nm')

plt.axvline(x=V0, color='red', linestyle='--', alpha=0.5, label=f'V₀ = {V0} eV')
plt.xlabel('Particle Energy (eV)', fontsize=12)
plt.ylabel('Transmission Coefficient T', fontsize=12)
plt.title('Quantum Tunneling: Transmission vs Energy', fontsize=14)
plt.legend(fontsize=11)
plt.grid(True, alpha=0.3)
plt.ylim(0, 1.05)
plt.savefig('tunneling_transmission.png', dpi=100)
plt.show()

# Print some specific values
print("\nTransmission coefficients for electron through 10 eV barrier:")
print("-" * 50)
for L in widths:
    T = transmission_coefficient(5, V0, L, m_e)
    print(f"  L = {L:.1f} nm, E = 5 eV: T = {T:.2e}")
```

---

## Tunneling and the WKB Approximation

For barriers with arbitrary shapes $V(x)$, the tunneling probability is given by the **WKB (Wentzel-Kramers-Brillouin) approximation**:

$$T \approx \exp\left(-\frac{2}{\hbar} \int_{x_1}^{x_2} \sqrt{2m(V(x) - E)} \, dx\right)$$

Where $x_1$ and $x_2$ are the classical turning points (where $V(x) = E$).

This is extremely useful for calculating tunneling rates in real physical systems like nuclear decay, where the Coulomb barrier has a complex shape.

---

## Why Tunneling Doesn't Happen to Everyday Objects

You might wonder: can a baseball tunnel through a wall? Technically yes, but the probability is absurdly small.

For a 0.15 kg baseball, a 1 m wall, barrier energy of ~1 J:

$$\kappa = \frac{\sqrt{2 \times 0.15 \times 1}}{1.055 \times 10^{-34}} \approx 5.2 \times 10^{33} \text{ m}^{-1}$$

$$T \sim e^{-2 \times 5.2 \times 10^{33} \times 1} = e^{-10^{34}} \approx 10^{-10^{33}}$$

This number is so incomprehensibly small that you'd have to wait far longer than the age of the universe to see it happen even once. Tunneling is only significant for **very light particles** (electrons, protons) through **very thin barriers** (nanometers).

---

## Key Takeaways

1. **Quantum tunneling** allows particles to pass through potential barriers they classically cannot overcome.
2. **The transmission coefficient** decreases exponentially with barrier width and the square root of the energy deficit: $T \propto e^{-2\kappa L}$.
3. **It's not magic** — the wavefunction decays exponentially inside the barrier but doesn't reach zero if the barrier is thin enough.
4. **Real applications** include alpha decay, tunnel diodes, STM microscopy, and flash memory.
5. **Quantum annealing** exploits tunneling to escape local minima in optimization problems.
6. **Superconducting qubits** are built on Josephson junctions, which rely on Cooper pair tunneling.
7. **Macroscopic objects** have negligible tunneling probability due to their large mass.

---

## Try It Yourself

1. **Calculate:** A proton ($m = 1.67 \times 10^{-27}$ kg) with energy 3 MeV encounters a 5 MeV barrier of width 10 fm. What is the tunneling probability?

2. **Compare:** Calculate the tunneling probability for an electron vs a proton through the same 1 nm, 5 eV barrier (both with 3 eV energy). Why is there such a huge difference?

3. **Code Challenge:** Modify the Python code to plot the wavefunction $|\psi(x)|^2$ as it passes through a barrier. Show the exponential decay inside the barrier and the reduced amplitude on the other side.

4. **Think:** In an STM, the tunneling current doubles when the tip moves 0.1 nm closer. Calculate the decay constant $\kappa$ and the effective barrier height.

---

## Next Lesson

Now that we understand the quantum mechanical phenomena that make quantum computing possible, it's time to meet the fundamental unit of quantum information. In the next lesson, [What is a Qubit?](13-qc-what-is-a-qubit), we'll learn how quantum mechanics is harnessed to create computational building blocks far more powerful than classical bits!
