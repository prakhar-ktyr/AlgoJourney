---
title: Java Arrays
---

# Java Arrays

An **array** stores a fixed-size sequence of values of the same type. Arrays in Java are objects — declared once with a length, and indexed from `0`.

## Declaring and creating arrays

```java
int[] nums = new int[5];                // array of 5 ints, all zero
String[] names = new String[3];         // array of 3 strings, all null

int[] primes = {2, 3, 5, 7, 11};        // array literal
String[] colors = {"red", "green", "blue"};
```

The bracket can also follow the variable name (legacy C-style — prefer the form above):

```java
int nums[] = new int[5];   // works but less idiomatic
```

## Length and access

```java
int[] nums = {10, 20, 30, 40, 50};
System.out.println(nums.length);   // 5
System.out.println(nums[0]);       // 10
System.out.println(nums[4]);       // 50
nums[2] = 99;                       // modify
```

Indexing outside `[0, length-1]` throws `ArrayIndexOutOfBoundsException` at runtime.

> `length` is a **field**, not a method — no parentheses. (`String` uses `length()`, but arrays use `length`.)

## Iterating

### Classic `for` (index needed):

```java
for (int i = 0; i < nums.length; i++) {
    System.out.println(i + ": " + nums[i]);
}
```

### For-each (cleaner when the index doesn't matter):

```java
for (int n : nums) {
    System.out.println(n);
}
```

## Default values

A newly created array is filled with the default value of its element type — `0`, `0.0`, `false`, or `null`.

## 2D and multi-dimensional arrays

A 2D array is really an array of arrays:

```java
int[][] grid = new int[3][4];     // 3 rows × 4 columns

int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(matrix[1][2]); // 6

for (int r = 0; r < matrix.length; r++) {
    for (int c = 0; c < matrix[r].length; c++) {
        System.out.print(matrix[r][c] + " ");
    }
    System.out.println();
}
```

Rows can have different lengths (a "jagged" array):

```java
int[][] jagged = new int[3][];
jagged[0] = new int[]{1};
jagged[1] = new int[]{2, 3};
jagged[2] = new int[]{4, 5, 6};
```

## Useful array utilities

`java.util.Arrays` provides many helpers:

```java
import java.util.Arrays;

int[] a = {3, 1, 4, 1, 5, 9, 2, 6};

Arrays.sort(a);                          // {1,1,2,3,4,5,6,9}
int idx = Arrays.binarySearch(a, 5);    // index of 5 (array must be sorted)
int[] copy = Arrays.copyOf(a, 4);       // first 4 elements
int[] slice = Arrays.copyOfRange(a, 2, 5);
String text = Arrays.toString(a);        // "[1, 1, 2, 3, 4, 5, 6, 9]"
boolean same = Arrays.equals(a, copy);

int[] zeros = new int[5];
Arrays.fill(zeros, 7);                    // {7,7,7,7,7}
```

For 2D arrays, use `Arrays.deepToString(matrix)`.

## Array length is fixed

You cannot grow an array after creation. To add or remove elements, use `ArrayList` (covered later) or copy into a larger array:

```java
int[] bigger = Arrays.copyOf(a, a.length * 2);
```

## A complete example

```java
import java.util.Arrays;

public class ArrayDemo {
    public static void main(String[] args) {
        int[] scores = {72, 88, 95, 60, 84};

        Arrays.sort(scores);
        System.out.println("Sorted: " + Arrays.toString(scores));

        int total = 0;
        for (int s : scores) total += s;
        double avg = (double) total / scores.length;

        System.out.printf("Average: %.2f%n", avg);
        System.out.println("Highest: " + scores[scores.length - 1]);
    }
}
```

Next: reading **user input**.
