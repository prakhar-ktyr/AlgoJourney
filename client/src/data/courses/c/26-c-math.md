---
title: C Math Functions
---

# C Math Functions

The standard math library lives in `<math.h>`. To use it, include the header **and** link with `-lm` on Linux:

```bash
gcc prog.c -lm -o prog
```

(On Windows / macOS the math library is part of the default C library — `-lm` is harmless.)

## Common functions

```c
#include <math.h>

double sqrt(double x);          /* √x */
double cbrt(double x);          /* ∛x (cube root) */
double pow(double base, double exp);  /* base^exp */
double exp(double x);           /* e^x */
double log(double x);           /* natural log (ln) */
double log2(double x);          /* base-2 log */
double log10(double x);         /* base-10 log */

double fabs(double x);          /* |x|        — fabs, not abs (which is for ints) */
double fmod(double a, double b);/* floating-point remainder */
double fmin(double a, double b);
double fmax(double a, double b);
double round(double x);         /* nearest integer, halves away from zero */
double floor(double x);         /* round toward -∞ */
double ceil (double x);         /* round toward +∞ */
double trunc(double x);         /* drop the fractional part */
```

Trig (angles in **radians**):

```c
double sin(double x), cos(double x), tan(double x);
double asin(double x), acos(double x), atan(double x);
double atan2(double y, double x);    /* angle of (x, y), full range */
```

Convert between degrees and radians yourself:

```c
#define DEG2RAD(d) ((d) * M_PI / 180.0)
#define RAD2DEG(r) ((r) * 180.0 / M_PI)
```

`M_PI` is a non-standard but widely available constant. Or just `const double PI = 3.141592653589793;`.

## Examples

```c
#include <stdio.h>
#include <math.h>

int main(void) {
    printf("sqrt(2)     = %.6f\n", sqrt(2.0));
    printf("2^10        = %.0f\n", pow(2.0, 10.0));
    printf("log(e)      = %.6f\n", log(M_E));
    printf("sin(30°)    = %.6f\n", sin(30.0 * M_PI / 180.0));
    printf("ceil(1.2)   = %.0f\n", ceil(1.2));
    printf("floor(-1.2) = %.0f\n", floor(-1.2));
    printf("round(2.5)  = %.0f\n", round(2.5));
    printf("fmod(7,2.5) = %.2f\n", fmod(7.0, 2.5));
    return 0;
}
```

Output:

```
sqrt(2)     = 1.414214
2^10        = 1024
log(e)      = 1.000000
sin(30°)    = 0.500000
ceil(1.2)   = 2
floor(-1.2) = -1
round(2.5)  = 3
fmod(7,2.5) = 2.00
```

## Integer absolute value

For integers, `<stdlib.h>` provides:

```c
int      abs(int n);
long     labs(long n);
long long llabs(long long n);
```

(Don't confuse with `fabs` from `<math.h>` for floating point.)

## Random numbers

```c
#include <stdlib.h>
#include <time.h>

srand((unsigned)time(NULL));     // seed once, at program start
int r = rand();                  // 0 .. RAND_MAX
int dice = rand() % 6 + 1;       // 1..6 (slightly biased; OK for casual use)
```

`rand()` is a low-quality PRNG — fine for games and demos, **not** for cryptography.

## Common pitfalls

1. **Forgetting `-lm`** — link error like `undefined reference to sqrt`. Add `-lm` at the end of the gcc command.
2. **Using `abs` on a `double`** — `abs(3.7)` returns `3` because `abs` is `int`-only. Use `fabs`.
3. **Comparing `double` to `0` after `sqrt`** — `sqrt(-1.0)` is `NaN`, not `0`. Check with `isnan(x)`.
4. **Trig in degrees** — these functions take radians. Convert.
5. **`pow` is slow** — `pow(x, 2)` may be slower than `x * x`. For small integer exponents, multiply directly.

## Domain errors and special values

`<math.h>` defines several special values:

```c
#include <math.h>

double inf  = INFINITY;
double nan  = NAN;

if (isnan(x))     { /* x is Not-a-Number */ }
if (isinf(x))     { /* x is +/-infinity */ }
if (isfinite(x))  { /* x is a normal finite number */ }
```

`sqrt(-1.0)` returns `NaN`. `1.0 / 0.0` returns `+INFINITY`. These don't crash — they propagate through later math, which is sometimes desired and sometimes a bug. Check at the boundaries.

## Putting it together — distance between two points

```c
#include <stdio.h>
#include <math.h>

double distance(double x1, double y1, double x2, double y2) {
    double dx = x2 - x1;
    double dy = y2 - y1;
    return sqrt(dx * dx + dy * dy);
}

int main(void) {
    printf("d = %.4f\n", distance(0, 0, 3, 4));   // 5.0000
    return 0;
}
```
