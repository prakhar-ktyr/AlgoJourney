---
title: "Heisenberg Uncertainty Principle"
---

# Heisenberg Uncertainty Principle

The Heisenberg Uncertainty Principle is one of the most profound results in quantum mechanics. It tells us that certain pairs of physical properties cannot both be known to arbitrary precision at the same time — not because of limitations in our instruments, but because of the **fundamental nature of reality**.

---

## What is the Uncertainty Principle?

In classical physics, you can measure the position and momentum of a particle simultaneously with perfect accuracy. Quantum mechanics says **this is impossible**.

The uncertainty principle states:

$$\Delta x \cdot \Delta p \geq \frac{\hbar}{2}$$

Where:
- $\Delta x$ = uncertainty in position
- $\Delta p$ = uncertainty in momentum
- $\hbar = \frac{h}{2\pi} \approx 1.055 \times 10^{-34} \text{ J·s}$ (reduced Planck constant)

This means: **the more precisely you know a particle's position, the less precisely you can know its momentum, and vice versa.**

---

## It's NOT About Measurement Limitations

A common misconception is that the uncertainty principle is about our instruments being imprecise, or that measuring one property "disturbs" the other. While measurement disturbance does exist, the uncertainty principle is deeper than that.

**The particle does not have a definite position AND a definite momentum at the same time.** These properties are not simultaneously well-defined. This is a statement about the nature of quantum objects, not about our ability to observe them.

Think of it this way: a wave cannot have both a perfectly defined wavelength (which relates to momentum) and a perfectly defined position. A wave that is localized in space must be a superposition of many wavelengths.

---

## Energy-Time Uncertainty

There is a similar uncertainty relation for energy and time:

$$\Delta E \cdot \Delta t \geq \frac{\hbar}{2}$$

Where:
- $\Delta E$ = uncertainty in energy
- $\Delta t$ = uncertainty in time (the time over which the system's state changes appreciably)

This means that a system that exists for a very short time $\Delta t$ cannot have a precisely defined energy. This has real consequences:
- Virtual particles can "borrow" energy for short times
- Short-lived excited states have broad energy spectra
- Quantum tunneling (next lesson!) relies on this

---

## Mathematical Examples

### Example 1: Position-Momentum Uncertainty

**Problem:** An electron is confined to a region of size $\Delta x = 1 \times 10^{-10}$ m (roughly the size of an atom). What is the minimum uncertainty in its momentum?

**Solution:**

$$\Delta p \geq \frac{\hbar}{2 \Delta x} = \frac{1.055 \times 10^{-34}}{2 \times 1 \times 10^{-10}}$$

$$\Delta p \geq 5.275 \times 10^{-25} \text{ kg·m/s}$$

The corresponding uncertainty in velocity:

$$\Delta v = \frac{\Delta p}{m_e} = \frac{5.275 \times 10^{-25}}{9.109 \times 10^{-31}} \approx 5.79 \times 10^{5} \text{ m/s}$$

That's about 0.2% the speed of light — just from confining the electron to an atom-sized region!

### Example 2: Energy-Time Uncertainty

**Problem:** A particle exists in an excited state for $\Delta t = 1 \times 10^{-8}$ s before decaying. What is the minimum uncertainty in its energy?

**Solution:**

$$\Delta E \geq \frac{\hbar}{2 \Delta t} = \frac{1.055 \times 10^{-34}}{2 \times 10^{-8}}$$

$$\Delta E \geq 5.275 \times 10^{-27} \text{ J} \approx 3.3 \times 10^{-8} \text{ eV}$$

This energy spread corresponds to a "natural linewidth" of the spectral line emitted during the transition.

### Example 3: Zero-Point Energy

The uncertainty principle explains why particles confined in a potential well always have nonzero kinetic energy (zero-point energy). If a particle is in a box of size $L$:

$$\Delta x \sim L \implies \Delta p \geq \frac{\hbar}{2L}$$

The minimum kinetic energy:

$$E_{min} = \frac{(\Delta p)^2}{2m} \geq \frac{\hbar^2}{8mL^2}$$

This is why atoms don't collapse — electrons confined near the nucleus would have enormous kinetic energy.

---

## Connection to Quantum Computing

The uncertainty principle has several critical implications for quantum computing:

### 1. The No-Cloning Theorem

You **cannot** make a perfect copy of an unknown quantum state. If you could, you could measure one copy's position precisely and the other copy's momentum precisely, violating the uncertainty principle. This is formalized as the **no-cloning theorem**.

$$\text{There is no unitary operator } U \text{ such that } U|\psi\rangle|0\rangle = |\psi\rangle|\psi\rangle \text{ for all } |\psi\rangle$$

### 2. Measurement Disturbs States

When you measure a qubit in superposition $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$, the state **collapses** to either $|0\rangle$ or $|1\rangle$. You cannot extract the full information ($\alpha$ and $\beta$) from a single measurement.

### 3. Quantum Error Correction

Because you can't clone qubits or measure them without disturbance, quantum error correction requires fundamentally different strategies than classical error correction.

### 4. Quantum Cryptography (QKD)

The uncertainty principle guarantees the security of quantum key distribution: any eavesdropper trying to intercept and measure qubits will inevitably disturb them, revealing their presence.

---

## Python Code: Visualizing Uncertainty

```python
import numpy as np
import matplotlib.pyplot as plt

# Demonstrate position-momentum uncertainty
# A Gaussian wave packet minimizes the uncertainty product

def gaussian_wave_packet(x, x0, sigma):
    """Position-space Gaussian wave packet."""
    return (1 / (2 * np.pi * sigma**2)**0.25) * \
           np.exp(-(x - x0)**2 / (4 * sigma**2))

# Parameters
x = np.linspace(-10, 10, 1000)
sigmas = [0.5, 1.0, 2.0, 4.0]  # Different position uncertainties

fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes = axes.flatten()

hbar = 1.0  # Natural units

for i, sigma_x in enumerate(sigmas):
    psi = gaussian_wave_packet(x, 0, sigma_x)
    prob = np.abs(psi)**2
    
    # Momentum uncertainty
    sigma_p = hbar / (2 * sigma_x)
    
    axes[i].plot(x, prob, 'b-', linewidth=2)
    axes[i].set_title(f'Δx = {sigma_x:.1f}, Δp = {sigma_p:.2f}\n'
                      f'ΔxΔp = {sigma_x * sigma_p:.2f} (min = {hbar/2:.2f})')
    axes[i].set_xlabel('Position x')
    axes[i].set_ylabel('|ψ(x)|²')
    axes[i].set_xlim(-10, 10)

plt.suptitle('Heisenberg Uncertainty: Narrower position → Broader momentum', 
             fontsize=12, fontweight='bold')
plt.tight_layout()
plt.savefig('uncertainty_demo.png', dpi=100)
plt.show()

print("For a Gaussian wave packet:")
print(f"  ΔxΔp = ℏ/2 = {hbar/2} (minimum uncertainty)")
print("This is the MINIMUM possible — most states have ΔxΔp > ℏ/2")
```

---

## Conjugate Variables

The uncertainty principle applies to **conjugate variable pairs** — properties that are related by a Fourier transform:

| Variable 1 | Variable 2 | Uncertainty Relation |
|---|---|---|
| Position $x$ | Momentum $p$ | $\Delta x \Delta p \geq \hbar/2$ |
| Energy $E$ | Time $t$ | $\Delta E \Delta t \geq \hbar/2$ |
| Angle $\theta$ | Angular momentum $L$ | $\Delta\theta \Delta L \geq \hbar/2$ |
| Number of particles $N$ | Phase $\phi$ | $\Delta N \Delta\phi \geq 1/2$ |

The last one (number-phase uncertainty) is directly relevant to quantum optics and certain qubit implementations.

---

## Key Takeaways

1. **The uncertainty principle is fundamental** — it's not about measurement limitations but about the nature of quantum reality.
2. **Conjugate variables** (position-momentum, energy-time) cannot both be precisely defined simultaneously.
3. **The formula** $\Delta x \cdot \Delta p \geq \hbar/2$ sets a hard lower bound on the product of uncertainties.
4. **Zero-point energy** exists because confining a particle increases its momentum uncertainty.
5. **No-cloning theorem** is a direct consequence — you cannot perfectly copy an unknown quantum state.
6. **Quantum cryptography** exploits the fact that measurement inevitably disturbs quantum states.
7. **For quantum computing**, this means qubits must be handled with care — you can't freely copy or measure them without consequences.

---

## Try It Yourself

1. **Calculate:** A proton is confined to a nucleus of radius $\Delta x = 1 \times 10^{-15}$ m. Find the minimum kinetic energy. (Hint: use $E = p^2/2m$ with $m_p = 1.67 \times 10^{-27}$ kg)

2. **Think:** If you could measure both position and momentum precisely, what would that imply about the particle's wavefunction? (Hint: think about what kind of function has both a definite position and a definite wavelength)

3. **Code Challenge:** Modify the Python code above to plot the momentum-space representation (Fourier transform) alongside the position-space representation. Verify that when one is narrow, the other is broad.

4. **Conceptual:** Explain why the uncertainty principle guarantees that quantum key distribution (QKD) is secure against eavesdropping.

---

## Next Lesson

In the next lesson, [Quantum Tunneling](12-qc-quantum-tunneling), we'll explore one of the most surprising consequences of quantum mechanics — how particles can pass through barriers that they classically shouldn't be able to penetrate. The energy-time uncertainty relation plays a key role in understanding this phenomenon!
