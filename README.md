# Custom Scrollbar

## About

**Main problems:**

- The lack of customization of the built-in scrollbars
- Browser differences.

**What this project is trying to solve:**

- Highly customizable scrollbar
- cross-browser/device support (mobiles as well).

![preview](/assets/preview.png "Preview Screenshot")

## Current Features

- Mouse wheel support (for horizontal bar: shift + wheel)
- Grab support (grab and move the scrollbar node)
- Keyboard support (arrows, the element needs to be active (tabIndex) OR just hover above it)
- Touch support (for mobiles)
- Middle click support (If the wheel button pressed, you can control the scroll with your mouse)
- CSS support (including pseudo classes like: hover, active. Pseudo elements haven't been tested yet)
- Scroll speed support (If you are using a mouse wheel, you can change the scrolling speed)
- Placement support (If you want the vertical scrollbar to be on the left side, or the horizontal to be at the top)
- Corner square (I don't know what kind of usage would it have, you can do whatever you like to do with it)
  - it's only visible with both of the scrollbars on.
- Invisible scrolling (it's like overflow: hidden but still scrollable, just set the size to 0)

## Possible features (not yet implemented)

- Change size by width/height with CSS (I need a very small compiler-like code for this)
- Overlay bars (When you have the scrollbars, the content behind it is invisible, I try to solve it later AKA: not that important at the moment)
- save the scroll position with localStorage
- ReactJS support (I will remake this into a HOC, so we can use it with ReactJS too)

## Installation

It's just a side project of mine, so it hasn't been uploaded to any package managers. Just grab the custom-scrollbar.js file and import the main class called: CustomScrollbar and use it.

## Usage

```js
import CustomScrollbar from '/path/to/custom-scrollbar.js';
const scrollableElement = document.querySelector("#element");

const options = {
METHOD: "smooth" //if you choose "default" it will scroll without the "smoothness"
// "smooth" is better if you ask me.
SCROLL_SIZE: 16 //The size of the scrollbar
//(I will change it to width in the css styles later)
SCROLL_AMOUNT: 128 //Scrolling speed (with wheel and keyboard)
//128 is the default and it feels the same as the normal scrollbar.
//Not recommended to change it.
VERTICAL_BOX_STYLES: `
/* CSS HERE for the vertical scrollbar's "box" or "container" */
`,
VERTICAL_BOX_STYLES_ACTIVE: " CSS For the 'active' pseudo class ",
VERTICAL_BOX_STYLES_HOVER: "Same with the hover pseudo class",
VERTICAL_NODE_STYLES: "Styles of the node that you are grabbing and moving in the box",
VERTICAL_NODE_STYLES_ACTIVE: "node's active pseudo",
VERTICAL_NODE_STYLES_HOVER: "same with the hover one"
//You can do these with the horizontal bar too, just change the 'VERTICAL' to 'HORIZONTAL',
CORNER_STYLE: "Style for the little corner square between the scrollbars"
CORNER_STYLE_ACTIVE: "I don't think I"
CORNER_STYLE_HOVER: "need to explain these"

MIDDLE_NAVIGATOR: "This is the little dot/square that shows",
MIDDLE_NAVIGATOR_HOVER: "when you navigate by the middle click navigator",
MIDDLE_NAVIGATOR_ACTIVE: ""
}
//just create a new instance and put the element and the options into it.
//options are optional aka: not needed if you don't want. Default styles will apply then.

new CustomScrollbar(scrollableElement, options);
```

## Warnings

- This project is just a hobby, there are things that haven't been tested, so use it carefully. :)
- If you have an element inside the scrollable element, by default the box model of CSS will cut off the display:block's margins because it's "not the content". If you would like to still have margins even if it's out of content, change the content's display to inline-block.
