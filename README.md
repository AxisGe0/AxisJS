
# AxisJS

**AxisJS (v2.0.0) ** is a lightweight, declarative JavaScript framework for building dynamic user interfaces using a custom configuration format (`.ax`). Instead of writing imperative DOM code, developers describe UI structure, styling, and behavior in `.ax` files, which AxisJS parses and renders at runtime.

AxisJS is designed for simplicity and flexibility. It runs entirely in the browser, requires no build step, and provides a small but expressive API for interacting with rendered elements.

---

## Core Concepts

* **Declarative UI**: UI structure is defined in `.ax` files, not JavaScript.
* **Runtime Rendering**: `.ax` files are fetched, parsed, and rendered dynamically.
* **Minimal Abstraction**: AxisJS works directly with the DOM without a virtual DOM.
* **Separation of Concerns**: Layout and behavior live in `.ax`; imperative logic stays minimal.

---

## Features

* Declarative UI definition using `.ax` files
* Asynchronous loading and parsing of UI configurations
* Automatic initialization using an `<ax>` HTML tag
* Nested UI structures
* Inline styles and HTML attributes defined in configuration
* Dynamic CSS rule injection (including pseudo selectors)
* Embedded JavaScript event handlers (`onclick`, `onload`)
* Global variable system for reuse across UI definitions
* Support for importing multiple `.ax` files
* Element repetition with indexing
* Automatic identifier assignment and recursive element lookup
* Small helper API for runtime element manipulation

---

## Getting Started

### Include AxisJS

```html
<script src=axis.js></script>
```

---

### Automatic Initialization (Recommended)

Add an `<ax>` tag to your HTML:

```html
<ax src=main.ax parent=body></ax>
```

AxisJS will automatically:

1. Detect the `<ax>` tag
2. Load the referenced `.ax` file
3. Parse and render the UI into the specified parent element

An optional hook can be used:

```js
window.axload = (instance) => {
    ax = instance;
  // Access the AxisJS instance here
};
```

---

### Manual Initialization (old method)

For advanced control:

```js
const ax = new AX({ parent: "body" });
await ax.load("main.ax");
```

---

## AX File Format

### Overview

An `.ax` file is a structured, indentation-based configuration format used to define UI elements. Each top-level key represents an element, and its properties define content, styling, behavior, and children.

AX syntax is **not JavaScript**, but it can embed JavaScript functions.

---

### Syntax Rules

* AX values **do not use quotes unless you really have to**
* JavaScript inside `function(){}` blocks follows **standard JavaScript rules (fxn must end with };**
* AX identifiers are unquoted in `.ax` files

---

### Example AX File

```ax
--primaryColor: steelblue

Main:[
  content: Hello World
  style:[
    color: --primaryColor
    font-size: 5vh
  ]
  onclick: function(elm){
    console.log("Main clicked");
    elm.replace("Clicked");
  };
]
```

---

## Supported Data Types

### Numbers

```ax
font-size: 14
```

### Strings (AX syntax)

```ax
content: Welcome to AxisJS
```

### Booleans

```ax
input: true
```

### JavaScript Functions

Functions must end with a semicolon.

```ax
onclick: function(elm){
  alert("Clicked");
};
```

'elm' return helper methods

---

## Global Variables

Global variables can be declared using a `--` prefix and referenced anywhere in the configuration.

```ax
--accentColor: crimson

Title:[
  content: Hello
  style:[
    color: --accentColor
  ]
]
```

Variables are resolved recursively at runtime.

---

## Imports

AX files can import other AX files using an `imports` block.

```ax
imports:[
  theme: theme.ax
]
```

Imported values are merged into the global variable scope and can be reused across the UI like normal variables.

---

## Element Properties

### `cls`

* HTML tag name to create
* If omitted, a random element name is generated

### `content`

* Inner HTML or text

### `input`

* Creates an `<input>` element when true

### `replace`

* Initial value for dynamic content replacement

### `style`

* Inline CSS styles

### `attr`

* HTML attributes

### `properties`

* Dynamic CSS rule injection, including pseudo selectors

```ax
properties:[
  :hover:[
    color: white
    background-color: black
  ]
]
```

### `onclick`

* JavaScript function executed on click

### `onload`

* JavaScript function executed after element creation

### `nested`

* Child element definitions

### `quantity`

* Repeats the element and assigns an `index` to each instance

---

## Identifiers and Element Lookup

Each element is automatically assigned an identifier equal to its key name in the AX file.

```ax
Button:[
  content: Click me
]
```

Elements can be retrieved from JavaScript using:

```js
ax.get("Button");
```

Lookup is recursive and searches through nested elements.

---

## Dynamic Content and `.replace()`

AxisJS supports targeted content replacement using dynamic placeholders.

### Dynamic Placeholder

Dynamic content must be declared using `%replace%` inside `content`.

```ax
Label:[
  content: Count: %replace%
  replace: 0
]
```

AxisJS converts `%replace%` into an internal `<dynamic>` node.

---

### `.replace()` Rules

* `.replace()` **only updates dynamic placeholders**
* Calling `.replace()` on elements without a dynamic placeholder has no effect

```js
ax.get("Label").replace("1");
```

---

## Element API

Each rendered element exposes the following methods:

### `replace(text)`

Replaces the content of the dynamic placeholder only.

### `update(html)`

Sets or retrieves the full inner HTML.

### `style(type, value | object)`

Sets or retrieves CSS styles.

### `attr(type, value)`

Sets or retrieves attributes.

### `fade(type, duration, callback)`

Fades elements in or out with optional completion callback.

---

## Example Usage

```js
const button = ax.get("Button");

button.replace("Now Clicked");
button.update("<b>Updated</b>");
button.style({ color: "red", fontSize: "16px" });
button.attr("data-id", "123");
button.fade("out", 500);
```

---

## Notes and Limitations

* AxisJS runs entirely in the browser
* `.ax` files are executable configuration and should be loaded from trusted sources
* Embedded JavaScript is evaluated at runtime
* Dynamic replacement requires explicit `%replace%` placeholders
* CSS rule injection depends on stylesheet availability in the document

---

## Summary

AxisJS provides a minimal, declarative approach to UI development without build tools, virtual DOMs, or heavy abstractions. It is well-suited for rapid prototyping, dynamic interfaces, and environments where simplicity and direct control over the DOM are preferred.

---
