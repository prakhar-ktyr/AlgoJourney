---
title: C++ Math
---

# C++ Math

C++ provides a large set of math utilities through the `<cmath>` header (the C++ wrapper around C's `<math.h>`) and the `<numeric>` and `<random>` headers for more advanced needs.

```cpp
#include <cmath>
#include <iostream>
```

## Common math functions

| Function           | Meaning                         |
| ------------------ | ------------------------------- |
| `std::abs(x)`      | Absolute value                  |
| `std::sqrt(x)`     | Square root                     |
| `std::cbrt(x)`     | Cube root                       |
| `std::pow(x, y)`   | x raised to the power y         |
| `std::exp(x)`      | e^x                             |
| `std::log(x)`      | Natural log                     |
| `std::log10(x)`    | Log base 10                     |
| `std::log2(x)`     | Log base 2                      |
| `std::sin/cos/tan` | Trigonometry (radians)          |
| `std::asin`...     | Inverse trig                    |
| `std::floor(x)`    | Round down                      |
| `std::ceil(x)`     | Round up                        |
| `std::round(x)`    | Round to nearest                |
| `std::trunc(x)`    | Truncate toward zero            |
| `std::fmod(x, y)`  | Floating-point remainder        |
| `std::hypot(a,b)`  | √(a²+b²) without overflow       |

```cpp
std::cout << std::sqrt(16.0)     << '\n'; // 4
std::cout << std::pow(2.0, 10)   << '\n'; // 1024
std::cout << std::ceil(3.2)      << '\n'; // 4
std::cout << std::floor(3.8)     << '\n'; // 3
std::cout << std::abs(-7)        << '\n'; // 7
std::cout << std::hypot(3.0,4.0) << '\n'; // 5
```

## Min / max / clamp

In `<algorithm>`:

```cpp
#include <algorithm>
int a = std::min(3, 7);            // 3
int b = std::max({4, 1, 9, 2});    // 9 (initializer list, C++11)
int c = std::clamp(15, 0, 10);     // 10 (C++17)
```

## Constants

C++20 added `<numbers>`:

```cpp
#include <numbers>
double pi = std::numbers::pi;       // 3.1415...
double e  = std::numbers::e;
```

Pre-C++20 you can define your own:

```cpp
constexpr double PI = 3.14159265358979323846;
```

## Integer overflow

Built-in integer types **wrap around** (for unsigned) or are **undefined** (for signed) on overflow:

```cpp
int big = 2'000'000'000;
int oops = big + big; // signed overflow — undefined behavior
```

Use `long long` or `<cstdint>`'s wider types when you need bigger ranges.

## Random numbers

The old `rand()` is low quality. Modern C++ uses `<random>`:

```cpp
#include <random>

std::random_device rd;                    // seed source
std::mt19937 gen(rd());                   // Mersenne Twister engine
std::uniform_int_distribution<int> dice(1, 6);

int roll = dice(gen);                      // a random int from 1..6
```

For doubles between 0 and 1:

```cpp
std::uniform_real_distribution<double> uni(0.0, 1.0);
double r = uni(gen);
```

## Integer math helpers

`<numeric>` provides parallel-friendly numeric algorithms:

```cpp
#include <numeric>
#include <vector>

std::vector<int> v{1, 2, 3, 4, 5};
int sum     = std::accumulate(v.begin(), v.end(), 0);   // 15
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>{}); // 120
int g       = std::gcd(12, 18);     // 6  (C++17)
int l       = std::lcm(4, 6);       // 12 (C++17)
```

## Floating-point gotchas

Floats can't represent every decimal exactly:

```cpp
std::cout << (0.1 + 0.2 == 0.3) << '\n'; // 0 (false!)
```

When comparing doubles, use a tolerance:

```cpp
bool nearlyEqual(double a, double b, double eps = 1e-9) {
    return std::abs(a - b) < eps;
}
```

## Putting it together

```cpp
#include <iostream>
#include <cmath>
#include <random>

int main() {
    // Distance between two points
    double x1 = 1.0, y1 = 2.0;
    double x2 = 4.0, y2 = 6.0;
    double dist = std::hypot(x2 - x1, y2 - y1);
    std::cout << "Distance: " << dist << '\n';   // 5

    // Roll a die 5 times.
    std::mt19937 gen(std::random_device{}());
    std::uniform_int_distribution<int> dice(1, 6);
    std::cout << "Rolls: ";
    for (int i = 0; i < 5; ++i) std::cout << dice(gen) << ' ';
    std::cout << '\n';
    return 0;
}
```

Next: [C++ Booleans](#).
