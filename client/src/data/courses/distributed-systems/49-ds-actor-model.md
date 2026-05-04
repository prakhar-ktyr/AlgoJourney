---
title: "The Actor Model"
---

# The Actor Model

The **Actor Model** is a mathematical model of concurrent computation that treats actors as the universal primitives of computation. Proposed by Carl Hewitt in 1973, it provides a powerful abstraction for building distributed, concurrent systems without shared mutable state.

---

## Origins and Motivation

Carl Hewitt, Peter Bishop, and Richard Steiger introduced the Actor Model in their 1973 paper "A Universal Modular Actor Formalism for Artificial Intelligence." The model was inspired by physics (quantum mechanics), programming languages (Lisp, Simula), and the need for a formal foundation for concurrent computation.

| Year | Milestone |
|------|-----------|
| 1973 | Carl Hewitt proposes the Actor Model |
| 1986 | Erlang created at Ericsson |
| 1995 | Erlang/OTP framework released |
| 2009 | Akka framework for JVM released |
| 2014 | Microsoft Orleans released |
| 2022 | Actor-based systems power most chat/gaming platforms |

---

## Core Concepts

An **actor** is the fundamental unit of computation. Each actor encapsulates:

1. **State** — private, mutable data accessible only to the actor itself
2. **Behavior** — logic that determines how the actor responds to messages
3. **Mailbox** — a queue of incoming messages waiting to be processed

```
┌─────────────────────────────┐
│          ACTOR              │
│  ┌───────────────────────┐  │
│  │   Private State       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   Behavior Logic      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   Mailbox (Queue)     │  │
│  │   [msg1][msg2][msg3]  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Key Properties

| Property | Description |
|----------|-------------|
| Encapsulated State | No shared memory; state is private to the actor |
| Message-Driven | Actors communicate exclusively via asynchronous messages |
| Single-Threaded Processing | Each actor processes one message at a time |
| Location Transparency | Actors can be local or remote; the interface is the same |
| Lightweight | Actors are cheap to create (millions per system) |

---

## Actor Behaviors

When an actor receives a message, it can perform three fundamental actions:

### 1. Create New Actors

An actor can spawn child actors to delegate work:

```python
# Pseudocode: Actor creating child actors
class SupervisorActor:
    def on_receive(self, message):
        if message.type == "new_task":
            # Create a new worker actor
            worker = self.context.create_actor(WorkerActor)
            worker.send(Task(message.payload))
```

### 2. Send Messages to Other Actors

Communication is strictly asynchronous and non-blocking:

```python
# Pseudocode: Sending messages
class OrderActor:
    def on_receive(self, message):
        if message.type == "place_order":
            # Send messages to other actors
            self.inventory_actor.send(CheckStock(message.item))
            self.payment_actor.send(ChargeCard(message.card))
```

### 3. Change Its Own Behavior

An actor can designate how it handles the **next** message:

```python
# Pseudocode: Behavior change
class ConnectionActor:
    def on_receive(self, message):
        if message.type == "connect":
            self.state = "connected"
            # Change behavior for subsequent messages
            self.become(self.connected_behavior)

    def connected_behavior(self, message):
        if message.type == "disconnect":
            self.become(self.on_receive)
```

---

## The Mailbox

Every actor has a **mailbox** — a message queue that decouples senders from the actor's processing:

| Mailbox Type | Description | Use Case |
|--------------|-------------|----------|
| Unbounded | No limit on queue size | Default, general purpose |
| Bounded | Fixed capacity; back-pressure on overflow | Memory-constrained systems |
| Priority | Messages ordered by priority | Real-time systems |
| Deque-based | Double-ended, supports stashing | Complex protocols |

Messages are processed **one at a time** in mailbox order, guaranteeing:
- No data races on actor state
- Sequential consistency within a single actor
- Deterministic behavior for the same message sequence

---

## Erlang/OTP

Erlang is the language most closely associated with the Actor Model. Its lightweight **processes** are actors.

### Erlang Processes

```erlang
%% Define an actor (process) in Erlang
-module(counter).
-export([start/0, loop/1]).

start() ->
    spawn(fun() -> loop(0) end).

loop(Count) ->
    receive
        increment ->
            io:format("Count: ~p~n", [Count + 1]),
            loop(Count + 1);
        {get, Sender} ->
            Sender ! {count, Count},
            loop(Count);
        stop ->
            ok
    end.
```

```erlang
%% Using the counter actor
Pid = counter:start(),
Pid ! increment,
Pid ! increment,
Pid ! {get, self()},
receive
    {count, Value} -> io:format("Final: ~p~n", [Value])
end.
```

### OTP Supervision Trees

OTP (Open Telecom Platform) provides the **"let it crash"** philosophy via supervision trees:

```
        [Application]
             |
      [Top Supervisor]
       /      |       \
  [Worker] [Supervisor] [Worker]
              /    \
         [Worker] [Worker]
```

| Restart Strategy | Behavior |
|-----------------|----------|
| `one_for_one` | Only the crashed child is restarted |
| `one_for_all` | All children are restarted |
| `rest_for_one` | Crashed child and those started after it are restarted |
| `simple_one_for_one` | Dynamic pool of identical workers |

```erlang
%% OTP Supervisor example
-module(my_supervisor).
-behaviour(supervisor).
-export([start_link/0, init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    SupFlags = #{
        strategy => one_for_one,
        intensity => 5,      %% max 5 restarts
        period => 60         %% within 60 seconds
    },
    Children = [
        #{id => worker1,
          start => {my_worker, start_link, []},
          restart => permanent,
          type => worker}
    ],
    {ok, {SupFlags, Children}}.
```

### "Let It Crash" Philosophy

Instead of defensive programming with try/catch everywhere:

| Traditional Approach | Erlang/OTP Approach |
|---------------------|---------------------|
| Anticipate all errors | Let processes crash on unexpected errors |
| Complex error-handling code | Supervisors handle recovery |
| State may become corrupted | Fresh restart with clean state |
| Difficult to reason about | Simple, predictable recovery |

---

## Akka (Scala/Java)

Akka brings the Actor Model to the JVM ecosystem.

### ActorSystem and ActorRef

```scala
import akka.actor.{Actor, ActorSystem, Props}

// Define an actor
class GreetingActor extends Actor {
  var greetCount = 0

  def receive: Receive = {
    case name: String =>
      greetCount += 1
      println(s"Hello, $name! (greeting #$greetCount)")
    case "count" =>
      sender() ! greetCount
  }
}

// Create the actor system
val system = ActorSystem("MySystem")

// Create an actor instance (returns ActorRef)
val greeter = system.actorOf(Props[GreetingActor](), "greeter")

// Send messages (fire-and-forget)
greeter ! "Alice"
greeter ! "Bob"
```

### Props and Configuration

```scala
// Props define how to create an actor
val props = Props(new WorkerActor(config))

// Router for load balancing across actor pool
import akka.routing.RoundRobinPool

val router = system.actorOf(
  RoundRobinPool(5).props(Props[WorkerActor]()),
  "worker-pool"
)
```

### Akka Cluster

```scala
// Cluster-aware actor
class ClusterListener extends Actor {
  val cluster = Cluster(context.system)

  override def preStart(): Unit =
    cluster.subscribe(self, classOf[MemberEvent])

  def receive: Receive = {
    case MemberUp(member) =>
      println(s"Node joined: ${member.address}")
    case MemberRemoved(member, _) =>
      println(s"Node left: ${member.address}")
  }
}
```

| Akka Component | Purpose |
|---------------|---------|
| `ActorSystem` | Container for all actors; manages lifecycle |
| `ActorRef` | Handle to an actor; hides location |
| `Props` | Configuration for creating actors |
| `Dispatcher` | Thread pool that executes actors |
| `Router` | Distributes messages across actor pool |
| `Cluster` | Multi-node actor system coordination |

---

## Microsoft Orleans

Orleans introduces **virtual actors** (called **grains**) — actors that always exist conceptually and are automatically activated/deactivated.

### Virtual Actors (Grains)

```csharp
// Define a grain interface
public interface IPlayerGrain : IGrainWithStringKey
{
    Task<int> GetScore();
    Task AddPoints(int points);
    Task JoinGame(IGameGrain game);
}

// Implement the grain
public class PlayerGrain : Grain, IPlayerGrain
{
    private int _score;
    private IGameGrain _currentGame;

    public Task<int> GetScore() => Task.FromResult(_score);

    public Task AddPoints(int points)
    {
        _score += points;
        return Task.CompletedTask;
    }

    public Task JoinGame(IGameGrain game)
    {
        _currentGame = game;
        return game.AddPlayer(this.AsReference<IPlayerGrain>());
    }
}
```

### Activation and Lifecycle

```csharp
// Client code — no need to create or manage lifecycle
var player = grainFactory.GetGrain<IPlayerGrain>("player-42");
await player.AddPoints(100);  // Grain activates automatically if needed

// Grain lifecycle hooks
public class PlayerGrain : Grain, IPlayerGrain
{
    public override Task OnActivateAsync(CancellationToken ct)
    {
        // Called when grain is activated (loaded into memory)
        _score = await LoadFromDatabase();
        return base.OnActivateAsync(ct);
    }

    public override Task OnDeactivateAsync(DeactivationReason reason,
                                           CancellationToken ct)
    {
        // Called before grain is deactivated (removed from memory)
        await SaveToDatabase(_score);
        return base.OnDeactivateAsync(reason, ct);
    }
}
```

| Feature | Traditional Actors (Akka) | Virtual Actors (Orleans) |
|---------|--------------------------|--------------------------|
| Lifecycle | Explicit create/destroy | Automatic activation/deactivation |
| Identity | Created at runtime | Always exists virtually |
| Location | Must be discovered | Transparent placement |
| Failures | Supervision trees | Automatic re-activation |
| State | In-memory only | Persistent by default |

---

## Distributed Actors

### Location Transparency

Actors can be local or remote — the programming model stays the same:

```scala
// Local actor reference
val localActor = system.actorOf(Props[Worker](), "local-worker")

// Remote actor reference (same API!)
val remoteActor = system.actorSelection(
  "akka://RemoteSystem@192.168.1.10:2552/user/remote-worker"
)

// Both use the same send operation
localActor ! DoWork(task)
remoteActor ! DoWork(task)
```

### Actor Migration

Actors can be moved between nodes for:

| Reason | Description |
|--------|-------------|
| Load Balancing | Move actors from overloaded to idle nodes |
| Fault Recovery | Restart actors on healthy nodes after failure |
| Data Locality | Move computation closer to data |
| Cost Optimization | Consolidate actors to fewer machines during low load |

```
Node A                    Node B
┌──────────┐             ┌──────────┐
│ Actor X  │ ──migrate──▶│ Actor X  │
│ (state)  │             │ (state)  │
└──────────┘             └──────────┘
     ↑                        ↑
  Messages                 Messages
  redirected               arrive here
  automatically            now
```

---

## Actor Model vs Shared-State Concurrency

| Aspect | Actor Model | Shared-State (Locks/Mutexes) |
|--------|-------------|------------------------------|
| Communication | Message passing | Shared memory + synchronization |
| Data Races | Impossible (no shared state) | Must be prevented with locks |
| Deadlocks | Possible (circular message waits) | Common (lock ordering issues) |
| Scalability | Excellent (location transparent) | Limited (lock contention) |
| Reasoning | Each actor is sequential | Must reason about interleavings |
| Error Handling | Supervision hierarchies | Exception propagation |
| Distribution | Natural (same model local/remote) | Requires additional abstractions |
| Overhead | Message serialization cost | Lock acquisition cost |

---

## Comparison: Actor Model vs CSP (Go Channels)

CSP (Communicating Sequential Processes) is another concurrency model, used by Go:

```go
// CSP style (Go) — communication via channels
func worker(jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // Start workers
    for w := 0; w < 3; w++ {
        go worker(jobs, results)
    }

    // Send work
    for j := 0; j < 5; j++ {
        jobs <- j
    }
    close(jobs)
}
```

| Feature | Actor Model | CSP (Go Channels) |
|---------|-------------|-------------------|
| Identity | Named actors with addresses | Anonymous goroutines |
| Communication | Direct (actor-to-actor) | Via named channels |
| Channels | Implicit (mailbox per actor) | Explicit, first-class |
| Distribution | Built-in (location transparent) | Requires additional libraries |
| State | Encapsulated in actor | Shared via channel passing |
| Topology | Dynamic (actors create actors) | Static (channels wired at setup) |
| Buffering | Mailbox (usually unbounded) | Configurable per channel |
| Select | Pattern matching on messages | `select` statement on channels |

---

## Use Cases

### Gaming

- Each player, NPC, or game object is an actor
- Millions of concurrent entities
- Example: Riot Games uses actors for League of Legends backend

### IoT (Internet of Things)

- Each device represented as a virtual actor (digital twin)
- Handles intermittent connectivity naturally
- Example: Azure IoT with Orleans grains per device

### Trading Systems

- Each order, portfolio, or market feed is an actor
- Low-latency message processing
- Example: LMAX Exchange architecture

### Chat and Messaging

- Each chat room or user session is an actor
- Natural fit for presence and real-time updates
- Example: WhatsApp (Erlang-based, 2M connections/server)

---

## Implementation Patterns

### Request-Reply Pattern

```scala
import akka.pattern.ask
import akka.util.Timeout
import scala.concurrent.duration._

implicit val timeout: Timeout = Timeout(5.seconds)

// Ask pattern: sends message and expects a reply
val future = (actor ? GetBalance("account-123")).mapTo[BigDecimal]
val balance = Await.result(future, 5.seconds)
```

### Saga Pattern with Actors

```scala
class OrderSaga extends Actor {
  def receive: Receive = idle

  def idle: Receive = {
    case PlaceOrder(order) =>
      paymentActor ! ChargeCard(order.total)
      context.become(awaitingPayment(order))
  }

  def awaitingPayment(order: Order): Receive = {
    case PaymentSuccess(txId) =>
      inventoryActor ! ReserveItems(order.items)
      context.become(awaitingInventory(order, txId))
    case PaymentFailed(reason) =>
      sender() ! OrderFailed(reason)
      context.become(idle)
  }

  def awaitingInventory(order: Order, txId: String): Receive = {
    case ItemsReserved =>
      sender() ! OrderConfirmed(order.id)
      context.become(idle)
    case OutOfStock(item) =>
      paymentActor ! RefundPayment(txId)  // Compensating action
      sender() ! OrderFailed(s"Out of stock: $item")
      context.become(idle)
  }
}
```

---

## Exercises

1. **Conceptual**: Explain why the Actor Model eliminates data races. What concurrency bugs are still possible?

2. **Design**: Design an actor-based chat system. Identify actors for: users, chat rooms, message persistence, and presence tracking. Draw the message flow for sending a message.

3. **Erlang**: Write an Erlang module implementing a key-value store actor that supports `put`, `get`, and `delete` messages. Include a supervisor that restarts it on crash.

4. **Comparison**: You need to implement a pipeline that processes data through 5 stages. Compare how you would design this with (a) the Actor Model, (b) Go channels (CSP). Which is better suited and why?

5. **Orleans**: A multiplayer game has 100,000 active players and 10,000 game rooms. Explain how Orleans virtual actors simplify managing this compared to traditional actor frameworks.

6. **Fault Tolerance**: Design a supervision tree for a web crawler system with these components: URL frontier, page downloader, HTML parser, and link extractor. Choose appropriate restart strategies and justify your choices.

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Actor | Encapsulated state + behavior + mailbox |
| Three Actions | Create actors, send messages, change behavior |
| Erlang/OTP | Lightweight processes, supervision, "let it crash" |
| Akka | JVM actor framework with clustering and routing |
| Orleans | Virtual actors with automatic lifecycle management |
| Location Transparency | Same API for local and remote actors |
| vs Shared State | No locks, no data races, natural distribution |
| vs CSP | Actors have identity; channels are first-class in CSP |

The Actor Model remains one of the most effective abstractions for building resilient, scalable distributed systems — from telecom switches handling millions of calls to modern gaming platforms supporting millions of concurrent players.
