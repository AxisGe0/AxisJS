
# AxisJS Framework Description

**AxisJS** is a lightweight, JavaScript-based framework designed to streamline the dynamic creation and management of web user interfaces (UI). It allows developers to define UI components and their behavior in a custom configuration file with an `.ax` extension. This configuration file is parsed by the framework, translating it into HTML elements on a web page. This abstraction separates the UI configuration from the JavaScript code, simplifying UI management and updates without direct DOM manipulation in the script.

## Features

1. **Dynamic UI Creation**: AxisJS empowers developers to design the UI structure in a separate `.ax` configuration file, which is then translated into HTML elements on the web page.

2. **Asynchronous Configuration Loading**: UI configurations can be loaded asynchronously, enabling non-blocking UI updates and the ability to load configurations on demand.

3. **Nested Element Support**: Developers can create complex, nested UI structures using the `.ax` configuration, with support for nested arrays to define hierarchical relationships between elements.

4. **Styling and Attributes**: The framework includes the ability to specify CSS styles and HTML attributes directly within the `.ax` configuration, which are applied to the elements upon creation.

5. **Event Handling**: Event listeners, such as `onclick`, can be defined within the `.ax` file, assigning behavior to UI components easily without cluttering the JavaScript code.

6. **Element Manipulation Utilities**: AxisJS provides utility functions for commonly needed operations, such as updating content, fading elements in or out, adjusting styles, and setting attributes dynamically.

7. **Identifier Assignment**: Each UI component can be automatically assigned a unique identifier, simplifying the process of locating and manipulating specific elements after they have been created.

8. **Randomized Class Names**: For added flexibility, the framework generates random class names for elements, helping avoid class name collisions and enhancing security.

9. **Extension and Customization**: While AxisJS provides a base for UI development, it is designed to be extensible. Developers can add additional functionality as needed for their specific use case.



## Getting Started
**[Demo here](https://axisge0.github.io/AxisJS/)**

To begin using the AxisJS Framework:

**HTML FILE**
```html
<head>
	<script  src="axis.js"></script>
</head>
<body>
	<script  src="app.js"></script>
</body>
```

**JS FILE**
```js
var ax =  new  AX({parent:'body'})
```
Create a new `AX` instance by passing an options object where `parent` is the CSS selector of the element that will serve as the container for the new UI elements.
```js
var main = ax.LoadFrom('main.ax')
```
Call the `LoadFrom` method with the path to your `.ax` file. This method returns a promise, so you can use `.then()` to execute code after the UI is loaded and elements are rendered.

**AX File Example**
```
Main:[
	content: Hello World
	style:[
		color: blue
		font-size: 5vh
	]
]
```
The AX File format is a bespoke object notation crafted specifically for the AxisJS Framework. Its design is intuitive and straightforward, making it accessible for developers to define the structure and behavior of their web application's UI.

## Introduction to AX File Format

### Overview

The AX File format is a bespoke object notation crafted specifically for the AxisJS Framework. Its design is intuitive and straightforward, making it accessible for developers to define the structure and behavior of their web application's UI.

### Features of AX File Format

- **Simplicity**: The format is user-friendly, allowing for quick learning and adoption.
- **Flexibility**: Supports various data types including numbers, strings, and booleans.
- **Functionality**: Can embed native JavaScript functions directly within the configuration for dynamic behaviors.
- **Compatibility**: Crafted to work seamlessly with the AxisJS Framework's UI rendering capabilities.

### Data Types Supported

1. **Numbers**: For defining numerical values, such as font sizes or widths.
   ```ax
   font-size: 14
   ```

2. **Strings**: To specify text content or style properties.
   ```ax
   content: Welcome to our site!
   ```

3. **Booleans**: For toggling states or conditional styling.
   ```ax
   input: true
   ```

4. **JavaScript Functions**: For adding interactive features or callbacks. Note: to end the function you must have a semicolon at the end of the function only.
   ```ax
   onclick: function() {
      alert("Clicked!");
   };
   ```

### Example of an AX Configuration

```ax
Main:[
    content: Welcome to our site!
    style:[
        color: darkslategray
        font-size: 18
    ]
    input: false
    onclick: function(elm) {
        alert("Welcome to the AxisJS Framework experience!");
    };
    nested:[
        Button:[
            content: Click me!
            onclick: function(elm) {
                console.log("Button clicked");
            };
        ]
    ]
]
```

### Available Properties

#### `cls`

- **Type**: String
- **Description**: Assigns a CSS class to the element, allowing for styling hooks.

#### `content`

- **Type**: String
- **Description**: The textual or HTML content to be displayed within the element.

#### `input`

- **Type**: Boolean
- **Default**: false
- **Description**: Determines if the element is an input field.

#### `replace`

- **Type**: String
- **Description**: Placeholder for dynamic content that can be replaced using the `element(identifier).replace(value)` method. The placeholder `%replace%` in the `content` is substituted with the provided value.

#### `style`

- **Type**: Object
- **Description**: Defines inline CSS styles for the element in a key-value pair format.

#### `attr`

- **Type**: Object
- **Description**: Specifies HTML attributes for the element such as `id`, `name`, `href`, etc.

#### `onclick`

- **Type**: Function
- **Description**: JavaScript function to be executed when the element is clicked. It also receives a selection of methods as a parameter.

#### `onload`

- **Type**: Function
- **Description**: JavaScript function that is called when the element is loaded onto the page. It also receives a selection of methods as a parameter.

#### `nested`

- **Type**: Array
- **Description**: An array of child element definitions that follow the same structure as the parent.

### Example AX Configuration

```ax
Button:[
    cls: button-primary
    content: Click me %replace%
    input: false
    replace: Click me
    style:[
        background-color: navy
        color: white
        padding: 10px 20px
        border-radius: 5px
    ]
    attr:[
        id: primaryButton
        name: primaryButton
    ]
    onclick: function(elm) {
        ax.element("Button").replace("Now Clicked")
    };
    onload: function(elm) {
        console.log("Button is now loaded and visible.");
    };
    nested:[
        // ... nested elements if any with the same format above
    ]
]
```

## AxisJS Element Object Methods

AxisJS provides a set of methods attached to UI elements that allow developers to manipulate these elements dynamically. Below is the documentation for these methods, which are available on the object returned by certain AxisJS operations.

## Method Descriptions

### `replace(text)`
- **Parameters**: `text` (string) - The new text content to set within the element.
- **Returns**: The element object to allow for method chaining.
- **Description**: Searches for a child with a `dynamic` selector within the element and replaces its HTML content with the provided text.

### `update(html)`
- **Parameters**: `html` (string) - The new HTML content to set for the element.
- **Returns**: The element object for method chaining when setting content; otherwise, the current inner HTML of the element.
- **Description**: Sets the inner HTML of the element to the provided string. If no parameter is given, it returns the current inner HTML of the element.

### `fade(type, ms)`
- **Parameters**:
  - `type` (string) - The fade type, either `'in'` or `'out'`.
  - `ms` (number, optional) - The duration of the fade effect in milliseconds, defaulting to 500.
- **Returns**: The element object to allow for method chaining.
- **Description**: Fades the element in or out based on the `type` parameter over the period specified by `ms`.

### `style(type, val)`
- **Parameters**:
  - `type` (string | object) - The style property to set or an object containing multiple style properties and values.
  - `val` (string, optional) - The value to set for the style property if `type` is a string.
- **Returns**: The element object for method chaining when setting styles; otherwise, the current value of the requested style property.
- **Description**: Applies the specified styles to the element. If `type` is an object, it applies all key-value pairs as styles. If `type` is a string and `val` is provided, it sets that specific style property.

### `attr(type, val)`
- **Parameters**:
  - `type` (string) - The attribute name to set or retrieve.
  - `val` (string, optional) - The value to set for the attribute.
- **Returns**: The element object for method chaining when setting an attribute; otherwise, the current value of the requested attribute.
- **Description**: Sets or gets an attribute on the element. If `val` is provided, it sets the attribute `type` to `val`. If `val` is omitted, it returns the current value of the attribute `type`.

## Additional Properties and Methods

- `parent`: The parent element.
- `current`: The current element, marked for future fixes.
- `elements`: An array that stores child elements.
- `addelement`: A method to add a new element to the `elements` array.
- `identifier`: A unique identifier for the element.
- `randomelement`: A method to generate a random element, which is not fully described here.

## Example Usage

Here is how you might use these methods in practice:

```javascript
var element = ax.element('someElementId');

// Replace the content of a dynamic element
element.replace('New dynamic content');

// Update the HTML content of the element
element.update('<p>Updated HTML content</p>');

// Fade the element out over a second
element.fade('out', 1000);

// Set multiple styles on the element
element.style({
  color: 'red',
  fontSize: '16px'
});

// Set a single style property
element.style('backgroundColor', 'blue');

// Get the value of a style property
var bgColor = element.style('backgroundColor');

// Set an attribute value
element.attr('data-custom', 'value');

// Get an attribute value
var customAttr = element.attr('data-custom');
```
