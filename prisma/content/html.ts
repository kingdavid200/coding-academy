import type { SeedCourse } from "./types";

export const htmlCourse: SeedCourse = {
  slug: "html",
  title: "HTML",
  language: "HTML",
  tagline: "Build the structure of every web page with clean, semantic markup.",
  description:
    "Learn HTML from first principles. You will write well-formed documents, structure content with the right elements, add links and images with proper accessibility, and build accessible forms using semantic HTML.",
  icon: "html",
  accent: "#e34f26",
  order: 3,
  outcomes: [
    "Write a valid HTML5 document from scratch",
    "Choose the correct element for each piece of content",
    "Add links, images and lists with accessible attributes",
    "Build labelled, accessible forms",
    "Use semantic sectioning elements and a sensible heading order",
  ],
  modules: [
    {
      slug: "document-structure",
      title: "Document Structure",
      summary:
        "Understand what HTML is, write the boilerplate every page needs, and learn how elements, tags and attributes fit together.",
      objectives: [
        "Explain the role of HTML alongside CSS and JavaScript",
        "Write the HTML5 document skeleton",
        "Describe elements, tags, attributes and nesting",
        "Use the essential contents of <head>",
      ],
      lessons: [
        {
          slug: "what-is-html",
          title: "What HTML Is",
          summary: "Markup that gives content meaning and structure.",
          objectives: [
            "Define markup language",
            "Separate structure (HTML), presentation (CSS) and behaviour (JS)",
            "Explain why browsers are forgiving of mistakes",
          ],
          estimatedMinutes: 6,
          content: `## Markup, not programming

HTML stands for HyperText Markup Language. It is not a programming language — there are no variables or loops. You **mark up** content with elements that describe what each part *is*: a heading, a paragraph, a list, a link.

## Three layers of a web page

| Layer | Language | Job |
| --- | --- | --- |
| Structure | HTML | What the content is |
| Presentation | CSS | How it looks |
| Behaviour | JavaScript | How it reacts |

Keeping them separate makes each easier to change. This course is about the first layer.

## Browsers are forgiving

If you forget a closing tag, a browser will usually guess and carry on rather than show an error. That sounds helpful but it hides mistakes, so you should still write correct HTML and check it with a validator. Getting the structure right also matters for search engines and for screen-reader users, who rely on the meaning of elements.`,
        },
        {
          slug: "the-skeleton",
          title: "The Document Skeleton",
          summary: "The boilerplate every HTML page starts from.",
          objectives: [
            "Write the doctype, html, head and body",
            "Explain the purpose of each part",
            "Set the language and character encoding",
          ],
          estimatedMinutes: 9,
          content: `## A minimal valid page

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, web</h1>
    <p>This is a paragraph of content.</p>
  </body>
</html>
\`\`\`

## What each part does

- \`<!DOCTYPE html>\` — tells the browser to use modern (standards) rendering. Always the first line.
- \`<html lang="en">\` — the root element. \`lang\` helps screen readers and translation tools pronounce and interpret the page.
- \`<head>\` — information *about* the page, not shown in the page body: title, character encoding, viewport, links to CSS.
- \`<meta charset="UTF-8">\` — lets the browser display accented characters and symbols correctly.
- \`<meta name="viewport" ...>\` — makes the page scale properly on phones.
- \`<title>\` — the text shown in the browser tab and in search results.
- \`<body>\` — everything the visitor actually sees.

Save this as \`index.html\` and open it in a browser to view it.`,
        },
        {
          slug: "elements-and-attributes",
          title: "Elements, Tags, Attributes and Nesting",
          summary: "The building blocks and the rules for combining them.",
          objectives: [
            "Distinguish an element from a tag",
            "Add attributes in name=\"value\" form",
            "Nest elements without overlapping",
          ],
          estimatedMinutes: 8,
          content: `## Element versus tag

An **element** is usually an opening tag, some content, and a closing tag:

\`\`\`html
<p>This whole thing is a paragraph element.</p>
\`\`\`

\`<p>\` is the opening tag, \`</p>\` is the closing tag. Some elements are **empty** (no content, no closing tag), such as \`<img>\` and \`<br>\`.

## Attributes

Attributes add information to an element. They go in the opening tag as \`name="value"\` pairs:

\`\`\`html
<a href="https://example.com" title="Visit Example">Example</a>
<img src="logo.png" alt="Company logo" width="120" />
\`\`\`

## Nesting

Elements can contain other elements, but they must not overlap. Close them in the reverse order you opened them:

\`\`\`html
<p>This is <strong>very <em>important</em></strong> text.</p>

<!-- wrong: tags cross over -->
<p>This is <strong>very <em>important</strong></em> text.</p>
\`\`\`

Indenting child elements makes the structure easy to see, though the browser ignores the whitespace.`,
        },
      ],
      quiz: {
        title: "Document Structure Assessment",
        description: "Confirm you can write a valid HTML document.",
        questions: [
          {
            prompt: "What must be the very first line of an HTML document?",
            explanation:
              "<!DOCTYPE html> tells the browser to render in standards mode. It comes before <html>.",
            options: [
              { text: "<!DOCTYPE html>", correct: true },
              { text: "<html>" },
              { text: "<head>" },
              { text: "<meta charset=\"UTF-8\">" },
            ],
          },
          {
            prompt: "Which element's content is NOT shown in the page body?",
            explanation:
              "<head> holds metadata about the page — title, charset, viewport, CSS links — not visible content.",
            options: [
              { text: "<head>", correct: true },
              { text: "<body>" },
              { text: "<main>" },
              { text: "<section>" },
            ],
          },
          {
            prompt: "What does the lang attribute on <html> help with?",
            explanation:
              "It tells screen readers and translation tools which language the content is in, improving pronunciation and translation.",
            options: [
              { text: "Screen-reader pronunciation and translation", correct: true },
              { text: "Choosing the page font" },
              { text: "Setting the time zone" },
              { text: "Nothing, it is decorative" },
            ],
          },
          {
            prompt: "Which of these is an empty element with no closing tag?",
            explanation: "<img> is a void element: it has attributes but no content and no </img>.",
            options: [
              { text: "<img>", correct: true },
              { text: "<p>" },
              { text: "<a>" },
              { text: "<h1>" },
            ],
          },
          {
            prompt: "Which line correctly nests the elements?",
            explanation:
              "Tags must close in reverse order of opening. <strong><em>...</em></strong> is correct; crossing them is not.",
            options: [
              { text: "<strong><em>hi</em></strong>", correct: true },
              { text: "<strong><em>hi</strong></em>" },
              { text: "<em><strong>hi</em></strong>" },
              { text: "<strong><em>hi</strong>" },
            ],
          },
        ],
      },
    },
    {
      slug: "text-and-links",
      title: "Text, Lists and Links",
      summary:
        "Mark up written content with the correct elements: headings in order, paragraphs, emphasis, lists, and hyperlinks.",
      objectives: [
        "Use headings h1–h6 to convey document outline",
        "Choose ordered, unordered and description lists",
        "Write links to pages, sections and email",
        "Apply strong and em for meaning, not appearance",
      ],
      lessons: [
        {
          slug: "headings-and-paragraphs",
          title: "Headings and Paragraphs",
          summary: "Give content a hierarchy that both people and machines can follow.",
          objectives: [
            "Use one h1 per page",
            "Nest headings without skipping levels",
            "Mark up prose with p, strong and em",
          ],
          estimatedMinutes: 8,
          content: `## Headings define an outline

There are six heading levels, \`<h1>\` to \`<h6>\`. They are not just big text — they create the document's outline, which screen-reader users navigate by and search engines read.

Rules of thumb:

- One \`<h1>\` per page: the page's main title.
- Do not skip levels going down: an \`<h3>\` should sit under an \`<h2>\`, not directly under an \`<h1>\`.
- Choose the level for its meaning, then use CSS if you want a different size.

\`\`\`html
<h1>Baking Bread</h1>
  <h2>Ingredients</h2>
  <h2>Method</h2>
    <h3>Mixing</h3>
    <h3>Proving</h3>
\`\`\`

## Paragraphs and inline meaning

\`\`\`html
<p>HTML marks up <strong>meaning</strong>, so use
<em>emphasis</em> where you would stress a word when speaking.</p>
\`\`\`

- \`<strong>\` — strong importance (not merely "bold").
- \`<em>\` — stressed emphasis (not merely "italic").
- \`<br>\` — a line break inside a block, for things like addresses. Do not use it for spacing between paragraphs.`,
        },
        {
          slug: "lists",
          title: "Lists",
          summary: "Three list types for three kinds of content.",
          objectives: [
            "Build unordered and ordered lists",
            "Nest lists correctly",
            "Use a description list for term/definition pairs",
          ],
          estimatedMinutes: 8,
          content: `## Unordered and ordered

Use \`<ul>\` when the order does not matter, \`<ol>\` when it does. Both contain \`<li>\` items.

\`\`\`html
<ul>
  <li>Java</li>
  <li>Python</li>
  <li>HTML</li>
</ul>

<ol>
  <li>Preheat the oven</li>
  <li>Mix the dough</li>
  <li>Bake for 30 minutes</li>
</ol>
\`\`\`

## Nesting

A nested list goes *inside* an \`<li>\`, not directly inside the \`<ul>\`:

\`\`\`html
<ul>
  <li>Front end
    <ul>
      <li>HTML</li>
      <li>CSS</li>
    </ul>
  </li>
  <li>Back end</li>
</ul>
\`\`\`

## Description lists

\`<dl>\` pairs a term (\`<dt>\`) with its description (\`<dd>\`):

\`\`\`html
<dl>
  <dt>HTML</dt>
  <dd>The markup language for web page structure.</dd>
  <dt>CSS</dt>
  <dd>The language for styling web pages.</dd>
</dl>
\`\`\``,
        },
        {
          slug: "links",
          title: "Links",
          summary: "The hyperlink is what makes the web a web.",
          objectives: [
            "Link to external and internal pages",
            "Link to a section of the same page with an id",
            "Create email links and understand link text quality",
          ],
          estimatedMinutes: 9,
          content: `## The anchor element

\`\`\`html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
\`\`\`

\`href\` is the destination. The text between the tags is what the user clicks.

## Relative and absolute URLs

- **Absolute**: \`https://example.com/about\` — the full address.
- **Relative**: \`about.html\` or \`/contact\` — resolved against the current page. Use relative links within your own site.

## Linking within a page

Give a target element an \`id\`, then link to \`#id\`:

\`\`\`html
<h2 id="pricing">Pricing</h2>
...
<a href="#pricing">Jump to pricing</a>
\`\`\`

## Email links

\`\`\`html
<a href="mailto:hello@example.com">Email us</a>
\`\`\`

## Write meaningful link text

Screen-reader users often jump from link to link. "Click here" and "read more" are useless out of context. Describe the destination:

\`\`\`html
<!-- weak -->
<a href="/report.pdf">Click here</a>

<!-- clear -->
<a href="/report.pdf">Download the 2024 annual report (PDF)</a>
\`\`\``,
        },
      ],
      quiz: {
        title: "Text, Lists and Links Assessment",
        description: "Check that you pick the right element for written content.",
        questions: [
          {
            prompt: "How many <h1> elements should a typical page have?",
            explanation: "One: the page's main title. Additional sections use <h2> and below.",
            options: [
              { text: "One", correct: true },
              { text: "One per section" },
              { text: "As many as you like" },
              { text: "None — h1 is deprecated" },
            ],
          },
          {
            prompt: "Which list element should you use for steps that must happen in order?",
            explanation: "<ol> is the ordered list. <ul> is for items where order does not matter.",
            options: [
              { text: "<ol>", correct: true },
              { text: "<ul>" },
              { text: "<dl>" },
              { text: "<li>" },
            ],
          },
          {
            prompt: "What attribute holds a link's destination?",
            explanation: "The href attribute on an <a> element specifies where the link goes.",
            options: [
              { text: "href", correct: true },
              { text: "src" },
              { text: "link" },
              { text: "target" },
            ],
          },
          {
            prompt: "How do you link to a section with id=\"pricing\" on the same page?",
            explanation: 'Use a fragment link: <a href="#pricing">. The # refers to an id on the page.',
            options: [
              { text: 'href="#pricing"', correct: true },
              { text: 'href="pricing"' },
              { text: 'href="?pricing"' },
              { text: 'href="/pricing"' },
            ],
          },
          {
            prompt: "Why is “Click here” poor link text?",
            explanation:
              "It gives no information out of context. Screen-reader users listing links hear only 'click here'.",
            options: [
              { text: "It is meaningless when read out of context", correct: true },
              { text: "It is too long" },
              { text: "Browsers ignore it" },
              { text: "It breaks the href" },
            ],
          },
        ],
      },
    },
    {
      slug: "images-and-media",
      title: "Images and Media",
      summary:
        "Add images the accessible way with meaningful alt text, group them with captions, and understand responsive and decorative images.",
      objectives: [
        "Embed an image with src and alt",
        "Write alt text that serves its purpose",
        "Use figure and figcaption",
        "Recognise when an image is decorative",
      ],
      lessons: [
        {
          slug: "the-img-element",
          title: "The img Element and alt Text",
          summary: "Every content image needs a text alternative.",
          objectives: [
            "Embed an image with the required attributes",
            "Write alt text based on the image's role",
            "Set width and height to avoid layout shift",
          ],
          estimatedMinutes: 9,
          content: `## Embedding an image

\`\`\`html
<img src="team-photo.jpg" alt="The eight-person design team on a video call" width="800" height="450" />
\`\`\`

- \`src\` — the file path or URL.
- \`alt\` — a text alternative, read aloud by screen readers and shown if the image fails to load.
- \`width\` and \`height\` — the image's pixel dimensions. Setting them lets the browser reserve space so the page does not jump around as images load.

## Writing good alt text

Describe the **purpose**, not every pixel. Ask: if I removed the image, what words would I put in its place?

\`\`\`html
<!-- a chart -->
<img src="sales.png" alt="Sales rose from £2k in January to £9k in June" />

<!-- a link with only an image inside -->
<a href="/"><img src="logo.svg" alt="Coding Academy home" /></a>
\`\`\`

Do not start with "Image of" — screen readers already announce it as an image. Keep it concise; a sentence is usually enough.`,
        },
        {
          slug: "figure-and-caption",
          title: "figure, figcaption and Decorative Images",
          summary: "Associate a visible caption with an image, and handle images that carry no information.",
          objectives: [
            "Group an image and caption with figure",
            "Explain the difference between alt and a caption",
            "Mark a purely decorative image correctly",
          ],
          estimatedMinutes: 8,
          content: `## figure and figcaption

Use \`<figure>\` for an image, diagram or code sample that is referred to as a unit, with an optional \`<figcaption>\`:

\`\`\`html
<figure>
  <img src="architecture.png" alt="Browser sends a request to the server, which queries the database and returns HTML" />
  <figcaption>Figure 1: the request–response cycle.</figcaption>
</figure>
\`\`\`

The \`alt\` and the \`figcaption\` do different jobs. \`alt\` replaces the image for people who cannot see it; the caption is extra context shown to everyone. They should not be identical.

## Decorative images

If an image adds nothing to the content — a background flourish, a divider — give it an **empty** alt so screen readers skip it:

\`\`\`html
<img src="swirl.svg" alt="" />
\`\`\`

Leaving \`alt\` off entirely is different: some screen readers then read the file name aloud. An explicit empty \`alt=""\` is the correct way to say "ignore this image". Better still, move purely decorative images into CSS as background images.`,
        },
      ],
      quiz: {
        title: "Images and Media Assessment",
        description: "Confirm you can add images accessibly.",
        questions: [
          {
            prompt: "What is the alt attribute for?",
            explanation:
              "It is a text alternative: read by screen readers and shown if the image fails to load.",
            options: [
              { text: "A text alternative to the image", correct: true },
              { text: "A tooltip on hover" },
              { text: "The image caption shown to everyone" },
              { text: "The image file name" },
            ],
          },
          {
            prompt: "How should you mark a purely decorative image?",
            explanation:
              'Use alt="" so assistive technology skips it. Omitting alt entirely can cause the file name to be read.',
            options: [
              { text: 'alt=""', correct: true },
              { text: "Leave the alt attribute off" },
              { text: 'alt="decorative"' },
              { text: 'alt="image"' },
            ],
          },
          {
            prompt: "Why set width and height on an <img>?",
            explanation:
              "The browser can reserve the right space before the image loads, preventing the layout from shifting.",
            options: [
              { text: "To reserve space and prevent layout shift", correct: true },
              { text: "It is required or the image will not load" },
              { text: "To compress the image" },
              { text: "To set the alt text length" },
            ],
          },
          {
            prompt: "Should alt text and a figcaption say the same thing?",
            explanation:
              "No. alt replaces the image for those who cannot see it; the caption adds context for everyone. Duplicating is redundant.",
            options: [
              { text: "No — they serve different purposes", correct: true },
              { text: "Yes — always identical" },
              { text: "Only on mobile" },
              { text: "figcaption replaces the need for alt" },
            ],
          },
          {
            prompt: "Good alt text for a chart should:",
            explanation: "Convey the information the chart shows, e.g. the trend, not just say 'a chart'.",
            options: [
              { text: "Summarise the data or trend the chart shows", correct: true },
              { text: 'Say "chart image"' },
              { text: "List the exact pixel colours" },
              { text: "Be left empty" },
            ],
          },
        ],
      },
    },
    {
      slug: "forms-and-semantics",
      title: "Forms and Semantic HTML",
      summary:
        "Build forms that everyone can use with labelled controls, and structure pages with semantic sectioning elements.",
      objectives: [
        "Associate every input with a label",
        "Use appropriate input types and required",
        "Group related controls with fieldset and legend",
        "Lay out a page with header, nav, main, and footer",
      ],
      lessons: [
        {
          slug: "form-controls",
          title: "Form Controls and Labels",
          summary: "A labelled control is a usable control.",
          objectives: [
            "Connect a label to an input with for and id",
            "Choose the right input type",
            "Use required and basic validation attributes",
          ],
          estimatedMinutes: 10,
          content: `## The label–input pair

Every form control needs a label. Connect them by matching the label's \`for\` to the input's \`id\`:

\`\`\`html
<form action="/subscribe" method="post">
  <label for="email">Email address</label>
  <input type="email" id="email" name="email" required />

  <button type="submit">Subscribe</button>
</form>
\`\`\`

Now clicking the label focuses the field, and screen readers announce "Email address, edit text" instead of just "edit text".

## Input types

The \`type\` attribute changes the keyboard on mobile and enables built-in validation:

\`\`\`html
<input type="text" />
<input type="email" />
<input type="password" />
<input type="number" min="0" max="10" />
<input type="checkbox" id="terms" name="terms" />
<input type="date" />
\`\`\`

## name and value

The \`name\` attribute is the key sent to the server. Without it, a field's value is not submitted.

## Validation attributes

\`required\`, \`minlength\`, \`maxlength\`, \`min\`, \`max\`, and \`pattern\` let the browser check input before the form is sent. Server-side validation is still required — never trust the browser alone.`,
        },
        {
          slug: "fieldset-and-structure",
          title: "Grouping Controls and Semantic Layout",
          summary: "fieldset for related fields, and the sectioning elements that shape a page.",
          objectives: [
            "Group radio buttons with fieldset and legend",
            "Use header, nav, main, footer, section and article",
            "Explain why one <main> per page matters",
          ],
          estimatedMinutes: 10,
          content: `## Grouping with fieldset

Radio buttons and related checkboxes should sit in a \`<fieldset>\` with a \`<legend>\` describing the group:

\`\`\`html
<fieldset>
  <legend>Preferred language</legend>

  <input type="radio" id="java" name="lang" value="java" />
  <label for="java">Java</label>

  <input type="radio" id="python" name="lang" value="python" />
  <label for="python">Python</label>
</fieldset>
\`\`\`

The legend is announced with each option, so a screen-reader user hears "Preferred language, Java, radio button".

## Semantic sectioning

Instead of \`<div>\` everywhere, use elements that describe their role:

\`\`\`html
<body>
  <header>
    <nav aria-label="Primary">...</nav>
  </header>

  <main>
    <article>
      <h1>Article title</h1>
      <section>
        <h2>A sub-section</h2>
      </section>
    </article>
  </main>

  <footer>...</footer>
</body>
\`\`\`

- \`<header>\` / \`<footer>\` — introductory and closing content.
- \`<nav>\` — a block of navigation links.
- \`<main>\` — the primary content. **One per page**, and it lets users skip straight to it.
- \`<article>\` — a self-contained piece (a blog post, a card).
- \`<section>\` — a thematic grouping, usually with a heading.

Screen readers expose these as landmarks users can jump between, so correct use makes a page far faster to navigate.`,
        },
      ],
      quiz: {
        title: "Forms and Semantic HTML Assessment",
        description: "The final HTML assessment. Pass to complete the course.",
        questions: [
          {
            prompt: "How do you associate a <label> with its <input>?",
            explanation:
              "Set the label's for attribute to the same value as the input's id.",
            options: [
              { text: "label's for matches the input's id", correct: true },
              { text: "label's name matches the input's name" },
              { text: "They must be siblings" },
              { text: "Add role=\"label\" to the input" },
            ],
          },
          {
            prompt: "Which attribute is the key sent to the server for a form field?",
            explanation: "name. A control with no name attribute is not submitted at all.",
            options: [
              { text: "name", correct: true },
              { text: "id" },
              { text: "for" },
              { text: "type" },
            ],
          },
          {
            prompt: "How many <main> elements should a page have?",
            explanation: "Exactly one. It marks the primary content and provides a skip target.",
            options: [
              { text: "One", correct: true },
              { text: "One per section" },
              { text: "Zero" },
              { text: "Any number" },
            ],
          },
          {
            prompt: "What should wrap a group of radio buttons for one question?",
            explanation:
              "A <fieldset> with a <legend>. The legend labels the whole group for assistive technology.",
            options: [
              { text: "<fieldset> with a <legend>", correct: true },
              { text: "A <div> with a heading" },
              { text: "A <section>" },
              { text: "An <article>" },
            ],
          },
          {
            prompt: "Client-side validation attributes like required mean you can skip server validation.",
            explanation:
              "False. The browser check is a convenience; anyone can bypass it, so the server must validate too.",
            options: [
              { text: "False — the server must still validate", correct: true },
              { text: "True — required is enough" },
              { text: "True, but only for email fields" },
              { text: "False, unless the form uses POST" },
            ],
          },
        ],
      },
    },
  ],
};
