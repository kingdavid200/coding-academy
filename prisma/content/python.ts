import type { SeedCourse } from "./types";

export const pythonCourse: SeedCourse = {
  slug: "python",
  title: "Python",
  language: "Python",
  tagline: "Start programming with the language used for automation, data and web apps.",
  description:
    "A hands-on introduction to Python. You will install Python, write and run programs, work with variables and data types, control the flow of a program with conditions and loops, and organise code into functions and data structures.",
  icon: "python",
  accent: "#3776ab",
  order: 2,
  outcomes: [
    "Run Python programs from the command line and the REPL",
    "Use variables, numbers, strings and booleans confidently",
    "Read input, convert types and format output with f-strings",
    "Write conditions, for loops and while loops",
    "Build and use functions, lists and dictionaries",
  ],
  modules: [
    {
      slug: "getting-started",
      title: "Getting Started with Python",
      summary:
        "Install Python, learn what it is good for, and run your first program from both the interactive shell and a file.",
      objectives: [
        "Describe what Python is and where it is used",
        "Run code in the Python REPL",
        "Create and run a .py file",
        "Use print() and write comments",
      ],
      lessons: [
        {
          slug: "what-is-python",
          title: "What Python Is and Why It Is Popular",
          summary: "A high-level look at the language, its design goals and common uses.",
          objectives: [
            "Explain what an interpreted language is",
            "Name three areas where Python is widely used",
          ],
          estimatedMinutes: 6,
          content: `## A language designed to be readable

Python is a general-purpose programming language created by Guido van Rossum and first released in 1991. Its guiding idea is that code is read far more often than it is written, so the syntax is deliberately close to plain English and uses indentation instead of braces to group code.

Python is **interpreted**. You do not compile it to a separate executable first; a program called the interpreter reads your instructions and runs them directly. That makes the write-run-fix cycle fast, which is good for learning.

## Where Python is used

- **Automation and scripting** — renaming files in bulk, calling web APIs, gluing tools together.
- **Data analysis and machine learning** — libraries such as pandas, NumPy and scikit-learn.
- **Web back ends** — frameworks such as Django and Flask.
- **Testing, dev-ops and teaching** — its readability makes it a common first language.

## Versions

Always use **Python 3**. Python 2 reached end of life in 2020 and should not be used for new work. When you see \`python\` and \`python3\` on the same machine, prefer \`python3\`.

\`\`\`bash
python3 --version
# Python 3.12.2
\`\`\`

If that command prints a version number, you are ready for the next lesson.`,
        },
        {
          slug: "running-python",
          title: "The REPL and Running Files",
          summary: "Use the interactive shell for quick experiments and .py files for real programs.",
          objectives: [
            "Start and exit the Python REPL",
            "Evaluate expressions interactively",
            "Run a script with the python3 command",
          ],
          estimatedMinutes: 8,
          content: `## The interactive shell (REPL)

REPL stands for Read-Evaluate-Print Loop. Start it by running \`python3\` with no arguments:

\`\`\`bash
python3
\`\`\`

You will see a \`>>>\` prompt. Type an expression and press Enter; Python evaluates it and prints the result immediately.

\`\`\`python
>>> 2 + 3
5
>>> "code" * 3
'codecodecode'
>>> len("Python")
6
\`\`\`

Exit with \`exit()\` or Ctrl-D (Ctrl-Z then Enter on Windows).

The REPL is perfect for checking how something behaves, but it forgets everything when you close it.

## Running a file

For anything you want to keep, put your code in a file ending in \`.py\`. Create \`hello.py\`:

\`\`\`python
print("Running from a file")
print(7 * 6)
\`\`\`

Run it from the same folder:

\`\`\`bash
python3 hello.py
\`\`\`

Output:

\`\`\`text
Running from a file
42
\`\`\`

Notice the difference: in a file, a bare expression like \`7 * 6\` produces no output. You must call \`print()\` to show a value.`,
        },
        {
          slug: "your-first-program",
          title: "print(), Comments and Errors",
          summary: "Show output, leave notes for humans, and read a traceback when something breaks.",
          objectives: [
            "Use print() with several arguments",
            "Write single-line and block comments",
            "Identify the useful line in a traceback",
          ],
          estimatedMinutes: 9,
          content: `## Printing output

\`print()\` writes text to the screen. It accepts several values separated by commas and puts a space between them:

\`\`\`python
name = "Sam"
print("Hello,", name)          # Hello, Sam
print("2 + 2 =", 2 + 2)        # 2 + 2 = 4
\`\`\`

You can change the separator and the ending:

\`\`\`python
print("a", "b", "c", sep="-")  # a-b-c
print("no newline here", end=" ")
print("same line")             # no newline here same line
\`\`\`

## Comments

A comment starts with \`#\` and is ignored by Python. Use comments to explain **why**, not to repeat what the code already says.

\`\`\`python
# Convert the pipe-separated file exported by the till system.
total = price * quantity  # quantity is always a whole number
\`\`\`

Python has no dedicated multi-line comment. For a longer note, put \`#\` on each line.

## Reading an error

When Python cannot run something it stops and prints a **traceback**. Read it from the bottom up:

\`\`\`python
print("start")
print(undefined_name)
\`\`\`

\`\`\`text
start
Traceback (most recent call last):
  File "hello.py", line 2, in <module>
    print(undefined_name)
NameError: name 'undefined_name' is not defined
\`\`\`

The last line names the error type (\`NameError\`) and the cause. The line above tells you exactly where. Most debugging starts here.`,
        },
      ],
      quiz: {
        title: "Getting Started Assessment",
        description: "Check that you can run Python and produce output before moving on.",
        questions: [
          {
            prompt: "Which command shows the installed Python 3 version?",
            explanation:
              "python3 --version prints the version. A bare `python` may point to Python 2 or may not exist.",
            options: [
              { text: "python3 --version", correct: true },
              { text: "python --run" },
              { text: "version python3" },
              { text: "py.check()" },
            ],
          },
          {
            prompt: "What does REPL stand for?",
            explanation:
              "Read-Evaluate-Print Loop: it reads what you type, evaluates it, prints the result, and loops.",
            options: [
              { text: "Read-Evaluate-Print Loop", correct: true },
              { text: "Run Every Python Line" },
              { text: "Remote Execution Protocol Layer" },
              { text: "Repeat-Edit-Preview-Launch" },
            ],
          },
          {
            prompt: "In a .py file, what does the line  5 + 5  display when you run it?",
            explanation:
              "Nothing. In a script a bare expression is evaluated and discarded. You need print(5 + 5) to see output.",
            options: [
              { text: "Nothing is displayed", correct: true },
              { text: "10" },
              { text: "5 + 5" },
              { text: "An error" },
            ],
          },
          {
            prompt: "What is printed by:  print(\"x\", \"y\", sep=\"-\")",
            explanation: "sep sets the string placed between arguments, so the output is x-y.",
            options: [
              { text: "x-y", correct: true },
              { text: "x y" },
              { text: "x, y" },
              { text: "xy-" },
            ],
          },
          {
            prompt: "When reading a Python traceback, where is the most specific information?",
            explanation:
              "The last line names the exception type and message; the line just above points to the code location.",
            options: [
              { text: "The last line", correct: true },
              { text: "The first line" },
              { text: "The middle line" },
              { text: "Tracebacks are random" },
            ],
          },
        ],
      },
    },
    {
      slug: "variables-and-types",
      title: "Variables and Data Types",
      summary:
        "Store values in variables, work with numbers, strings and booleans, read input from the user and convert between types.",
      objectives: [
        "Assign and reassign variables",
        "Use int, float, str and bool values",
        "Format text with f-strings",
        "Convert between strings and numbers with int() and float()",
      ],
      lessons: [
        {
          slug: "variables-and-assignment",
          title: "Variables and Assignment",
          summary: "Names that point at values, and the rules for choosing them.",
          objectives: [
            "Create variables with =",
            "Follow Python naming conventions",
            "Predict the result of reassignment",
          ],
          estimatedMinutes: 7,
          content: `## Assigning a value

A variable is a name that refers to a value. Create one with a single \`=\`:

\`\`\`python
price = 4.50
quantity = 3
customer_name = "Alex"
\`\`\`

The right-hand side is evaluated first, then the result is bound to the name on the left. Reading \`price\` now gives \`4.5\`.

## Reassignment

A variable can be pointed at a new value at any time, including one computed from its old value:

\`\`\`python
score = 10
score = score + 5   # score is now 15
score += 1          # shorthand for score = score + 1, now 16
\`\`\`

## Naming rules and conventions

- Must start with a letter or underscore, then letters, digits or underscores.
- Case-sensitive: \`total\` and \`Total\` are different.
- Cannot be a keyword such as \`if\`, \`for\`, \`class\`, \`return\`.
- **Convention:** use \`lower_snake_case\` for variables. Choose descriptive names: \`unit_price\`, not \`up\`.

\`\`\`python
items_in_cart = 3      # good
x = 3                  # legal but unclear
\`\`\``,
        },
        {
          slug: "numbers-and-strings",
          title: "Numbers, Strings and Booleans",
          summary: "The core built-in types and the operators that go with them.",
          objectives: [
            "Distinguish int from float",
            "Use +, -, *, /, //, % and **",
            "Combine strings and use common string methods",
          ],
          estimatedMinutes: 10,
          content: `## Numbers

Python has two everyday number types:

- \`int\` — whole numbers: \`0\`, \`42\`, \`-7\`
- \`float\` — numbers with a decimal point: \`3.14\`, \`-0.5\`, \`2.0\`

\`\`\`python
7 + 2      # 9
7 - 2      # 5
7 * 2      # 14
7 / 2      # 3.5   division always gives a float
7 // 2     # 3     floor division, drops the remainder
7 % 2      # 1     modulo, the remainder
2 ** 10    # 1024  exponentiation
\`\`\`

## Strings

A string is text in single or double quotes. Join them with \`+\` and repeat with \`*\`:

\`\`\`python
first = "Ada"
last = "Lovelace"
full = first + " " + last     # "Ada Lovelace"
line = "-" * 20                # twenty dashes
\`\`\`

Strings have useful methods:

\`\`\`python
"  hello  ".strip()      # "hello"
"Python".upper()          # "PYTHON"
"a,b,c".split(",")       # ['a', 'b', 'c']
"code".startswith("co")  # True
len("Python")             # 6
\`\`\`

Strings are **immutable**: a method returns a new string rather than changing the original.

## Booleans

\`bool\` has two values, \`True\` and \`False\`. Comparisons produce booleans:

\`\`\`python
3 > 2        # True
3 == 4       # False   == compares, = assigns
"a" in "cat" # True
\`\`\``,
        },
        {
          slug: "input-and-conversion",
          title: "Input, Type Conversion and f-strings",
          summary: "Read from the user, turn text into numbers, and build readable output.",
          objectives: [
            "Use input() to read a line of text",
            "Convert with int() and float() and handle bad input",
            "Interpolate values with f-strings",
          ],
          estimatedMinutes: 9,
          content: `## Reading input

\`input()\` pauses the program, waits for the user to type a line, and returns it **as a string** — always, even if they type digits.

\`\`\`python
name = input("What is your name? ")
print("Hi " + name)
\`\`\`

## Converting types

Because \`input()\` gives text, you must convert before doing maths:

\`\`\`python
age_text = input("Age: ")     # "30"
age = int(age_text)            # 30 as an int
next_year = age + 1
\`\`\`

\`int("abc")\` raises \`ValueError\`. \`float("3.5")\` works; \`int("3.5")\` does not. Convert the other way with \`str(number)\`.

## f-strings

An f-string is a string prefixed with \`f\`. Anything in \`{ }\` is evaluated and inserted:

\`\`\`python
unit_price = 2.5
quantity = 4
total = unit_price * quantity
print(f"{quantity} items at £{unit_price} = £{total}")
# 4 items at £2.5 = £10.0
\`\`\`

You can format numbers inside the braces:

\`\`\`python
print(f"Total: £{total:.2f}")   # Total: £10.00
print(f"{0.256:.0%}")            # 26%
\`\`\`

f-strings are the standard way to build output in modern Python.`,
        },
      ],
      quiz: {
        title: "Variables and Data Types Assessment",
        description: "Confirm you can store, convert and format values.",
        questions: [
          {
            prompt: "What is the type and value of  7 / 2  in Python 3?",
            explanation: "The / operator always returns a float, so 7 / 2 is 3.5, not 3.",
            options: [
              { text: "float 3.5", correct: true },
              { text: "int 3" },
              { text: "int 4" },
              { text: "float 3.0" },
            ],
          },
          {
            prompt: "What does  input(\"Age: \")  return when the user types 30?",
            explanation:
              "input() always returns a string. You get \"30\", and must call int() to use it as a number.",
            options: [
              { text: 'The string "30"', correct: true },
              { text: "The integer 30" },
              { text: "The float 30.0" },
              { text: "None" },
            ],
          },
          {
            prompt: "Which expression produces the remainder of 17 divided by 5?",
            explanation: "% is the modulo operator. 17 % 5 is 2. // would give the quotient 3.",
            options: [
              { text: "17 % 5", correct: true },
              { text: "17 // 5" },
              { text: "17 / 5" },
              { text: "17 ** 5" },
            ],
          },
          {
            prompt: "What is printed by:  total = 10.0; print(f\"£{total:.2f}\")",
            explanation: "The :.2f format specifier shows the float with exactly two decimal places.",
            options: [
              { text: "£10.00", correct: true },
              { text: "£10.0" },
              { text: "£10" },
              { text: "£{total:.2f}" },
            ],
          },
          {
            prompt: "Why does  \"Python\".upper()  not change the original string?",
            explanation:
              "Strings are immutable. String methods return a new string and leave the original untouched.",
            options: [
              { text: "Strings are immutable, so methods return a new string", correct: true },
              { text: "upper() only works on variables" },
              { text: "You must use upper(\"Python\") instead" },
              { text: "It does change it" },
            ],
          },
        ],
      },
    },
    {
      slug: "control-flow",
      title: "Making Decisions and Repeating Work",
      summary:
        "Branch with if / elif / else, repeat with for and while loops, and store sequences of values in lists.",
      objectives: [
        "Write if / elif / else with correct indentation",
        "Loop over ranges and sequences with for",
        "Use while for condition-based repetition",
        "Create, index and modify lists",
      ],
      lessons: [
        {
          slug: "comparisons-and-if",
          title: "Conditions with if, elif and else",
          summary: "Run different code depending on whether a condition is true.",
          objectives: [
            "Use the comparison and logical operators",
            "Structure if / elif / else blocks",
            "Understand truthy and falsy values",
          ],
          estimatedMinutes: 9,
          content: `## Comparisons

\`\`\`python
==   equal to          !=   not equal to
<    less than          >    greater than
<=   less or equal      >=   greater or equal
\`\`\`

Combine conditions with \`and\`, \`or\`, \`not\`:

\`\`\`python
age = 20
has_ticket = True
if age >= 18 and has_ticket:
    print("Welcome in")
\`\`\`

## if / elif / else

Python groups the conditional body by **indentation** (four spaces is standard). The colon is required.

\`\`\`python
score = 72

if score >= 80:
    print("Distinction")
elif score >= 50:
    print("Pass")
else:
    print("Resit required")
\`\`\`

Only the first matching branch runs. \`elif\` and \`else\` are optional.

## Truthy and falsy

Conditions do not have to be a comparison. Python treats these as **falsy**: \`False\`, \`0\`, \`0.0\`, \`""\`, \`[]\`, \`{}\`, \`None\`. Everything else is **truthy**.

\`\`\`python
name = input("Name: ")
if name:                     # true when the user typed something
    print(f"Hello {name}")
else:
    print("No name given")
\`\`\``,
        },
        {
          slug: "loops",
          title: "for and while Loops",
          summary: "Repeat work a fixed number of times or until a condition changes.",
          objectives: [
            "Iterate with for and range()",
            "Loop directly over a sequence",
            "Use while, break and continue safely",
          ],
          estimatedMinutes: 10,
          content: `## for with range()

\`range(start, stop, step)\` produces a sequence of integers up to but not including \`stop\`.

\`\`\`python
for i in range(3):
    print(i)          # 0, then 1, then 2

for n in range(2, 11, 2):
    print(n)          # 2 4 6 8 10
\`\`\`

## for over a sequence

More often you loop over the items directly:

\`\`\`python
languages = ["Java", "Python", "HTML"]
for language in languages:
    print(f"Learning {language}")
\`\`\`

## while

A \`while\` loop repeats as long as its condition stays true. Make sure something inside the loop can eventually make it false, or it runs forever.

\`\`\`python
count = 5
while count > 0:
    print(count)
    count -= 1
print("Lift off")
\`\`\`

## break and continue

- \`break\` leaves the loop immediately.
- \`continue\` skips to the next iteration.

\`\`\`python
for number in range(1, 100):
    if number % 7 == 0:
        print(f"First multiple of 7 is {number}")
        break
\`\`\``,
        },
        {
          slug: "lists",
          title: "Lists",
          summary: "Ordered, changeable collections of values.",
          objectives: [
            "Create lists and read items by index",
            "Add and remove items",
            "Slice a list and get its length",
          ],
          estimatedMinutes: 9,
          content: `## Creating and indexing

A list holds values in order, inside square brackets:

\`\`\`python
scores = [58, 72, 91, 44]
scores[0]     # 58   first item, index starts at 0
scores[-1]    # 44   last item
len(scores)   # 4
\`\`\`

Indexing past the end raises \`IndexError\`.

## Changing a list

Lists are **mutable** — you can change them in place:

\`\`\`python
scores[1] = 75          # replace
scores.append(63)       # add to the end
scores.insert(0, 100)   # add at a position
scores.remove(44)       # remove first matching value
last = scores.pop()     # remove and return the last item
\`\`\`

## Slicing

\`list[start:stop]\` returns a new list with items from \`start\` up to but not including \`stop\`:

\`\`\`python
letters = ["a", "b", "c", "d", "e"]
letters[1:3]    # ['b', 'c']
letters[:2]     # ['a', 'b']
letters[2:]     # ['c', 'd', 'e']
\`\`\`

## Looping with the index

\`enumerate()\` gives you the position and the value together:

\`\`\`python
for position, letter in enumerate(letters):
    print(position, letter)
\`\`\``,
        },
      ],
      quiz: {
        title: "Control Flow Assessment",
        description: "Check your understanding of branching, loops and lists.",
        questions: [
          {
            prompt: "How many times does this loop print?  for i in range(1, 5): print(i)",
            explanation: "range(1, 5) yields 1, 2, 3, 4 — the stop value 5 is excluded. That is 4 iterations.",
            options: [
              { text: "4", correct: true },
              { text: "5" },
              { text: "3" },
              { text: "Infinite" },
            ],
          },
          {
            prompt: "Which values are falsy in Python?",
            explanation:
              'False, 0, 0.0, "", [], {} and None are falsy. A non-empty string like "0" is truthy.',
            options: [
              { text: '0, "", [] and None', correct: true },
              { text: "Only False" },
              { text: "Any negative number" },
              { text: '"0" and "false"' },
            ],
          },
          {
            prompt: "What does  scores[-1]  give for  scores = [10, 20, 30]?",
            explanation: "A negative index counts from the end, so -1 is the last item, 30.",
            options: [
              { text: "30", correct: true },
              { text: "10" },
              { text: "An error" },
              { text: "[30]" },
            ],
          },
          {
            prompt: "What is the risk with a while loop?",
            explanation:
              "If nothing in the body makes the condition false, the loop never ends. Always change the loop variable inside.",
            options: [
              { text: "It can run forever if the condition never becomes false", correct: true },
              { text: "It can only run 100 times" },
              { text: "It cannot contain an if statement" },
              { text: "It always runs at least twice" },
            ],
          },
          {
            prompt: "Which statement leaves a loop immediately?",
            explanation:
              "break exits the enclosing loop right away. continue only skips to the next iteration.",
            options: [
              { text: "break", correct: true },
              { text: "continue" },
              { text: "pass" },
              { text: "stop" },
            ],
          },
        ],
      },
    },
    {
      slug: "functions-and-dictionaries",
      title: "Functions and Dictionaries",
      summary:
        "Package reusable behaviour into functions with parameters and return values, and store labelled data in dictionaries.",
      objectives: [
        "Define functions with def and call them",
        "Use parameters, arguments and return values",
        "Understand local scope and default arguments",
        "Store and look up data with dictionaries",
      ],
      lessons: [
        {
          slug: "defining-functions",
          title: "Defining and Calling Functions",
          summary: "Give a block of code a name so you can run it whenever you need it.",
          objectives: [
            "Define a function with def",
            "Call a function and pass arguments",
            "Explain why functions reduce repetition",
          ],
          estimatedMinutes: 9,
          content: `## The shape of a function

\`\`\`python
def greet(name):
    print(f"Hello, {name}")

greet("Sam")     # Hello, Sam
greet("Priya")   # Hello, Priya
\`\`\`

- \`def\` starts the definition.
- \`greet\` is the name.
- \`name\` is a **parameter** — a placeholder filled in when the function is called.
- The indented block is the **body**. It does not run until the function is called.
- \`"Sam"\` in the call is an **argument** — the actual value.

## Why functions matter

Without functions you copy and paste logic and fix bugs in several places. A function gives one definition and many uses. It also names an idea: \`calculate_vat(amount)\` explains itself.

## Multiple parameters

\`\`\`python
def describe(language, year):
    print(f"{language} was released in {year}")

describe("Python", 1991)
describe(year=1995, language="Java")   # keyword arguments, order-free
\`\`\``,
        },
        {
          slug: "return-and-scope",
          title: "Return Values, Defaults and Scope",
          summary: "Send a result back to the caller and understand where variables live.",
          objectives: [
            "Use return to produce a value",
            "Give parameters default values",
            "Explain local versus global scope",
          ],
          estimatedMinutes: 10,
          content: `## return

\`print\` shows a value; \`return\` hands a value back so the caller can use it.

\`\`\`python
def add_tax(amount, rate=0.20):
    return amount + amount * rate

price = add_tax(100)        # 120.0
with_reduced = add_tax(100, 0.05)   # 105.0
print(add_tax(50) + add_tax(50))    # 120.0
\`\`\`

A function without \`return\` gives back \`None\`. Once \`return\` runs, the function ends.

## Default arguments

\`rate=0.20\` above is a **default**. Callers may omit it. Parameters with defaults must come after those without.

## Scope

Variables created inside a function are **local** — they exist only during that call and cannot be seen outside.

\`\`\`python
def make_total():
    subtotal = 42       # local
    return subtotal

make_total()
print(subtotal)         # NameError: 'subtotal' is not defined
\`\`\`

A function can *read* a variable from the surrounding module, but assigning inside the function creates a new local one unless you use \`global\`. Prefer passing values in as parameters and returning results — it keeps functions predictable.`,
        },
        {
          slug: "dictionaries",
          title: "Dictionaries",
          summary: "Store values under meaningful keys instead of numeric positions.",
          objectives: [
            "Create a dictionary and read values by key",
            "Add, update and delete entries",
            "Loop over keys and values safely",
          ],
          estimatedMinutes: 10,
          content: `## Key-value pairs

A dictionary maps **keys** to **values**, written with braces and colons:

\`\`\`python
student = {
    "name": "Alex",
    "score": 72,
    "passed": True,
}

student["name"]      # "Alex"
student["score"]     # 72
\`\`\`

Reading a missing key raises \`KeyError\`. Use \`.get()\` to supply a fallback:

\`\`\`python
student.get("grade", "N/A")   # "N/A" — no error
\`\`\`

## Changing a dictionary

\`\`\`python
student["score"] = 80          # update
student["attempts"] = 2        # add a new pair
del student["passed"]          # remove a pair
"name" in student              # True — membership tests keys
\`\`\`

## Looping

\`\`\`python
for key in student:
    print(key, "->", student[key])

for key, value in student.items():
    print(f"{key}: {value}")
\`\`\`

## When to use which

- **List** — ordered items you access by position; order matters.
- **Dictionary** — items you look up by a name or id; fast lookup, no fixed order needed.`,
        },
      ],
      quiz: {
        title: "Functions and Dictionaries Assessment",
        description: "The final Python assessment. Pass to complete the course.",
        questions: [
          {
            prompt: "What does a Python function return if it has no return statement?",
            explanation: "Every function returns something; with no return statement that value is None.",
            options: [
              { text: "None", correct: true },
              { text: "0" },
              { text: "An empty string" },
              { text: "It raises an error" },
            ],
          },
          {
            prompt: "In  def add_tax(amount, rate=0.20):  what is rate=0.20?",
            explanation:
              "It is a default argument. If the caller does not pass rate, 0.20 is used.",
            options: [
              { text: "A default value used when the caller omits that argument", correct: true },
              { text: "A required argument" },
              { text: "A global variable" },
              { text: "A return value" },
            ],
          },
          {
            prompt: "What happens when you read a key that is not in a dictionary with  d[\"missing\"]?",
            explanation: "Subscript access to a missing key raises KeyError. Use d.get(\"missing\") to avoid it.",
            options: [
              { text: "It raises KeyError", correct: true },
              { text: "It returns None" },
              { text: "It returns an empty string" },
              { text: "It adds the key with value None" },
            ],
          },
          {
            prompt: "Which method loops over a dictionary's key and value together?",
            explanation: "d.items() yields (key, value) pairs, ideal for  for k, v in d.items().",
            options: [
              { text: "d.items()", correct: true },
              { text: "d.pairs()" },
              { text: "d.keys()" },
              { text: "d.values()" },
            ],
          },
          {
            prompt: "A variable assigned inside a function is:",
            explanation:
              "It is local to that call and cannot be accessed from outside the function.",
            options: [
              { text: "Local to that function call", correct: true },
              { text: "Global by default" },
              { text: "Shared with every other function" },
              { text: "Automatically returned" },
            ],
          },
        ],
      },
    },
  ],
};
