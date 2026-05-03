---
title: Encapsulation
---

# Encapsulation

**Encapsulation** is the first pillar of OOP. It means bundling data and the methods that operate on that data into a single unit (a class), and **restricting direct access** to the object's internal state.

---

## The Two Aspects of Encapsulation

1. **Bundling**: Data (attributes) and behaviour (methods) live together in a class
2. **Information hiding**: Internal details are hidden behind a public interface

Think of a **TV remote**:
- You press buttons (public interface)
- The circuit board, infrared transmitter, and signal encoding are hidden (internal details)
- You don't need to understand electronics to change the channel

---

## Encapsulation in Practice

### Without Encapsulation (Bad)

```cpp
class BankAccount {
public:
    string owner;
    double balance;      // Anyone can change this!
    string password;     // Exposed to everyone!
};

int main() {
    BankAccount acc;
    acc.balance = -999999;  // No validation
    acc.password = "";      // Wiped the password
    return 0;
}
```

```csharp
class BankAccount
{
    public string Owner;
    public double Balance;      // Anyone can change this!
    public string Password;     // Exposed to everyone!
}

BankAccount acc = new BankAccount();
acc.Balance = -999999;  // No validation
acc.Password = "";      // Wiped the password
```

```java
public class BankAccount {
    public String owner;
    public double balance;    // Anyone can change this!
    public String password;   // Exposed to everyone!
}

BankAccount acc = new BankAccount();
acc.balance = -999999;  // No validation
acc.password = "";       // Wiped the password
```

```python
class BankAccount:
    def __init__(self):
        self.owner = ""
        self.balance = 0       # Anyone can change this!
        self.password = ""     # Exposed to everyone!

acc = BankAccount()
acc.balance = -999999  # No validation
acc.password = ""      # Wiped the password
```

```javascript
class BankAccount {
    constructor() {
        this.owner = "";
        this.balance = 0;      // Anyone can change this!
        this.password = "";    // Exposed to everyone!
    }
}

const acc = new BankAccount();
acc.balance = -999999;  // No validation
acc.password = "";      // Wiped the password
```

### With Encapsulation (Good)

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
using namespace std;

class BankAccount {
private:
    string owner;
    double balance;
    string password;

public:
    BankAccount(string owner, double balance, string password) {
        this->owner = owner;
        this->balance = balance;
        this->password = password;
    }

    string getOwner() { return owner; }
    double getBalance() { return balance; }
    // No getPassword() — password is never exposed!

    void deposit(double amount) {
        if (amount <= 0) {
            throw invalid_argument("Amount must be positive");
        }
        balance += amount;
    }

    bool withdraw(double amount, string pwd) {
        if (password != pwd) {
            cout << "Wrong password" << endl;
            return false;
        }
        if (amount <= 0 || amount > balance) {
            cout << "Invalid amount" << endl;
            return false;
        }
        balance -= amount;
        return true;
    }
};
```

```csharp
using System;

class BankAccount
{
    private string owner;
    private double balance;
    private string password;

    public BankAccount(string owner, double balance, string password)
    {
        this.owner = owner;
        this.balance = balance;
        this.password = password;
    }

    public string Owner => owner;
    public double Balance => balance;
    // No Password property — password is never exposed!

    public void Deposit(double amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
        balance += amount;
    }

    public bool Withdraw(double amount, string pwd)
    {
        if (password != pwd)
        {
            Console.WriteLine("Wrong password");
            return false;
        }
        if (amount <= 0 || amount > balance)
        {
            Console.WriteLine("Invalid amount");
            return false;
        }
        balance -= amount;
        return true;
    }
}
```

```java
public class BankAccount {
    private String owner;
    private double balance;
    private String password;

    public BankAccount(String owner, double balance, String password) {
        this.owner = owner;
        this.balance = balance;
        this.password = password;
    }

    public String getOwner() {
        return owner;
    }

    public double getBalance() {
        return balance;
    }

    // No getPassword() — password is never exposed!

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        balance += amount;
    }

    public boolean withdraw(double amount, String pwd) {
        if (!password.equals(pwd)) {
            System.out.println("Wrong password");
            return false;
        }
        if (amount <= 0 || amount > balance) {
            System.out.println("Invalid amount");
            return false;
        }
        balance -= amount;
        return true;
    }
}
```

```python
class BankAccount:
    def __init__(self, owner, balance, password):
        self.__owner = owner
        self.__balance = balance
        self.__password = password

    @property
    def owner(self):
        return self.__owner

    @property
    def balance(self):
        return self.__balance

    # No password property — password is never exposed!

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.__balance += amount

    def withdraw(self, amount, pwd):
        if self.__password != pwd:
            print("Wrong password")
            return False
        if amount <= 0 or amount > self.__balance:
            print("Invalid amount")
            return False
        self.__balance -= amount
        return True
```

```javascript
class BankAccount {
    #owner;
    #balance;
    #password;

    constructor(owner, balance, password) {
        this.#owner = owner;
        this.#balance = balance;
        this.#password = password;
    }

    get owner() {
        return this.#owner;
    }

    get balance() {
        return this.#balance;
    }

    // No password getter — password is never exposed!

    deposit(amount) {
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
        this.#balance += amount;
    }

    withdraw(amount, pwd) {
        if (this.#password !== pwd) {
            console.log("Wrong password");
            return false;
        }
        if (amount <= 0 || amount > this.#balance) {
            console.log("Invalid amount");
            return false;
        }
        this.#balance -= amount;
        return true;
    }
}
```

Now:
- `balance` can never be set to a negative value
- `password` is never exposed outside the class
- All changes go through controlled, validated methods

---

## The Encapsulation Pattern

```
┌─────────────────────────────────────────┐
│              BankAccount                 │
│                                          │
│  ┌──── Private (hidden) ─────────────┐  │
│  │  owner: String                     │  │
│  │  balance: double                   │  │
│  │  password: String                  │  │
│  │  validatePassword(pwd): boolean    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌──── Public (interface) ───────────┐  │
│  │  getOwner(): String               │  │
│  │  getBalance(): double             │  │
│  │  deposit(amount): void            │  │
│  │  withdraw(amount, pwd): boolean   │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

---

## Complete Example — Thermostat

```cpp
#include <iostream>
using namespace std;

class Thermostat {
private:
    double temperature;
    double minTemp;
    double maxTemp;
    bool isOn;

public:
    Thermostat(double minTemp, double maxTemp) {
        this->minTemp = minTemp;
        this->maxTemp = maxTemp;
        this->temperature = minTemp;
        this->isOn = false;
    }

    void turnOn() {
        isOn = true;
        cout << "Thermostat ON" << endl;
    }

    void turnOff() {
        isOn = false;
        cout << "Thermostat OFF" << endl;
    }

    void setTemperature(double temp) {
        if (!isOn) {
            cout << "Turn on the thermostat first" << endl;
            return;
        }
        if (temp < minTemp || temp > maxTemp) {
            cout << "Temperature must be between "
                 << minTemp << " and " << maxTemp << endl;
            return;
        }
        temperature = temp;
        cout << "Temperature set to " << temp << "°" << endl;
    }

    double getTemperature() { return temperature; }
    bool getIsOn() { return isOn; }
};

int main() {
    Thermostat t(15.0, 30.0);

    t.setTemperature(22);   // Turn on the thermostat first
    t.turnOn();              // Thermostat ON
    t.setTemperature(22);   // Temperature set to 22°
    t.setTemperature(50);   // Temperature must be between 15 and 30
    return 0;
}
```

```csharp
using System;

class Thermostat
{
    private double temperature;
    private double minTemp;
    private double maxTemp;
    private bool isOn;

    public Thermostat(double minTemp, double maxTemp)
    {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        temperature = minTemp;
        isOn = false;
    }

    public void TurnOn()
    {
        isOn = true;
        Console.WriteLine("Thermostat ON");
    }

    public void TurnOff()
    {
        isOn = false;
        Console.WriteLine("Thermostat OFF");
    }

    public double Temperature
    {
        get { return temperature; }
        set
        {
            if (!isOn)
            {
                Console.WriteLine("Turn on the thermostat first");
                return;
            }
            if (value < minTemp || value > maxTemp)
            {
                Console.WriteLine($"Temperature must be between {minTemp} and {maxTemp}");
                return;
            }
            temperature = value;
            Console.WriteLine($"Temperature set to {value}°");
        }
    }

    public bool IsOn => isOn;
}

class Program
{
    static void Main()
    {
        Thermostat t = new Thermostat(15.0, 30.0);

        t.Temperature = 22;   // Turn on the thermostat first
        t.TurnOn();            // Thermostat ON
        t.Temperature = 22;   // Temperature set to 22°
        t.Temperature = 50;   // Temperature must be between 15 and 30
    }
}
```

```java
public class Thermostat {
    private double temperature;
    private double minTemp;
    private double maxTemp;
    private boolean isOn;

    public Thermostat(double minTemp, double maxTemp) {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        this.temperature = minTemp;
        this.isOn = false;
    }

    public void turnOn() {
        isOn = true;
        System.out.println("Thermostat ON");
    }

    public void turnOff() {
        isOn = false;
        System.out.println("Thermostat OFF");
    }

    public void setTemperature(double temp) {
        if (!isOn) {
            System.out.println("Turn on the thermostat first");
            return;
        }
        if (temp < minTemp || temp > maxTemp) {
            System.out.println("Temperature must be between "
                + minTemp + " and " + maxTemp);
            return;
        }
        this.temperature = temp;
        System.out.println("Temperature set to " + temp + "°");
    }

    public double getTemperature() {
        return temperature;
    }

    public boolean isOn() {
        return isOn;
    }

    public static void main(String[] args) {
        Thermostat t = new Thermostat(15.0, 30.0);

        t.setTemperature(22);   // Turn on the thermostat first
        t.turnOn();              // Thermostat ON
        t.setTemperature(22);   // Temperature set to 22.0°
        t.setTemperature(50);   // Temperature must be between 15.0 and 30.0
    }
}
```

```python
class Thermostat:
    def __init__(self, min_temp, max_temp):
        self._min_temp = min_temp
        self._max_temp = max_temp
        self._temperature = min_temp
        self._is_on = False

    def turn_on(self):
        self._is_on = True
        print("Thermostat ON")

    def turn_off(self):
        self._is_on = False
        print("Thermostat OFF")

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, temp):
        if not self._is_on:
            print("Turn on the thermostat first")
            return
        if temp < self._min_temp or temp > self._max_temp:
            print(f"Temperature must be between {self._min_temp} and {self._max_temp}")
            return
        self._temperature = temp
        print(f"Temperature set to {temp}°")

    @property
    def is_on(self):
        return self._is_on

t = Thermostat(15.0, 30.0)
t.temperature = 22    # Turn on the thermostat first
t.turn_on()           # Thermostat ON
t.temperature = 22    # Temperature set to 22°
t.temperature = 50    # Temperature must be between 15.0 and 30.0
```

```javascript
class Thermostat {
    #temperature;
    #minTemp;
    #maxTemp;
    #isOn;

    constructor(minTemp, maxTemp) {
        this.#minTemp = minTemp;
        this.#maxTemp = maxTemp;
        this.#temperature = minTemp;
        this.#isOn = false;
    }

    turnOn() {
        this.#isOn = true;
        console.log("Thermostat ON");
    }

    turnOff() {
        this.#isOn = false;
        console.log("Thermostat OFF");
    }

    get temperature() {
        return this.#temperature;
    }

    set temperature(temp) {
        if (!this.#isOn) {
            console.log("Turn on the thermostat first");
            return;
        }
        if (temp < this.#minTemp || temp > this.#maxTemp) {
            console.log(`Temperature must be between ${this.#minTemp} and ${this.#maxTemp}`);
            return;
        }
        this.#temperature = temp;
        console.log(`Temperature set to ${temp}°`);
    }

    get isOn() {
        return this.#isOn;
    }
}

const t = new Thermostat(15.0, 30.0);
t.temperature = 22;   // Turn on the thermostat first
t.turnOn();            // Thermostat ON
t.temperature = 22;   // Temperature set to 22°
t.temperature = 50;   // Temperature must be between 15 and 30
```

---

## Benefits of Encapsulation

| Benefit | Explanation |
|---------|-------------|
| **Data protection** | Prevents invalid or unauthorized changes |
| **Flexibility** | Internal implementation can change without affecting external code |
| **Maintainability** | Changes are localized to the class |
| **Debugging** | All modifications go through methods — easy to add logging |
| **Security** | Sensitive data (passwords, tokens) stays hidden |

---

## Encapsulation and Change

One of the biggest benefits: you can change the **internal implementation** without breaking external code.

```cpp
// Version 1: Store temperature in Celsius
class Thermostat {
private:
    double tempCelsius;
public:
    double getTemperature() {
        return tempCelsius;
    }
};

// Version 2: Store in Fahrenheit, convert on output
// External code doesn't change at all!
class Thermostat {
private:
    double tempFahrenheit;
public:
    double getTemperature() {
        return (tempFahrenheit - 32) * 5.0 / 9.0;  // Still returns Celsius
    }
};
```

```csharp
// Version 1: Store temperature in Celsius
class Thermostat
{
    private double tempCelsius;
    public double GetTemperature() => tempCelsius;
}

// Version 2: Store in Fahrenheit, convert on output
// External code doesn't change at all!
class Thermostat
{
    private double tempFahrenheit;
    public double GetTemperature() => (tempFahrenheit - 32) * 5.0 / 9.0;
}
```

```java
// Version 1: Store temperature in Celsius
public class Thermostat {
    private double tempCelsius;

    public double getTemperature() {
        return tempCelsius;
    }
}

// Version 2: Store in Fahrenheit, convert on output
// External code doesn't change at all!
public class Thermostat {
    private double tempFahrenheit;

    public double getTemperature() {
        return (tempFahrenheit - 32) * 5.0 / 9.0;  // Still returns Celsius
    }
}
```

```python
# Version 1: Store temperature in Celsius
class Thermostat:
    def __init__(self, temp):
        self._temp_celsius = temp

    @property
    def temperature(self):
        return self._temp_celsius

# Version 2: Store in Fahrenheit, convert on output
# External code doesn't change at all!
class Thermostat:
    def __init__(self, temp):
        self._temp_fahrenheit = temp * 9.0 / 5.0 + 32

    @property
    def temperature(self):
        return (self._temp_fahrenheit - 32) * 5.0 / 9.0
```

```javascript
// Version 1: Store temperature in Celsius
class Thermostat {
    #tempCelsius;
    constructor(temp) { this.#tempCelsius = temp; }
    get temperature() { return this.#tempCelsius; }
}

// Version 2: Store in Fahrenheit, convert on output
// External code doesn't change at all!
class Thermostat {
    #tempFahrenheit;
    constructor(temp) { this.#tempFahrenheit = temp * 9 / 5 + 32; }
    get temperature() { return (this.#tempFahrenheit - 32) * 5 / 9; }
}
```

Any code calling `getTemperature()` or accessing `temperature` continues to work — it doesn't know or care about the internal storage format.

---

## Key Takeaways

- Encapsulation = **bundling data + methods** and **hiding internals**
- Make attributes `private`, expose through `public` methods
- Getters/setters provide **controlled access** with validation
- External code uses the **public interface** and never touches internals directly
- You can change the implementation without breaking the interface
- Encapsulation makes code **safer**, **more flexible**, and **easier to maintain**

Next: **Inheritance Basics** — the second pillar of OOP.
