import CustomScrollbar from "../src/custom-scrollbar.js";

const wrapper = document.querySelector(".wrapper");

new CustomScrollbar(wrapper, {
  SCROLL_SIZE: 16,
  CORNER_STYLES: `
    `,
  CORNER_STYLES_HOVER: `
      background-color: red;
      cursor: pointer;
    `,
  CORNER_STYLES_ACTIVE: `
      background-color: green;
    `,
  VERTICAL_BOX_STYLES_HOVER: `
      background-color: blue;
    `,
  VERTICAL_BOX_STYLES_ACTIVE: `
      background-color: red;
    `,
  VERTICAL_NODE_STYLES_HOVER: `
      background-color: green;
    `,
  VERTICAL_NODE_STYLES_ACTIVE: `
      background-color: red;
    `,
});
