---
title: C++ Namespaces
---

# C++ Namespaces

A **namespace** is a named scope for symbols. They prevent naming collisions when code from different libraries lives in the same program.

## Defining a namespace

```cpp
namespace audio {
    int volume = 50;
    void play();
}

namespace audio {
    void mute();          // namespaces can be reopened to add more declarations
}
```

Use:

```cpp
audio::volume = 80;
audio::play();
audio::mute();
```

## Nested namespaces

C++17 lets you nest with `::`:

```cpp
namespace game::audio {
    void play();
}

game::audio::play();
```

## `using` declarations

Pull a single name into the current scope:

```cpp
void render() {
    using std::cout;
    cout << "frame\n";
}
```

`using namespace ns;` brings **all** names in. Don't do it at namespace scope in headers — it leaks into every file that includes them. In a `.cpp` file or inside a function it's usually fine.

```cpp
namespace ns = game::audio;     // namespace alias
ns::play();
```

## Anonymous namespaces

A nameless namespace gives its contents **internal linkage** — visible only within the current translation unit. This is the modern replacement for file-scope `static`:

```cpp
// renderer.cpp
namespace {
    void warmupCache();         // private to this file
    int  cacheHits = 0;
}
```

## ADL — argument-dependent lookup

When you call a function unqualified, the compiler also searches the namespaces of the **arguments' types**:

```cpp
namespace math {
    struct Vec { double x, y; };
    Vec normalize(Vec v);
}

int main() {
    math::Vec v{1, 2};
    auto n = normalize(v);      // finds math::normalize via ADL
}
```

ADL is why `std::cout << x` works without writing `std::operator<<` everywhere — `<<` is found in `std` because `cout` lives there.

## `inline` namespaces

Members of an `inline namespace` are visible as if they were in the enclosing namespace. This is how the standard library publishes versioned APIs:

```cpp
namespace lib {
    inline namespace v2 {
        void compute();
    }
}

lib::compute();         // resolves to lib::v2::compute
lib::v2::compute();     // also valid
```

## Tips

- Wrap your library code in a namespace named after the project.
- Use anonymous namespaces for helpers private to a `.cpp` file.
- Prefer fully-qualified names in headers; alias or `using` inside `.cpp` files.

## Putting it together

```cpp
#include <iostream>

namespace company::math {
    int add(int a, int b) { return a + b; }
}

namespace company::strings {
    std::string upper(std::string s) {
        for (auto& c : s) c = std::toupper(static_cast<unsigned char>(c));
        return s;
    }
}

namespace cm = company::math;       // alias

int main() {
    std::cout << cm::add(2, 3) << '\n';
    std::cout << company::strings::upper("hello") << '\n';
}
```
