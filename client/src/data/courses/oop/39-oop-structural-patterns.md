---
title: Structural Patterns
---

# Structural Patterns

Structural patterns deal with how classes and objects are **composed** to form larger structures. They help ensure that parts of a system work together efficiently.

---

## 1. Adapter Pattern

**Purpose**: Make incompatible interfaces work together. Acts as a bridge between two incompatible interfaces.

**Analogy**: A power adapter lets you plug a US device into a European outlet.

### Example

```cpp
#include <iostream>
#include <string>

// Existing interface your code uses
class MediaPlayer {
public:
    virtual void play(const std::string& filename) = 0;
    virtual ~MediaPlayer() = default;
};

// Third-party library with a different interface
class VLCPlayer {
public:
    void playVLC(const std::string& filename) {
        std::cout << "VLC playing: " << filename << std::endl;
    }
};

class FFmpegPlayer {
public:
    void playFFmpeg(const std::string& filename) {
        std::cout << "FFmpeg playing: " << filename << std::endl;
    }
};

// Adapter — makes VLCPlayer work as a MediaPlayer
class VLCAdapter : public MediaPlayer {
    VLCPlayer vlc_;
public:
    void play(const std::string& filename) override {
        vlc_.playVLC(filename);  // Delegates to VLC's method
    }
};

class FFmpegAdapter : public MediaPlayer {
    FFmpegPlayer ffmpeg_;
public:
    void play(const std::string& filename) override {
        ffmpeg_.playFFmpeg(filename);
    }
};

// Usage — all players look the same to the client
VLCAdapter player1;
FFmpegAdapter player2;

player1.play("movie.avi");   // VLC playing: movie.avi
player2.play("song.mp3");   // FFmpeg playing: song.mp3
```

```csharp
using System;

// Existing interface your code uses
interface IMediaPlayer {
    void Play(string filename);
}

// Third-party library with a different interface
class VLCPlayer {
    public void PlayVLC(string filename) =>
        Console.WriteLine($"VLC playing: {filename}");
}

class FFmpegPlayer {
    public void PlayFFmpeg(string filename) =>
        Console.WriteLine($"FFmpeg playing: {filename}");
}

// Adapter — makes VLCPlayer work as an IMediaPlayer
class VLCAdapter : IMediaPlayer {
    private readonly VLCPlayer _vlc = new();

    public void Play(string filename) =>
        _vlc.PlayVLC(filename);  // Delegates to VLC's method
}

class FFmpegAdapter : IMediaPlayer {
    private readonly FFmpegPlayer _ffmpeg = new();

    public void Play(string filename) =>
        _ffmpeg.PlayFFmpeg(filename);
}

// Usage — all players look the same to the client
IMediaPlayer player1 = new VLCAdapter();
IMediaPlayer player2 = new FFmpegAdapter();

player1.Play("movie.avi");   // VLC playing: movie.avi
player2.Play("song.mp3");   // FFmpeg playing: song.mp3
```

```java
// Existing interface your code uses
interface MediaPlayer {
    void play(String filename);
}

// Third-party library with a different interface
class VLCPlayer {
    void playVLC(String filename) {
        System.out.println("VLC playing: " + filename);
    }
}

class FFmpegPlayer {
    void playFFmpeg(String filename) {
        System.out.println("FFmpeg playing: " + filename);
    }
}

// Adapter — makes VLCPlayer work as a MediaPlayer
class VLCAdapter implements MediaPlayer {
    private VLCPlayer vlc;

    VLCAdapter() {
        this.vlc = new VLCPlayer();
    }

    @Override
    public void play(String filename) {
        vlc.playVLC(filename);  // Delegates to VLC's method
    }
}

class FFmpegAdapter implements MediaPlayer {
    private FFmpegPlayer ffmpeg;

    FFmpegAdapter() {
        this.ffmpeg = new FFmpegPlayer();
    }

    @Override
    public void play(String filename) {
        ffmpeg.playFFmpeg(filename);
    }
}

// Usage — all players look the same to the client
MediaPlayer player1 = new VLCAdapter();
MediaPlayer player2 = new FFmpegAdapter();

player1.play("movie.avi");    // VLC playing: movie.avi
player2.play("song.mp3");    // FFmpeg playing: song.mp3
```

```python
# Third-party library with a different interface
class VLCPlayer:
    def play_vlc(self, filename):
        print(f"VLC playing: {filename}")

class FFmpegPlayer:
    def play_ffmpeg(self, filename):
        print(f"FFmpeg playing: {filename}")

# Adapter — makes VLCPlayer work as a MediaPlayer
class VLCAdapter:
    def __init__(self):
        self.vlc = VLCPlayer()

    def play(self, filename):
        self.vlc.play_vlc(filename)

class FFmpegAdapter:
    def __init__(self):
        self.ffmpeg = FFmpegPlayer()

    def play(self, filename):
        self.ffmpeg.play_ffmpeg(filename)

# Usage — all players look the same to the client
player1 = VLCAdapter()
player2 = FFmpegAdapter()

player1.play("movie.avi")   # VLC playing: movie.avi
player2.play("song.mp3")   # FFmpeg playing: song.mp3
```

```javascript
// Third-party library with a different interface
class VLCPlayer {
  playVLC(filename) {
    console.log(`VLC playing: ${filename}`);
  }
}

class FFmpegPlayer {
  playFFmpeg(filename) {
    console.log(`FFmpeg playing: ${filename}`);
  }
}

// Adapter — makes VLCPlayer work as a MediaPlayer
class VLCAdapter {
  constructor() {
    this.vlc = new VLCPlayer();
  }

  play(filename) {
    this.vlc.playVLC(filename);  // Delegates to VLC's method
  }
}

class FFmpegAdapter {
  constructor() {
    this.ffmpeg = new FFmpegPlayer();
  }

  play(filename) {
    this.ffmpeg.playFFmpeg(filename);
  }
}

// Usage — all players look the same to the client
const player1 = new VLCAdapter();
const player2 = new FFmpegAdapter();

player1.play("movie.avi");   // VLC playing: movie.avi
player2.play("song.mp3");   // FFmpeg playing: song.mp3
```

---

## 2. Decorator Pattern

**Purpose**: Add new behaviour to objects **dynamically** without modifying their class. Wraps the original object with a decorator.

**Analogy**: Adding toppings to a pizza — each topping decorates the base pizza.

### Example

```cpp
#include <iostream>
#include <string>

// Base interface
class Coffee {
public:
    virtual double cost() const = 0;
    virtual std::string description() const = 0;
    virtual ~Coffee() = default;
};

// Concrete component
class SimpleCoffee : public Coffee {
public:
    double cost() const override { return 2.00; }
    std::string description() const override { return "Simple coffee"; }
};

// Decorator base
class CoffeeDecorator : public Coffee {
protected:
    Coffee* wrapped_;
public:
    CoffeeDecorator(Coffee* coffee) : wrapped_(coffee) { }
};

// Concrete decorators
class MilkDecorator : public CoffeeDecorator {
public:
    MilkDecorator(Coffee* coffee) : CoffeeDecorator(coffee) { }
    double cost() const override { return wrapped_->cost() + 0.50; }
    std::string description() const override { return wrapped_->description() + ", milk"; }
};

class SugarDecorator : public CoffeeDecorator {
public:
    SugarDecorator(Coffee* coffee) : CoffeeDecorator(coffee) { }
    double cost() const override { return wrapped_->cost() + 0.25; }
    std::string description() const override { return wrapped_->description() + ", sugar"; }
};

class WhipCreamDecorator : public CoffeeDecorator {
public:
    WhipCreamDecorator(Coffee* coffee) : CoffeeDecorator(coffee) { }
    double cost() const override { return wrapped_->cost() + 0.75; }
    std::string description() const override { return wrapped_->description() + ", whip cream"; }
};

// Usage — stack decorators!
SimpleCoffee base;
MilkDecorator withMilk(&base);
SugarDecorator withSugar(&withMilk);
WhipCreamDecorator order(&withSugar);

std::cout << order.description() << std::endl;  // Simple coffee, milk, sugar, whip cream
std::cout << "$" << order.cost() << std::endl;   // $3.5
```

```csharp
using System;

// Base interface
interface ICoffee {
    double Cost();
    string Description();
}

// Concrete component
class SimpleCoffee : ICoffee {
    public double Cost() => 2.00;
    public string Description() => "Simple coffee";
}

// Decorator base
abstract class CoffeeDecorator : ICoffee {
    protected ICoffee _wrapped;
    protected CoffeeDecorator(ICoffee coffee) { _wrapped = coffee; }
    public abstract double Cost();
    public abstract string Description();
}

// Concrete decorators
class MilkDecorator : CoffeeDecorator {
    public MilkDecorator(ICoffee coffee) : base(coffee) { }
    public override double Cost() => _wrapped.Cost() + 0.50;
    public override string Description() => _wrapped.Description() + ", milk";
}

class SugarDecorator : CoffeeDecorator {
    public SugarDecorator(ICoffee coffee) : base(coffee) { }
    public override double Cost() => _wrapped.Cost() + 0.25;
    public override string Description() => _wrapped.Description() + ", sugar";
}

class WhipCreamDecorator : CoffeeDecorator {
    public WhipCreamDecorator(ICoffee coffee) : base(coffee) { }
    public override double Cost() => _wrapped.Cost() + 0.75;
    public override string Description() => _wrapped.Description() + ", whip cream";
}

// Usage — stack decorators!
ICoffee order = new SimpleCoffee();
order = new MilkDecorator(order);
order = new SugarDecorator(order);
order = new WhipCreamDecorator(order);

Console.WriteLine(order.Description());  // Simple coffee, milk, sugar, whip cream
Console.WriteLine($"${order.Cost()}");   // $3.5
```

```java
// Base interface
interface Coffee {
    double cost();
    String description();
}

// Concrete component
class SimpleCoffee implements Coffee {
    @Override
    public double cost() { return 2.00; }

    @Override
    public String description() { return "Simple coffee"; }
}

// Decorator base
abstract class CoffeeDecorator implements Coffee {
    protected Coffee wrapped;

    CoffeeDecorator(Coffee coffee) {
        this.wrapped = coffee;
    }
}

// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee coffee) { super(coffee); }

    @Override
    public double cost() { return wrapped.cost() + 0.50; }

    @Override
    public String description() { return wrapped.description() + ", milk"; }
}

class SugarDecorator extends CoffeeDecorator {
    SugarDecorator(Coffee coffee) { super(coffee); }

    @Override
    public double cost() { return wrapped.cost() + 0.25; }

    @Override
    public String description() { return wrapped.description() + ", sugar"; }
}

class WhipCreamDecorator extends CoffeeDecorator {
    WhipCreamDecorator(Coffee coffee) { super(coffee); }

    @Override
    public double cost() { return wrapped.cost() + 0.75; }

    @Override
    public String description() { return wrapped.description() + ", whip cream"; }
}

// Usage — stack decorators!
Coffee order = new SimpleCoffee();
order = new MilkDecorator(order);
order = new SugarDecorator(order);
order = new WhipCreamDecorator(order);

System.out.println(order.description());  // Simple coffee, milk, sugar, whip cream
System.out.println("$" + order.cost());   // $3.50
```

```python
# Base component
class SimpleCoffee:
    def cost(self):
        return 2.00

    def description(self):
        return "Simple coffee"

# Decorators
class MilkDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 0.50

    def description(self):
        return self._coffee.description() + ", milk"

class SugarDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 0.25

    def description(self):
        return self._coffee.description() + ", sugar"

class WhipCreamDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 0.75

    def description(self):
        return self._coffee.description() + ", whip cream"

# Usage — stack decorators!
order = SimpleCoffee()
order = MilkDecorator(order)
order = SugarDecorator(order)
order = WhipCreamDecorator(order)

print(f"{order.description()}: ${order.cost()}")
# Simple coffee, milk, sugar, whip cream: $3.5
```

```javascript
// Base component
class SimpleCoffee {
  cost() { return 2.00; }
  description() { return "Simple coffee"; }
}

// Decorators
class MilkDecorator {
  constructor(coffee) { this._coffee = coffee; }
  cost() { return this._coffee.cost() + 0.50; }
  description() { return this._coffee.description() + ", milk"; }
}

class SugarDecorator {
  constructor(coffee) { this._coffee = coffee; }
  cost() { return this._coffee.cost() + 0.25; }
  description() { return this._coffee.description() + ", sugar"; }
}

class WhipCreamDecorator {
  constructor(coffee) { this._coffee = coffee; }
  cost() { return this._coffee.cost() + 0.75; }
  description() { return this._coffee.description() + ", whip cream"; }
}

// Usage — stack decorators!
let order = new SimpleCoffee();
order = new MilkDecorator(order);
order = new SugarDecorator(order);
order = new WhipCreamDecorator(order);

console.log(order.description());  // Simple coffee, milk, sugar, whip cream
console.log(`$${order.cost()}`);   // $3.5
```

### Real-world Example (Java)

Java I/O streams are decorators:

```java
new BufferedReader(new InputStreamReader(new FileInputStream("file.txt")))
```

---

## 3. Facade Pattern

**Purpose**: Provide a **simplified interface** to a complex subsystem.

**Analogy**: A hotel concierge — you tell them what you want, they handle the complex coordination.

### Example

```cpp
#include <iostream>
#include <string>
#include <vector>

// Complex subsystem classes
class CPU {
public:
    void freeze() { std::cout << "CPU frozen" << std::endl; }
    void jump(long position) { std::cout << "CPU jumping to " << position << std::endl; }
    void execute() { std::cout << "CPU executing" << std::endl; }
};

class Memory {
public:
    void load(long position, const std::vector<char>& data) {
        std::cout << "Loading data at " << position << std::endl;
    }
};

class HardDrive {
public:
    std::vector<char> read(long lba, int size) {
        std::cout << "Reading " << size << " bytes from disk" << std::endl;
        return std::vector<char>(size);
    }
};

// Facade — simple interface to the complex boot process
class ComputerFacade {
    CPU cpu_;
    Memory memory_;
    HardDrive hdd_;

public:
    void start() {
        std::cout << "=== Starting Computer ===" << std::endl;
        cpu_.freeze();
        auto bootData = hdd_.read(0, 1024);
        memory_.load(0, bootData);
        cpu_.jump(0);
        cpu_.execute();
        std::cout << "=== Computer Ready ===" << std::endl;
    }
};

// Client uses the simple facade
ComputerFacade computer;
computer.start();
// Client doesn't need to know about CPU, Memory, HardDrive internals
```

```csharp
using System;

// Complex subsystem classes
class CPU {
    public void Freeze() => Console.WriteLine("CPU frozen");
    public void Jump(long position) => Console.WriteLine($"CPU jumping to {position}");
    public void Execute() => Console.WriteLine("CPU executing");
}

class Memory {
    public void Load(long position, byte[] data) =>
        Console.WriteLine($"Loading data at {position}");
}

class HardDrive {
    public byte[] Read(long lba, int size) {
        Console.WriteLine($"Reading {size} bytes from disk");
        return new byte[size];
    }
}

// Facade — simple interface to the complex boot process
class ComputerFacade {
    private readonly CPU _cpu = new();
    private readonly Memory _memory = new();
    private readonly HardDrive _hdd = new();

    public void Start() {
        Console.WriteLine("=== Starting Computer ===");
        _cpu.Freeze();
        var bootData = _hdd.Read(0, 1024);
        _memory.Load(0, bootData);
        _cpu.Jump(0);
        _cpu.Execute();
        Console.WriteLine("=== Computer Ready ===");
    }
}

// Client uses the simple facade
var computer = new ComputerFacade();
computer.Start();
// Client doesn't need to know about CPU, Memory, HardDrive internals
```

```java
// Complex subsystem classes
class CPU {
    void freeze() { System.out.println("CPU frozen"); }
    void jump(long position) { System.out.println("CPU jumping to " + position); }
    void execute() { System.out.println("CPU executing"); }
}

class Memory {
    void load(long position, byte[] data) {
        System.out.println("Loading data at " + position);
    }
}

class HardDrive {
    byte[] read(long lba, int size) {
        System.out.println("Reading " + size + " bytes from disk");
        return new byte[size];
    }
}

// Facade — simple interface to the complex boot process
class ComputerFacade {
    private CPU cpu;
    private Memory memory;
    private HardDrive hdd;

    ComputerFacade() {
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hdd = new HardDrive();
    }

    void start() {
        System.out.println("=== Starting Computer ===");
        cpu.freeze();
        byte[] bootData = hdd.read(0, 1024);
        memory.load(0, bootData);
        cpu.jump(0);
        cpu.execute();
        System.out.println("=== Computer Ready ===");
    }
}

// Client uses the simple facade
ComputerFacade computer = new ComputerFacade();
computer.start();
// Client doesn't need to know about CPU, Memory, HardDrive internals
```

```python
# Complex subsystem classes
class CPU:
    def freeze(self):
        print("CPU frozen")

    def jump(self, position):
        print(f"CPU jumping to {position}")

    def execute(self):
        print("CPU executing")

class Memory:
    def load(self, position, data):
        print(f"Loading data at {position}")

class HardDrive:
    def read(self, lba, size):
        print(f"Reading {size} bytes from disk")
        return bytearray(size)

# Facade — simple interface to the complex boot process
class ComputerFacade:
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()
        self.hdd = HardDrive()

    def start(self):
        print("=== Starting Computer ===")
        self.cpu.freeze()
        boot_data = self.hdd.read(0, 1024)
        self.memory.load(0, boot_data)
        self.cpu.jump(0)
        self.cpu.execute()
        print("=== Computer Ready ===")

# Client uses the simple facade
computer = ComputerFacade()
computer.start()
# Client doesn't need to know about CPU, Memory, HardDrive internals
```

```javascript
// Complex subsystem classes
class CPU {
  freeze() { console.log("CPU frozen"); }
  jump(position) { console.log(`CPU jumping to ${position}`); }
  execute() { console.log("CPU executing"); }
}

class Memory {
  load(position, data) {
    console.log(`Loading data at ${position}`);
  }
}

class HardDrive {
  read(lba, size) {
    console.log(`Reading ${size} bytes from disk`);
    return new ArrayBuffer(size);
  }
}

// Facade — simple interface to the complex boot process
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hdd = new HardDrive();
  }

  start() {
    console.log("=== Starting Computer ===");
    this.cpu.freeze();
    const bootData = this.hdd.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log("=== Computer Ready ===");
  }
}

// Client uses the simple facade
const computer = new ComputerFacade();
computer.start();
// Client doesn't need to know about CPU, Memory, HardDrive internals
```

---

## When to Use Each Pattern

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Adapter** | Incompatible interfaces | Wrapper that translates |
| **Decorator** | Need to add behaviour dynamically | Wrapper that adds functionality |
| **Facade** | Complex subsystem | Simple unified interface |

---

## Key Takeaways

- **Adapter**: converts one interface to another — glue for incompatible classes
- **Decorator**: adds behaviour by wrapping — stackable and composable
- **Facade**: simplifies a complex subsystem — single entry point
- All three use **wrapping/composition** rather than inheritance
- Real-world usage: I/O streams (Decorator), API wrappers (Adapter), SDKs (Facade)

Next: **Behavioural Patterns** — Observer, Strategy, and Command.
