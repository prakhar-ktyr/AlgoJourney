---
title: Real-World Project - Library System
---

# Real-World Project: Library Management System

Let's put everything together by designing and building a **Library Management System** using OOP principles. This project demonstrates classes, inheritance, polymorphism, encapsulation, design patterns, and SOLID principles.

---

## Requirements

The system should:

1. Manage a catalog of items (books, DVDs, magazines)
2. Handle member registrations
3. Support borrowing and returning items
4. Track overdue items
5. Generate reports

---

## Step 1: Design the Class Hierarchy

```
                    ┌───────────────┐
                    │  LibraryItem   │ (abstract)
                    │ ─────────────  │
                    │ - id           │
                    │ - title        │
                    │ - available    │
                    │ + checkout()   │
                    │ + returnItem() │
                    └───────┬───────┘
               ┌───────────┼───────────┐
               ▼           ▼           ▼
          ┌────────┐  ┌────────┐  ┌──────────┐
          │  Book  │  │  DVD   │  │ Magazine  │
          └────────┘  └────────┘  └──────────┘

┌──────────┐    1    *  ┌──────────┐    1    1  ┌───────────┐
│  Member  │────────────│   Loan   │────────────│LibraryItem│
└──────────┘            └──────────┘            └───────────┘

┌──────────┐
│ Library  │ ◆── LibraryItem (composition)
│          │ ◇── Member (aggregation)
└──────────┘
```

---

## Step 2: Implement the Classes

### LibraryItem (Abstract Base)

```cpp
#include <iostream>
#include <string>
#include <stdexcept>

class LibraryItem {
protected:
    std::string id;
    std::string title;
    bool available;

public:
    LibraryItem(std::string id, std::string title)
        : id(std::move(id)), title(std::move(title)), available(true) {}

    virtual ~LibraryItem() = default;

    const std::string& getId() const { return id; }
    const std::string& getTitle() const { return title; }
    bool isAvailable() const { return available; }

    void checkout() {
        if (!available) throw std::runtime_error(title + " is already checked out");
        available = false;
    }

    void returnItem() { available = true; }

    virtual int getLoanPeriodDays() const = 0;
    virtual std::string getDetails() const = 0;
};
```

```csharp
using System;

public abstract class LibraryItem
{
    public string Id { get; }
    public string Title { get; }
    public bool Available { get; private set; } = true;

    protected LibraryItem(string id, string title)
    {
        Id = id;
        Title = title;
    }

    public void Checkout()
    {
        if (!Available)
            throw new InvalidOperationException($"{Title} is already checked out");
        Available = false;
    }

    public void ReturnItem() => Available = true;

    public abstract int GetLoanPeriodDays();
    public abstract string GetDetails();

    public override string ToString()
    {
        string status = Available ? "[Available]" : "[Checked Out]";
        return $"{GetDetails()} {status}";
    }
}
```

```java
import java.time.LocalDate;

abstract class LibraryItem {
    private String id;
    private String title;
    private boolean available;

    LibraryItem(String id, String title) {
        this.id = id;
        this.title = title;
        this.available = true;
    }

    String getId() { return id; }
    String getTitle() { return title; }
    boolean isAvailable() { return available; }

    void checkout() {
        if (!available) {
            throw new RuntimeException(title + " is already checked out");
        }
        available = false;
    }

    void returnItem() {
        available = true;
    }

    abstract int getLoanPeriodDays();
    abstract String getDetails();

    @Override
    public String toString() {
        return getDetails() + (available ? " [Available]" : " [Checked Out]");
    }
}
```

```python
from abc import ABC, abstractmethod
from datetime import datetime, timedelta

class LibraryItem(ABC):
    def __init__(self, item_id, title):
        self.item_id = item_id
        self.title = title
        self.available = True

    def checkout(self):
        if not self.available:
            raise RuntimeError(f"{self.title} is already checked out")
        self.available = False

    def return_item(self):
        self.available = True

    @abstractmethod
    def get_loan_period_days(self):
        pass

    @abstractmethod
    def get_details(self):
        pass

    def __str__(self):
        status = "[Available]" if self.available else "[Checked Out]"
        return f"{self.get_details()} {status}"
```

```javascript
class LibraryItem {
  constructor(id, title) {
    if (new.target === LibraryItem) {
      throw new Error("LibraryItem is abstract");
    }
    this.id = id;
    this.title = title;
    this.available = true;
  }

  checkout() {
    if (!this.available) {
      throw new Error(`${this.title} is already checked out`);
    }
    this.available = false;
  }

  returnItem() {
    this.available = true;
  }

  getLoanPeriodDays() { throw new Error("Not implemented"); }
  getDetails() { throw new Error("Not implemented"); }

  toString() {
    const status = this.available ? "[Available]" : "[Checked Out]";
    return `${this.getDetails()} ${status}`;
  }
}
```

### Concrete Item Types

```cpp
class Book : public LibraryItem {
    std::string author;
    std::string isbn;
    int pages;

public:
    Book(std::string id, std::string title, std::string author,
         std::string isbn, int pages)
        : LibraryItem(std::move(id), std::move(title)),
          author(std::move(author)), isbn(std::move(isbn)), pages(pages) {}

    int getLoanPeriodDays() const override { return 21; }  // 3 weeks

    std::string getDetails() const override {
        return "Book: \"" + title + "\" by " + author
             + " (ISBN: " + isbn + ", " + std::to_string(pages) + " pages)";
    }
};

class DVD : public LibraryItem {
    std::string director;
    int durationMinutes;

public:
    DVD(std::string id, std::string title, std::string director, int duration)
        : LibraryItem(std::move(id), std::move(title)),
          director(std::move(director)), durationMinutes(duration) {}

    int getLoanPeriodDays() const override { return 7; }

    std::string getDetails() const override {
        return "DVD: \"" + title + "\" dir. " + director
             + " (" + std::to_string(durationMinutes) + " min)";
    }
};

class Magazine : public LibraryItem {
    std::string issue;

public:
    Magazine(std::string id, std::string title, std::string issue)
        : LibraryItem(std::move(id), std::move(title)), issue(std::move(issue)) {}

    int getLoanPeriodDays() const override { return 14; }

    std::string getDetails() const override {
        return "Magazine: \"" + title + "\" — " + issue;
    }
};
```

```csharp
public class Book : LibraryItem
{
    public string Author { get; }
    public string Isbn { get; }
    public int Pages { get; }

    public Book(string id, string title, string author, string isbn, int pages)
        : base(id, title)
    {
        Author = author; Isbn = isbn; Pages = pages;
    }

    public override int GetLoanPeriodDays() => 21;

    public override string GetDetails()
        => $"Book: \"{Title}\" by {Author} (ISBN: {Isbn}, {Pages} pages)";
}

public class DVD : LibraryItem
{
    public string Director { get; }
    public int DurationMinutes { get; }

    public DVD(string id, string title, string director, int duration)
        : base(id, title)
    {
        Director = director; DurationMinutes = duration;
    }

    public override int GetLoanPeriodDays() => 7;

    public override string GetDetails()
        => $"DVD: \"{Title}\" dir. {Director} ({DurationMinutes} min)";
}

public class Magazine : LibraryItem
{
    public string Issue { get; }

    public Magazine(string id, string title, string issue)
        : base(id, title)
    {
        Issue = issue;
    }

    public override int GetLoanPeriodDays() => 14;

    public override string GetDetails()
        => $"Magazine: \"{Title}\" — {Issue}";
}
```

```java
class Book extends LibraryItem {
    private String author;
    private String isbn;
    private int pages;

    Book(String id, String title, String author, String isbn, int pages) {
        super(id, title);
        this.author = author;
        this.isbn = isbn;
        this.pages = pages;
    }

    @Override int getLoanPeriodDays() { return 21; }

    @Override String getDetails() {
        return "Book: \"" + getTitle() + "\" by " + author
             + " (ISBN: " + isbn + ", " + pages + " pages)";
    }
}

class DVD extends LibraryItem {
    private String director;
    private int durationMinutes;

    DVD(String id, String title, String director, int duration) {
        super(id, title);
        this.director = director;
        this.durationMinutes = duration;
    }

    @Override int getLoanPeriodDays() { return 7; }

    @Override String getDetails() {
        return "DVD: \"" + getTitle() + "\" dir. " + director
             + " (" + durationMinutes + " min)";
    }
}

class Magazine extends LibraryItem {
    private String issue;

    Magazine(String id, String title, String issue) {
        super(id, title);
        this.issue = issue;
    }

    @Override int getLoanPeriodDays() { return 14; }

    @Override String getDetails() {
        return "Magazine: \"" + getTitle() + "\" — " + issue;
    }
}
```

```python
class Book(LibraryItem):
    def __init__(self, item_id, title, author, isbn, pages):
        super().__init__(item_id, title)
        self.author = author
        self.isbn = isbn
        self.pages = pages

    def get_loan_period_days(self):
        return 21  # 3 weeks

    def get_details(self):
        return (f'Book: "{self.title}" by {self.author}'
                f' (ISBN: {self.isbn}, {self.pages} pages)')

class DVD(LibraryItem):
    def __init__(self, item_id, title, director, duration):
        super().__init__(item_id, title)
        self.director = director
        self.duration_minutes = duration

    def get_loan_period_days(self):
        return 7

    def get_details(self):
        return f'DVD: "{self.title}" dir. {self.director} ({self.duration_minutes} min)'

class Magazine(LibraryItem):
    def __init__(self, item_id, title, issue):
        super().__init__(item_id, title)
        self.issue = issue

    def get_loan_period_days(self):
        return 14

    def get_details(self):
        return f'Magazine: "{self.title}" — {self.issue}'
```

```javascript
class Book extends LibraryItem {
  constructor(id, title, author, isbn, pages) {
    super(id, title);
    this.author = author;
    this.isbn = isbn;
    this.pages = pages;
  }

  getLoanPeriodDays() { return 21; }

  getDetails() {
    return `Book: "${this.title}" by ${this.author} (ISBN: ${this.isbn}, ${this.pages} pages)`;
  }
}

class DVD extends LibraryItem {
  constructor(id, title, director, duration) {
    super(id, title);
    this.director = director;
    this.durationMinutes = duration;
  }

  getLoanPeriodDays() { return 7; }

  getDetails() {
    return `DVD: "${this.title}" dir. ${this.director} (${this.durationMinutes} min)`;
  }
}

class Magazine extends LibraryItem {
  constructor(id, title, issue) {
    super(id, title);
    this.issue = issue;
  }

  getLoanPeriodDays() { return 14; }

  getDetails() {
    return `Magazine: "${this.title}" — ${this.issue}`;
  }
}
```

### Member and Loan

```cpp
#include <vector>
#include <algorithm>
#include <chrono>

class Member;  // Forward declaration

class Loan {
    LibraryItem* item;
    Member* member;
    std::string borrowDate;
    std::string dueDate;
    bool returned;

public:
    Loan(LibraryItem* item, Member* member)
        : item(item), member(member), returned(false) {
        // Simplified date handling
        borrowDate = "2024-01-01";
        dueDate = "2024-01-22";  // borrowDate + loan period
    }

    LibraryItem* getItem() { return item; }
    bool isReturned() const { return returned; }
    void markReturned() { returned = true; }
};

class Member {
    std::string id;
    std::string name;
    std::string email;
    std::vector<Loan*> loanHistory;
    static const int MAX_LOANS = 5;

public:
    Member(std::string id, std::string name, std::string email)
        : id(std::move(id)), name(std::move(name)), email(std::move(email)) {}

    const std::string& getName() const { return name; }

    int getActiveLoans() const {
        return std::count_if(loanHistory.begin(), loanHistory.end(),
            [](Loan* l) { return !l->isReturned(); });
    }

    bool canBorrow() const { return getActiveLoans() < MAX_LOANS; }
    void addLoan(Loan* loan) { loanHistory.push_back(loan); }
};
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Loan
{
    public LibraryItem Item { get; }
    public Member Member { get; }
    public DateTime BorrowDate { get; }
    public DateTime DueDate { get; }
    public bool Returned { get; private set; }

    public Loan(LibraryItem item, Member member)
    {
        Item = item;
        Member = member;
        BorrowDate = DateTime.Now;
        DueDate = BorrowDate.AddDays(item.GetLoanPeriodDays());
    }

    public bool IsOverdue => !Returned && DateTime.Now > DueDate;
    public void MarkReturned() => Returned = true;
}

public class Member
{
    private const int MaxLoans = 5;
    private readonly List<Loan> _loanHistory = new();

    public string Id { get; }
    public string Name { get; }
    public string Email { get; }

    public Member(string id, string name, string email)
    {
        Id = id; Name = name; Email = email;
    }

    public int ActiveLoans => _loanHistory.Count(l => !l.Returned);
    public bool CanBorrow() => ActiveLoans < MaxLoans;
    public void AddLoan(Loan loan) => _loanHistory.Add(loan);
}
```

```java
class Loan {
    private LibraryItem item;
    private Member member;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private boolean returned;

    Loan(LibraryItem item, Member member) {
        this.item = item;
        this.member = member;
        this.borrowDate = LocalDate.now();
        this.dueDate = borrowDate.plusDays(item.getLoanPeriodDays());
        this.returned = false;
    }

    boolean isOverdue() {
        return !returned && LocalDate.now().isAfter(dueDate);
    }

    void markReturned() { this.returned = true; }
    LibraryItem getItem() { return item; }
    Member getMember() { return member; }
    LocalDate getDueDate() { return dueDate; }
    boolean isReturned() { return returned; }
}

class Member {
    private String id;
    private String name;
    private String email;
    private List<Loan> loanHistory = new ArrayList<>();
    private static final int MAX_LOANS = 5;

    Member(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    String getId() { return id; }
    String getName() { return name; }

    int getActiveLoans() {
        return (int) loanHistory.stream().filter(l -> !l.isReturned()).count();
    }

    boolean canBorrow() { return getActiveLoans() < MAX_LOANS; }
    void addLoan(Loan loan) { loanHistory.add(loan); }
}
```

```python
class Loan:
    def __init__(self, item, member):
        self.item = item
        self.member = member
        self.borrow_date = datetime.now()
        self.due_date = self.borrow_date + timedelta(days=item.get_loan_period_days())
        self.returned = False

    def is_overdue(self):
        return not self.returned and datetime.now() > self.due_date

    def mark_returned(self):
        self.returned = True

class Member:
    MAX_LOANS = 5

    def __init__(self, member_id, name, email):
        self.member_id = member_id
        self.name = name
        self.email = email
        self.loan_history = []

    def get_active_loans(self):
        return sum(1 for loan in self.loan_history if not loan.returned)

    def can_borrow(self):
        return self.get_active_loans() < self.MAX_LOANS

    def add_loan(self, loan):
        self.loan_history.append(loan)
```

```javascript
class Loan {
  constructor(item, member) {
    this.item = item;
    this.member = member;
    this.borrowDate = new Date();
    this.dueDate = new Date();
    this.dueDate.setDate(this.borrowDate.getDate() + item.getLoanPeriodDays());
    this.returned = false;
  }

  isOverdue() {
    return !this.returned && new Date() > this.dueDate;
  }

  markReturned() {
    this.returned = true;
  }
}

class Member {
  static MAX_LOANS = 5;

  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.loanHistory = [];
  }

  getActiveLoans() {
    return this.loanHistory.filter(l => !l.returned).length;
  }

  canBorrow() {
    return this.getActiveLoans() < Member.MAX_LOANS;
  }

  addLoan(loan) {
    this.loanHistory.push(loan);
  }
}
```

### Library (Facade)

```cpp
#include <map>

class Library {
    std::string name;
    std::map<std::string, LibraryItem*> catalog;
    std::map<std::string, Member*> members;
    std::vector<Loan*> allLoans;

public:
    Library(std::string name) : name(std::move(name)) {}

    void addItem(LibraryItem* item) { catalog[item->getId()] = item; }
    void registerMember(Member* member) { members[member->getName()] = member; }

    Loan* borrowItem(const std::string& memberId, const std::string& itemId) {
        auto* member = members[memberId];
        auto* item = catalog[itemId];

        if (!item->isAvailable()) throw std::runtime_error("Item not available");
        if (!member->canBorrow()) throw std::runtime_error("Loan limit reached");

        item->checkout();
        auto* loan = new Loan(item, member);
        member->addLoan(loan);
        allLoans.push_back(loan);

        std::cout << member->getName() << " borrowed \"" << item->getTitle() << "\"\n";
        return loan;
    }

    void returnItem(Loan* loan) {
        loan->getItem()->returnItem();
        loan->markReturned();
        std::cout << "Returned: " << loan->getItem()->getTitle() << "\n";
    }
};
```

```csharp
public class Library
{
    private readonly string _name;
    private readonly Dictionary<string, LibraryItem> _catalog = new();
    private readonly Dictionary<string, Member> _members = new();
    private readonly List<Loan> _allLoans = new();

    public Library(string name) => _name = name;

    public void AddItem(LibraryItem item) => _catalog[item.Id] = item;
    public void RegisterMember(Member member) => _members[member.Id] = member;

    public Loan BorrowItem(string memberId, string itemId)
    {
        var member = _members[memberId];
        var item = _catalog[itemId];

        if (!item.Available) throw new InvalidOperationException("Item not available");
        if (!member.CanBorrow()) throw new InvalidOperationException("Loan limit reached");

        item.Checkout();
        var loan = new Loan(item, member);
        member.AddLoan(loan);
        _allLoans.Add(loan);

        Console.WriteLine($"{member.Name} borrowed \"{item.Title}\"");
        return loan;
    }

    public void ReturnItem(Loan loan)
    {
        loan.Item.ReturnItem();
        loan.MarkReturned();
        Console.WriteLine($"Returned: {loan.Item.Title}");
    }
}
```

```java
class Library {
    private String name;
    private Map<String, LibraryItem> catalog = new HashMap<>();
    private Map<String, Member> members = new HashMap<>();
    private List<Loan> allLoans = new ArrayList<>();

    Library(String name) { this.name = name; }

    void addItem(LibraryItem item) { catalog.put(item.getId(), item); }
    void registerMember(Member member) { members.put(member.getId(), member); }

    Loan borrowItem(String memberId, String itemId) {
        Member member = members.get(memberId);
        LibraryItem item = catalog.get(itemId);

        if (!item.isAvailable()) throw new RuntimeException("Item not available");
        if (!member.canBorrow()) throw new RuntimeException("Loan limit reached");

        item.checkout();
        Loan loan = new Loan(item, member);
        member.addLoan(loan);
        allLoans.add(loan);

        System.out.println(member.getName() + " borrowed \"" + item.getTitle() + "\"");
        return loan;
    }

    void returnItem(Loan loan) {
        loan.getItem().returnItem();
        loan.markReturned();
        System.out.println("Returned: " + loan.getItem().getTitle());
    }
}
```

```python
class Library:
    def __init__(self, name):
        self.name = name
        self.catalog = {}
        self.members = {}
        self.all_loans = []

    def add_item(self, item):
        self.catalog[item.item_id] = item

    def register_member(self, member):
        self.members[member.member_id] = member

    def borrow_item(self, member_id, item_id):
        member = self.members[member_id]
        item = self.catalog[item_id]

        if not item.available:
            raise RuntimeError("Item not available")
        if not member.can_borrow():
            raise RuntimeError("Loan limit reached")

        item.checkout()
        loan = Loan(item, member)
        member.add_loan(loan)
        self.all_loans.append(loan)

        print(f'{member.name} borrowed "{item.title}" — due {loan.due_date.date()}')
        return loan

    def return_item(self, loan):
        loan.item.return_item()
        loan.mark_returned()
        print(f"Returned: {loan.item.title}")
```

```javascript
class Library {
  constructor(name) {
    this.name = name;
    this.catalog = new Map();
    this.members = new Map();
    this.allLoans = [];
  }

  addItem(item) { this.catalog.set(item.id, item); }
  registerMember(member) { this.members.set(member.id, member); }

  borrowItem(memberId, itemId) {
    const member = this.members.get(memberId);
    const item = this.catalog.get(itemId);

    if (!item.available) throw new Error("Item not available");
    if (!member.canBorrow()) throw new Error("Loan limit reached");

    item.checkout();
    const loan = new Loan(item, member);
    member.addLoan(loan);
    this.allLoans.push(loan);

    console.log(`${member.name} borrowed "${item.title}"`);
    return loan;
  }

  returnItem(loan) {
    loan.item.returnItem();
    loan.markReturned();
    console.log(`Returned: ${loan.item.title}`);
  }
}
```

---

## Step 3: Use the System

```cpp
int main() {
    Library lib("City Public Library");

    Book book1("B001", "Clean Code", "Robert Martin", "978-0132350884", 464);
    DVD dvd1("D001", "The Matrix", "Wachowskis", 136);
    Magazine mag1("M001", "Scientific American", "March 2024");

    lib.addItem(&book1);
    lib.addItem(&dvd1);
    lib.addItem(&mag1);

    Member alice("U001", "Alice", "alice@example.com");
    lib.registerMember(&alice);

    Loan* loan = lib.borrowItem("Alice", "B001");
    lib.returnItem(loan);
    return 0;
}
```

```csharp
var lib = new Library("City Public Library");

lib.AddItem(new Book("B001", "Clean Code", "Robert Martin", "978-0132350884", 464));
lib.AddItem(new DVD("D001", "The Matrix", "Wachowskis", 136));
lib.AddItem(new Magazine("M001", "Scientific American", "March 2024"));

lib.RegisterMember(new Member("U001", "Alice", "alice@example.com"));
lib.RegisterMember(new Member("U002", "Bob", "bob@example.com"));

var loan1 = lib.BorrowItem("U001", "B001");
var loan2 = lib.BorrowItem("U002", "D001");

lib.ReturnItem(loan1);
```

```java
public class Main {
    public static void main(String[] args) {
        Library lib = new Library("City Public Library");

        lib.addItem(new Book("B001", "Clean Code", "Robert Martin",
                            "978-0132350884", 464));
        lib.addItem(new DVD("D001", "The Matrix", "Wachowskis", 136));
        lib.addItem(new Magazine("M001", "Scientific American", "March 2024"));

        lib.registerMember(new Member("U001", "Alice", "alice@example.com"));
        lib.registerMember(new Member("U002", "Bob", "bob@example.com"));

        Loan loan1 = lib.borrowItem("U001", "B001");
        Loan loan2 = lib.borrowItem("U002", "D001");

        lib.returnItem(loan1);
    }
}
```

```python
lib = Library("City Public Library")

lib.add_item(Book("B001", "Clean Code", "Robert Martin", "978-0132350884", 464))
lib.add_item(DVD("D001", "The Matrix", "Wachowskis", 136))
lib.add_item(Magazine("M001", "Scientific American", "March 2024"))

lib.register_member(Member("U001", "Alice", "alice@example.com"))
lib.register_member(Member("U002", "Bob", "bob@example.com"))

loan1 = lib.borrow_item("U001", "B001")
loan2 = lib.borrow_item("U002", "D001")

lib.return_item(loan1)
```

```javascript
const lib = new Library("City Public Library");

lib.addItem(new Book("B001", "Clean Code", "Robert Martin", "978-0132350884", 464));
lib.addItem(new DVD("D001", "The Matrix", "Wachowskis", 136));
lib.addItem(new Magazine("M001", "Scientific American", "March 2024"));

lib.registerMember(new Member("U001", "Alice", "alice@example.com"));
lib.registerMember(new Member("U002", "Bob", "bob@example.com"));

const loan1 = lib.borrowItem("U001", "B001");
const loan2 = lib.borrowItem("U002", "D001");

lib.returnItem(loan1);
```

---

## OOP Principles Applied

| Principle | How It's Used |
|-----------|--------------|
| **Encapsulation** | Private fields, controlled access via methods |
| **Inheritance** | `Book`, `DVD`, `Magazine` extend `LibraryItem` |
| **Polymorphism** | `getLoanPeriodDays()` and `getDetails()` differ per type |
| **Abstraction** | `LibraryItem` is abstract — defines what, not how |
| **SRP** | Each class has one responsibility |
| **OCP** | Add new item types without changing `Library` |
| **Composition** | `Library` contains items and members |
| **Facade** | `Library` provides simple interface to the system |

---

## Key Takeaways

- Real-world OOP projects combine **multiple principles** working together
- Start with the **class hierarchy design** before coding
- Use **abstract classes** for shared structure with varying behaviour
- Apply **SOLID principles** throughout
- The **Facade pattern** (`Library`) simplifies complex interactions
- Test each class independently, then test the integration

Next: **OOP Interview Questions** — prepare for technical interviews.
