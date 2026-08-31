import type { SeedCourse } from "./types";

export const javaCourse: SeedCourse = {
  slug: "java",
  title: "Java",
  language: "Java",
  tagline: "Learn the statically typed language behind Android apps and enterprise systems.",
  description:
    "A structured introduction to Java. You will set up the JDK, compile and run programs, learn Java's type system, control program flow, and write methods that work with arrays. Every concept is shown with runnable code.",
  icon: "java",
  accent: "#e76f00",
  order: 1,
  outcomes: [
    "Compile and run Java programs with javac and java",
    "Declare typed variables and use Java's primitive types",
    "Write conditionals, switches and loops",
    "Define methods with parameters and return types",
    "Create and process arrays",
  ],
  modules: [
    {
      slug: "getting-started",
      title: "Getting Started with Java",
      summary:
        "Install the JDK, understand how Java code becomes a running program, and write your first class.",
      objectives: [
        "Explain the role of the JDK, the compiler and the JVM",
        "Compile a .java file with javac",
        "Run a compiled class with java",
        "Describe the structure of a minimal Java program",
      ],
      lessons: [
        {
          slug: "jdk-and-jvm",
          title: "The JDK, the Compiler and the JVM",
          summary: "How source code turns into something the computer can execute.",
          objectives: [
            "Define bytecode and the JVM",
            "Explain why Java is called 'write once, run anywhere'",
            "Check that the JDK is installed",
          ],
          estimatedMinutes: 8,
          content: `## Three things with similar names

- **JDK** (Java Development Kit) — the full toolkit you install to write Java. It contains the compiler and the runtime.
- **javac** — the compiler. It turns \`.java\` source files into \`.class\` files containing **bytecode**.
- **JVM** (Java Virtual Machine) — the program that runs bytecode. The \`java\` command starts it.

## The build-and-run cycle

\`\`\`text
Hello.java   --javac-->   Hello.class   --java-->   program runs
(source)                  (bytecode)                (on the JVM)
\`\`\`

Bytecode is not tied to your operating system. The same \`.class\` file runs on Windows, macOS or Linux as long as a JVM is present. That is what "write once, run anywhere" means.

## Check your setup

\`\`\`bash
java -version
javac -version
\`\`\`

Both should report version 17 or newer. If \`javac\` is missing you have only a runtime (JRE); install a full JDK such as Temurin or the Oracle JDK.`,
        },
        {
          slug: "first-class",
          title: "Your First Class",
          summary: "The smallest complete Java program, line by line.",
          objectives: [
            "Write a class with a main method",
            "Compile and run it",
            "Explain each keyword in the main signature",
          ],
          estimatedMinutes: 10,
          content: `## Hello.java

Every Java program lives inside a class. Create a file named **Hello.java** — the file name must match the public class name.

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
\`\`\`

## Compile and run

\`\`\`bash
javac Hello.java     # produces Hello.class
java Hello           # prints: Hello, Java
\`\`\`

Note you run \`java Hello\`, not \`java Hello.class\`.

## What each part means

| Part | Meaning |
| --- | --- |
| \`public class Hello\` | Declares a class called Hello, visible to everything |
| \`public static void main\` | The method the JVM calls first |
| \`static\` | Belongs to the class, so the JVM can call it without creating an object |
| \`void\` | Returns nothing |
| \`String[] args\` | Command-line arguments passed to the program |
| \`System.out.println(...)\` | Prints a line to standard output |

Java statements end with a semicolon, and blocks are grouped with \`{ }\`. Indentation is for humans; the compiler ignores it.`,
        },
        {
          slug: "printing-and-comments",
          title: "Printing, Comments and Compiler Errors",
          summary: "Produce output, document code, and read what javac tells you when it fails.",
          objectives: [
            "Use print versus println",
            "Write the three comment styles",
            "Locate the problem from a compiler error",
          ],
          estimatedMinutes: 8,
          content: `## print and println

\`\`\`java
System.out.print("no newline");
System.out.print(" - still same line\\n");
System.out.println("println adds the newline for you");
System.out.println("Total: " + (3 * 4));   // string + number = "Total: 12"
\`\`\`

The \`+\` operator joins strings. When one side is a string, Java converts the other side to text.

## Comments

\`\`\`java
// single-line comment

/*
   block comment
   over several lines
*/

/**
 * Javadoc comment: documents the class or method below it
 * and can be turned into HTML docs.
 */
\`\`\`

## Reading a compiler error

\`\`\`java
public class Broken {
    public static void main(String[] args) {
        System.out.println("missing semicolon")
    }
}
\`\`\`

\`\`\`text
Broken.java:3: error: ';' expected
        System.out.println("missing semicolon")
                                               ^
1 error
\`\`\`

The message gives the file, the line number (3), the problem, and a caret pointing at where the compiler got stuck. Fix the first error first — later ones are often caused by it.`,
        },
      ],
      quiz: {
        title: "Getting Started Assessment",
        description: "Confirm you can compile and run Java before continuing.",
        questions: [
          {
            prompt: "What does javac produce from a .java file?",
            explanation:
              "javac compiles source to a .class file containing bytecode, which the JVM then runs.",
            options: [
              { text: "A .class file containing bytecode", correct: true },
              { text: "A native .exe file" },
              { text: "A running program" },
              { text: "A .jar file" },
            ],
          },
          {
            prompt: "Which command runs the compiled class Hello?",
            explanation: "You run  java Hello  — the class name, with no .class extension.",
            options: [
              { text: "java Hello", correct: true },
              { text: "java Hello.class" },
              { text: "javac Hello" },
              { text: "run Hello" },
            ],
          },
          {
            prompt: "Why must the main method be static?",
            explanation:
              "static means it belongs to the class, so the JVM can call it without first constructing an object.",
            options: [
              { text: "So the JVM can call it without creating an object", correct: true },
              { text: "So it runs faster" },
              { text: "So it can return a value" },
              { text: "It does not have to be static" },
            ],
          },
          {
            prompt: "What is printed by:  System.out.println(\"Total: \" + 3 + 4);",
            explanation:
              'Evaluation is left to right. "Total: " + 3 is "Total: 3", then + 4 appends "4", giving "Total: 34".',
            options: [
              { text: "Total: 34", correct: true },
              { text: "Total: 7" },
              { text: "Total: 3 4" },
              { text: "A compiler error" },
            ],
          },
          {
            prompt: "The public class name in a file must match what?",
            explanation: "The file name must be the public class name plus .java, e.g. class Hello in Hello.java.",
            options: [
              { text: "The file name", correct: true },
              { text: "The package name only" },
              { text: "The method name" },
              { text: "Nothing in particular" },
            ],
          },
        ],
      },
    },
    {
      slug: "variables-and-types",
      title: "Variables and Primitive Types",
      summary:
        "Java checks types at compile time. Learn the primitive types, how to declare variables, and how casting and operators behave.",
      objectives: [
        "Declare variables with an explicit type",
        "Use int, long, double, boolean, char",
        "Explain integer division and overflow",
        "Convert between types with casting",
      ],
      lessons: [
        {
          slug: "declaring-variables",
          title: "Declaring Typed Variables",
          summary: "Every variable has a fixed type decided when you declare it.",
          objectives: [
            "Declare and initialise variables",
            "Use final for constants",
            "Explain what 'statically typed' means",
          ],
          estimatedMinutes: 8,
          content: `## Type first

In Java you state the type, then the name:

\`\`\`java
int age = 30;
double price = 4.50;
boolean isMember = true;
String name = "Alex";        // String is a class, not a primitive
\`\`\`

Once declared, a variable's type never changes. \`age = "thirty";\` is a **compile error**. This is what "statically typed" means: types are checked before the program runs, which catches a whole class of bugs early.

## Declaration versus initialisation

\`\`\`java
int count;          // declared, no value yet
count = 5;          // initialised
int total = count;  // both at once
\`\`\`

Using a local variable before it is assigned is a compile error.

## Constants

\`final\` means the value cannot be reassigned. Constant names are conventionally upper case:

\`\`\`java
final double VAT_RATE = 0.20;
// VAT_RATE = 0.25;   // error: cannot assign a value to final variable
\`\`\``,
        },
        {
          slug: "primitive-types",
          title: "The Primitive Types",
          summary: "Eight built-in types and the values they hold.",
          objectives: [
            "List the numeric primitive types and their uses",
            "Describe char and boolean",
            "Predict the result of integer division",
          ],
          estimatedMinutes: 10,
          content: `## The eight primitives

| Type | Holds | Example |
| --- | --- | --- |
| \`int\` | whole numbers, 32-bit | \`42\` |
| \`long\` | whole numbers, 64-bit | \`9000000000L\` |
| \`double\` | decimal numbers, 64-bit | \`3.14\` |
| \`float\` | decimal numbers, 32-bit | \`3.14f\` |
| \`boolean\` | \`true\` or \`false\` | \`true\` |
| \`char\` | one character, in single quotes | \`'A'\` |
| \`byte\`, \`short\` | small whole numbers | \`100\` |

For everyday code you will mostly use \`int\`, \`long\`, \`double\` and \`boolean\`.

## Integer division

Dividing two \`int\` values gives an \`int\` — the fractional part is discarded, not rounded:

\`\`\`java
int a = 7 / 2;        // 3, not 3.5
double b = 7 / 2;     // still 3.0 — division happened before the assignment
double c = 7.0 / 2;   // 3.5 — one operand is a double
\`\`\`

## Overflow

\`int\` has a maximum of about 2.1 billion. Exceeding it wraps around silently:

\`\`\`java
int big = 2_147_483_647;
System.out.println(big + 1);   // -2147483648
\`\`\`

Use \`long\` when values may be large.`,
        },
        {
          slug: "casting-and-operators",
          title: "Casting and Operators",
          summary: "Convert between types deliberately and use Java's operators.",
          objectives: [
            "Apply widening and narrowing conversions",
            "Use arithmetic, comparison and logical operators",
            "Read compound assignment operators",
          ],
          estimatedMinutes: 9,
          content: `## Widening is automatic, narrowing is not

Going to a bigger type is safe and happens automatically:

\`\`\`java
int i = 100;
double d = i;      // fine: 100.0
\`\`\`

Going to a smaller type can lose data, so you must **cast** explicitly and accept the risk:

\`\`\`java
double price = 4.99;
int rounded = (int) price;   // 4 — the decimals are cut off
\`\`\`

## Operators

\`\`\`java
+  -  *  /  %          arithmetic (% is remainder)
== !=  <  >  <=  >=    comparison, result is boolean
&&  ||  !              logical AND, OR, NOT
+=  -=  *=  /=         compound assignment
++  --                 increment / decrement by 1
\`\`\`

\`\`\`java
int score = 10;
score += 5;      // 15
score++;         // 16
boolean pass = score >= 10 && score <= 100;   // true
\`\`\`

\`&&\` and \`||\` are **short-circuit**: if the left side already decides the result, the right side is not evaluated.`,
        },
      ],
      quiz: {
        title: "Variables and Types Assessment",
        description: "Check your grasp of Java's type system.",
        questions: [
          {
            prompt: "What is the value of  int result = 9 / 4;",
            explanation: "Both operands are int, so this is integer division: 2, with the remainder discarded.",
            options: [
              { text: "2", correct: true },
              { text: "2.25" },
              { text: "3" },
              { text: "2.0" },
            ],
          },
          {
            prompt: "Which conversion requires an explicit cast?",
            explanation:
              "double to int is narrowing and may lose data, so Java requires (int). int to double is automatic.",
            options: [
              { text: "double to int", correct: true },
              { text: "int to double" },
              { text: "int to long" },
              { text: "char to int" },
            ],
          },
          {
            prompt: "What does  final  mean when declaring a variable?",
            explanation: "final makes the variable's value unchangeable after it is first assigned.",
            options: [
              { text: "Its value cannot be reassigned", correct: true },
              { text: "It is the last variable in the class" },
              { text: "It cannot be read outside the method" },
              { text: "It is automatically zero" },
            ],
          },
          {
            prompt: "Why is Java called statically typed?",
            explanation:
              "Variable types are fixed and checked by the compiler before the program runs.",
            options: [
              { text: "Types are fixed and checked at compile time", correct: true },
              { text: "Variables never change value" },
              { text: "All variables are static" },
              { text: "It cannot use dynamic memory" },
            ],
          },
          {
            prompt: "What prints?  int x = 2_147_483_647; System.out.println(x + 1);",
            explanation:
              "That is Integer.MAX_VALUE. Adding 1 overflows and wraps to the minimum int, -2147483648.",
            options: [
              { text: "-2147483648", correct: true },
              { text: "2147483648" },
              { text: "0" },
              { text: "A runtime exception" },
            ],
          },
        ],
      },
    },
    {
      slug: "control-flow",
      title: "Control Flow",
      summary:
        "Direct the path of execution with if / else, switch, and the three kinds of loop.",
      objectives: [
        "Write if / else if / else",
        "Use a switch statement with break",
        "Choose between for, while and do-while",
        "Control loops with break and continue",
      ],
      lessons: [
        {
          slug: "if-else",
          title: "if, else if and else",
          summary: "Branch on boolean conditions.",
          objectives: [
            "Structure multi-way branching",
            "Avoid the dangling-else trap by using braces",
            "Use the ternary operator for simple choices",
          ],
          estimatedMinutes: 8,
          content: `## Basic branching

\`\`\`java
int score = 72;

if (score >= 80) {
    System.out.println("Distinction");
} else if (score >= 50) {
    System.out.println("Pass");
} else {
    System.out.println("Resit");
}
\`\`\`

The condition in the parentheses must be a \`boolean\`. Unlike some languages, \`if (score)\` with an \`int\` does not compile.

## Always use braces

This compiles but is a common source of bugs:

\`\`\`java
if (loggedIn)
    showDashboard();
    logAccess();          // runs ALWAYS — not part of the if
\`\`\`

Braces make the grouping explicit:

\`\`\`java
if (loggedIn) {
    showDashboard();
    logAccess();
}
\`\`\`

## The ternary operator

For choosing between two values, \`condition ? a : b\` is compact:

\`\`\`java
String result = (score >= 50) ? "Pass" : "Fail";
\`\`\``,
        },
        {
          slug: "switch",
          title: "The switch Statement",
          summary: "Compare one value against many fixed options.",
          objectives: [
            "Write a switch with case and default",
            "Explain fall-through and the role of break",
            "Know which types switch supports",
          ],
          estimatedMinutes: 8,
          content: `## switch on a single value

\`\`\`java
int day = 3;
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Another day");
}
\`\`\`

\`switch\` works with \`int\`, \`char\`, \`String\` and enums.

## Fall-through

Without \`break\`, execution continues into the next case. That is occasionally useful for grouping:

\`\`\`java
switch (day) {
    case 6:
    case 7:
        System.out.println("Weekend");
        break;
    default:
        System.out.println("Weekday");
}
\`\`\`

Forgetting \`break\` when you did not want fall-through is a classic bug. Modern Java also offers the arrow form \`case 6, 7 -> ...\` which does not fall through, but the classic form above is what you will see most often.`,
        },
        {
          slug: "loops",
          title: "for, while and do-while",
          summary: "Three loop forms and when each fits.",
          objectives: [
            "Write a counting for loop",
            "Use the enhanced for loop over an array",
            "Distinguish while from do-while",
          ],
          estimatedMinutes: 10,
          content: `## The counting for loop

\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.println(i);   // 0 1 2 3 4
}
\`\`\`

Three parts: initialise (\`int i = 0\`), condition checked before each pass (\`i < 5\`), update after each pass (\`i++\`).

## Enhanced for (for-each)

When you just need each element and not the index:

\`\`\`java
int[] scores = {58, 72, 91};
for (int s : scores) {
    System.out.println(s);
}
\`\`\`

## while and do-while

\`while\` checks first, so the body may run zero times:

\`\`\`java
int n = 5;
while (n > 0) {
    System.out.println(n);
    n--;
}
\`\`\`

\`do-while\` checks after, so the body always runs at least once:

\`\`\`java
int choice;
do {
    choice = readMenuChoice();
} while (choice != 0);
\`\`\`

## break and continue

\`break\` exits the loop; \`continue\` jumps to the next iteration.

\`\`\`java
for (int i = 1; i <= 20; i++) {
    if (i % 2 == 0) continue;   // skip evens
    if (i > 10) break;          // stop past 10
    System.out.println(i);      // 1 3 5 7 9
}
\`\`\``,
        },
      ],
      quiz: {
        title: "Control Flow Assessment",
        description: "Confirm you can branch and loop correctly.",
        questions: [
          {
            prompt: "Why does  if (count) { ... }  fail to compile in Java when count is an int?",
            explanation:
              "An if condition must be a boolean. Java does not treat non-zero ints as true.",
            options: [
              { text: "The condition must be a boolean, not an int", correct: true },
              { text: "count must be final" },
              { text: "You cannot use a variable in an if" },
              { text: "It does compile" },
            ],
          },
          {
            prompt: "In a classic switch, what happens if you omit break at the end of a case?",
            explanation:
              "Execution falls through into the following case(s) until a break or the end of the switch.",
            options: [
              { text: "Execution falls through into the next case", correct: true },
              { text: "A compile error" },
              { text: "The switch restarts" },
              { text: "Only the default runs" },
            ],
          },
          {
            prompt: "Which loop always executes its body at least once?",
            explanation: "do-while checks the condition after running the body, so it runs a minimum of once.",
            options: [
              { text: "do-while", correct: true },
              { text: "while" },
              { text: "for" },
              { text: "the enhanced for loop" },
            ],
          },
          {
            prompt: "How many numbers does this print?  for (int i = 0; i < 10; i += 2) System.out.println(i);",
            explanation: "i takes the values 0, 2, 4, 6, 8 — five iterations — then 10 fails the condition.",
            options: [
              { text: "5", correct: true },
              { text: "10" },
              { text: "4" },
              { text: "6" },
            ],
          },
          {
            prompt: "What does  continue  do inside a loop?",
            explanation: "It skips the rest of the current iteration and moves to the next one.",
            options: [
              { text: "Skips to the next iteration", correct: true },
              { text: "Exits the loop entirely" },
              { text: "Restarts the loop from the beginning" },
              { text: "Pauses the loop" },
            ],
          },
        ],
      },
    },
    {
      slug: "methods-and-arrays",
      title: "Methods and Arrays",
      summary:
        "Break programs into named methods with typed parameters and return values, and store fixed-size collections in arrays.",
      objectives: [
        "Define methods with parameters and a return type",
        "Explain pass-by-value in Java",
        "Create, index and iterate arrays",
        "Use array length and guard against out-of-bounds access",
      ],
      lessons: [
        {
          slug: "defining-methods",
          title: "Defining Methods",
          summary: "A method is a named, reusable block with a signature.",
          objectives: [
            "Read a method signature",
            "Return a value with return",
            "Overload a method by parameter list",
          ],
          estimatedMinutes: 9,
          content: `## Anatomy of a method

\`\`\`java
public class Calc {

    // returnType name(parameters)
    static int add(int a, int b) {
        return a + b;
    }

    static void printBanner(String text) {
        System.out.println("=== " + text + " ===");
        // no return needed: void
    }

    public static void main(String[] args) {
        int sum = add(3, 4);        // 7
        printBanner("Report");
    }
}
\`\`\`

- The **return type** comes before the name. \`void\` means "returns nothing".
- **Parameters** are typed, comma-separated.
- \`return\` sends a value back and ends the method. A non-void method must return on every path.

## Overloading

You can have several methods with the same name if their parameter lists differ:

\`\`\`java
static int max(int a, int b) { return a > b ? a : b; }
static double max(double a, double b) { return a > b ? a : b; }
\`\`\`

The compiler picks the version that matches the argument types.`,
        },
        {
          slug: "parameters-and-scope",
          title: "Parameters, Return Values and Pass-by-Value",
          summary: "How arguments are passed and where variables live.",
          objectives: [
            "Explain that Java passes arguments by value",
            "Describe method-local scope",
            "Predict whether a method can change a caller's variable",
          ],
          estimatedMinutes: 9,
          content: `## Java is pass-by-value

When you call a method, each argument is **copied** into the parameter. Changing the parameter inside the method does not affect the caller's variable:

\`\`\`java
static void tryToChange(int x) {
    x = 999;
}

public static void main(String[] args) {
    int score = 10;
    tryToChange(score);
    System.out.println(score);   // still 10
}
\`\`\`

For objects and arrays, the **value that is copied is the reference**. The method cannot make your variable point elsewhere, but it can change the object the reference points to:

\`\`\`java
static void bumpFirst(int[] data) {
    data[0] = data[0] + 1;      // visible to the caller
}
\`\`\`

## Scope

A parameter or a variable declared inside a method exists only until that method returns. Two methods can use the name \`i\` without any connection.

Prefer returning results over modifying shared state — it keeps methods easy to reason about and test.`,
        },
        {
          slug: "arrays",
          title: "Arrays",
          summary: "Fixed-size, indexed collections of one type.",
          objectives: [
            "Create arrays two ways",
            "Access elements and use .length",
            "Loop over an array and avoid IndexOutOfBoundsException",
          ],
          estimatedMinutes: 10,
          content: `## Creating arrays

\`\`\`java
int[] scores = new int[4];        // four ints, all 0
scores[0] = 58;
scores[1] = 72;

String[] langs = {"Java", "Python", "HTML"};   // literal, size inferred
\`\`\`

An array's length is fixed when it is created. To grow, you make a new array or use a \`List\`.

## Length and bounds

\`\`\`java
System.out.println(langs.length);   // 3  (a field, not a method — no parentheses)
System.out.println(langs[0]);       // Java
System.out.println(langs[3]);       // ArrayIndexOutOfBoundsException
\`\`\`

Valid indices run from \`0\` to \`length - 1\`.

## Iterating

\`\`\`java
int[] scores = {58, 72, 91, 44};

int total = 0;
for (int i = 0; i < scores.length; i++) {
    total += scores[i];
}

int highest = scores[0];
for (int s : scores) {
    if (s > highest) highest = s;
}
System.out.println("Average: " + (total / scores.length));
System.out.println("Highest: " + highest);
\`\`\`

Use the indexed \`for\` when you need the position; use the enhanced \`for\` when you only need each value.`,
        },
      ],
      quiz: {
        title: "Methods and Arrays Assessment",
        description: "The final Java assessment. Pass to complete the course.",
        questions: [
          {
            prompt: "A non-void method that does not return on every code path causes what?",
            explanation:
              "The compiler rejects it with 'missing return statement'. Every path must return the declared type.",
            options: [
              { text: "A compile error", correct: true },
              { text: "It returns 0" },
              { text: "It returns null" },
              { text: "A runtime exception" },
            ],
          },
          {
            prompt: "After  tryToChange(score)  where the method sets its int parameter to 999, what is score in the caller?",
            explanation:
              "Java passes primitives by value. The method changed its own copy; the caller's score is unchanged.",
            options: [
              { text: "Unchanged", correct: true },
              { text: "999" },
              { text: "0" },
              { text: "null" },
            ],
          },
          {
            prompt: "How do you get the number of elements in an array named data?",
            explanation: "data.length — it is a field, so there are no parentheses (unlike String.length()).",
            options: [
              { text: "data.length", correct: true },
              { text: "data.length()" },
              { text: "data.size()" },
              { text: "length(data)" },
            ],
          },
          {
            prompt: "What are the valid indices of an array of length 5?",
            explanation: "Indices run from 0 to length - 1, so 0, 1, 2, 3, 4. Index 5 throws.",
            options: [
              { text: "0 to 4", correct: true },
              { text: "1 to 5" },
              { text: "0 to 5" },
              { text: "1 to 4" },
            ],
          },
          {
            prompt: "What makes two methods valid overloads of each other?",
            explanation:
              "Same name but different parameter lists (number or types). Return type alone is not enough.",
            options: [
              { text: "Same name, different parameter lists", correct: true },
              { text: "Same name, different return type only" },
              { text: "Different names, same parameters" },
              { text: "They must be in different classes" },
            ],
          },
        ],
      },
    },
  ],
};
