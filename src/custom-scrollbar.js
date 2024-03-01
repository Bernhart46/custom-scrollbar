"use strict";
const METHODS = ["default", "smooth"];
const ERROR_MESSAGES = {
  NO_ELEMENT: "No element has been added to the function!",
  WRONG_METHOD: 'Wrong method type. Method types: "default", "smooth"',
};

const DEFAULT_OPTIONS = {
  METHOD: "smooth",
  SCROLL_AMOUNT: 128,
  SCROLL_SIZE: 16,
  VERTICAL_FLOAT: "right",
  HORIZONTAL_FLOAT: "bottom",
  VERTICAL_BOX_STYLES: `
    height: 100%;
  `,
  VERTICAL_BOX_STYLES_HOVER: ``,
  VERTICAL_BOX_STYLES_ACTIVE: ``,
  HORIZONTAL_BOX_STYLES: ``,
  HORIZONTAL_BOX_STYLES_HOVER: ``,
  HORIZONTAL_BOX_STYLES_ACTIVE: ``,
  VERTICAL_NODE_STYLES: `
    background-color: gray;
    cursor: pointer;
    position: relative;
    border-radius: 10px;
  `,
  VERTICAL_NODE_STYLES_HOVER: ``,
  VERTICAL_NODE_STYLES_ACTIVE: ``,
  HORIZONTAL_NODE_STYLES: `
    background-color: gray;
    cursor: pointer;
    position: relative;
    border-radius: 10px;
    height: 100%;
  `,
  HORIZONTAL_NODE_STYLES_HOVER: ``,
  HORIZONTAL_NODE_STYLES_ACTIVE: ``,
  CORNER_STYLES: `
    background-color: red;
  `,
  CORNER_STYLES_HOVER: ``,
  CORNER_STYLES_ACTIVE: ``,
  MIDDLE_NAVIGATOR: `
    width: 5px;
    height: 5px;
    background-color: black;
    border-radius: 50%;
    z-index: 99999;
  `,
  MIDDLE_NAVIGATOR_HOVER: ``,
  MIDDLE_NAVIGATOR_ACTIVE: ``,
};

//It needed if I only want to change 1 variable but keep the rest
function makeDefaultOptions(defaults, changed) {
  return { ...defaults, ...changed };
}

export default class CustomScrollbar {
  constructor(element, options) {
    if (!element) throw new Error(ERROR_MESSAGES.NO_ELEMENT);

    this.element = element;
    this.options = makeDefaultOptions(DEFAULT_OPTIONS, options);
    if (!METHODS.includes(this.options.METHOD))
      throw new Error(ERROR_MESSAGES.WRONG_METHOD);

    //PARTS
    this.V_scrollBarBox = null;
    this.V_scrollBarNode = null;
    this.V_scrollNodeHeight = null;

    this.H_scrollBarBox = null;
    this.H_scrollBarNode = null;
    this.H_scrollNodeWidth = null;

    this.middleNavigator = null;

    this.isHover = false;

    this.addScrollbar();
    this.addEvents();
    this.addCSSPseudo();
    this.changeVisibility();

    this.changeScrollNode("top");
    this.changeScrollNode("left");
  }

  addScrollbar() {
    this.addParentStyles();
    //initialize parts
    const content = this.element.innerHTML;
    this.contentPart = document.createElement("div");
    this.V_scrollBarBox = document.createElement("div");
    this.V_scrollBarNode = document.createElement("div");
    this.middleNavigator = document.createElement("div");

    this.cornerNode = document.createElement("div");

    this.H_scrollBarBox = document.createElement("div");
    this.H_scrollBarNode = document.createElement("div");

    //place the content inside the contentPart
    this.element.innerHTML = "";
    this.contentPart.innerHTML = content;

    //TEST FUNCTION
    // setTimeout(() => {
    //   this.contentPart.innerHTML = content + content;
    //   this.resizeEvent();
    // }, 2000);

    //add classes
    this.contentPart.style.cssText = `
      overflow: hidden;
      height: 100%;
    `;

    const {
      VERTICAL_BOX_STYLES,
      VERTICAL_NODE_STYLES,
      HORIZONTAL_BOX_STYLES,
      HORIZONTAL_NODE_STYLES,
      CORNER_STYLES,
      MIDDLE_NAVIGATOR,
    } = this.options;

    this.V_scrollBarBox.style.cssText = VERTICAL_BOX_STYLES;
    this.V_scrollBarNode.style.cssText = VERTICAL_NODE_STYLES;

    this.cornerNode.style.cssText = CORNER_STYLES;

    this.H_scrollBarBox.style.cssText = HORIZONTAL_BOX_STYLES;
    this.H_scrollBarNode.style.cssText = HORIZONTAL_NODE_STYLES;

    //append
    this.element.appendChild(this.contentPart);
    this.V_scrollBarBox.appendChild(this.V_scrollBarNode);
    this.element.appendChild(this.V_scrollBarBox);

    this.element.appendChild(this.cornerNode);

    this.H_scrollBarBox.appendChild(this.H_scrollBarNode);
    this.element.appendChild(this.H_scrollBarBox);

    this.contentPart.scrollTop = 0;
    this.contentPart.scrollLeft = 0;
  }

  addEvents() {
    this.element.addEventListener("wheel", (e) => {
      e.preventDefault();
      scroll(e);
    });

    window.addEventListener("resize", this.resizeEvent.bind(this));

    //Moving by grabbing
    this.V_isGrabbed = false;
    this.V_grabbedPos = 0;

    this.H_isGrabbed = false;
    this.H_grabbedPos = 0;

    this.is_middle_grabbed = false;
    this.middle_pos_Y = 0;
    this.middle_deltaY = 0;
    this.middle_pos_X = 0;
    this.middle_deltaX = 0;

    //Middle click moving
    this.contentPart.addEventListener("mousedown", (e) => {
      if (e.button !== 1) return;

      if (this.is_middle_grabbed) {
        this.removeMiddleClickStarter();
      }
      this.is_middle_grabbed = true;
      this.middle_pos_Y = e.clientY;
      this.middle_pos_X = e.clientX;

      this.addMiddleClickStarter(e.clientY, e.clientX);

      this.animate(
        0,
        0,
        {
          isMiddle: true,
        },
        !this.is_middle_grabbed
      );
    });

    //Move with grabbing the bars
    this.V_scrollBarNode.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button !== 0) return;
      this.V_isGrabbed = true;
      this.V_grabbedPos = e.layerY;
    });
    this.H_scrollBarNode.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button !== 0) return;
      this.H_isGrabbed = true;
      this.H_grabbedPos = e.layerX;
    });
    window.addEventListener("mousemove", (e) => {
      const { scrollHeight, clientHeight, offsetTop, offsetHeight } =
        this.contentPart;
      const { scrollWidth, clientWidth, offsetLeft, offsetWidth } =
        this.contentPart;

      //middle click mover
      if (this.is_middle_grabbed) {
        if (this.V_isElementScrollable) {
          const differenceY = e.clientY - this.middle_pos_Y;
          this.middle_deltaY = differenceY;
        }
        if (this.H_isElementScrollable) {
          const differenceX = e.clientX - this.middle_pos_X;
          this.middle_deltaX = differenceX;
        }
      }
      //Check if it's vertical and assign it's correct values to the variables
      const isVertical = this.V_isGrabbed;
      if (!isVertical && !this.H_isGrabbed) return;
      const grabbedPos = isVertical ? this.V_grabbedPos : this.H_grabbedPos;
      const clientPos = isVertical ? e.clientY : e.clientX;
      const scrollSize = isVertical ? scrollHeight : scrollWidth;
      const clientSize = isVertical ? clientHeight : clientWidth;
      const offsetDirection = isVertical ? offsetTop : offsetLeft;
      const offsetSize = isVertical ? offsetHeight : offsetWidth;
      const scrollNodeSize = isVertical
        ? this.V_scrollNodeHeight
        : this.H_scrollNodeWidth;
      const scrollBarNode = isVertical
        ? this.V_scrollBarNode
        : this.H_scrollBarNode;

      //calculate
      const borderSize = (offsetSize - clientSize) / 2;
      const cursorPos = clientPos - offsetDirection - borderSize - grabbedPos;
      const isTooSmall = scrollNodeSize <= 40;
      const realScrollNodeSize = isTooSmall ? 40 : scrollNodeSize;
      const spaceWithoutNode = clientSize - realScrollNodeSize;

      let newDirection = cursorPos;
      if (cursorPos < 0) {
        newDirection = 0;
      }
      if (cursorPos >= spaceWithoutNode) {
        newDirection = spaceWithoutNode;
      }

      scrollBarNode.style[isVertical ? "top" : "left"] = `${newDirection}px`;

      //scrollDirection (top, left)
      const realScrollSize = scrollSize - clientSize;
      const newScrollDirection =
        (newDirection / spaceWithoutNode) * realScrollSize;

      this.contentPart[isVertical ? "scrollTop" : "scrollLeft"] =
        newScrollDirection;
    });

    window.addEventListener("mouseup", (e) => {
      if (this.V_isGrabbed) {
        this.V_isGrabbed = false;
      }
      if (this.H_isGrabbed) {
        this.H_isGrabbed = false;
      }
      if (this.is_middle_grabbed && e.button !== 1) {
        this.is_middle_grabbed = false;
        this.removeMiddleClickStarter();
      }
    });

    this.element.addEventListener("mouseenter", () => {
      this.isHover = true;
    });
    this.element.addEventListener("mouseleave", () => {
      this.isHover = false;
    });

    //KEYBOARD SUPPORT
    window.addEventListener("keydown", (e) => {
      if (!this.isHover) return;

      keyboardSupport(e);
    });

    this.element.addEventListener("keydown", (e) => {
      if (this.isHover) return;
      keyboardSupport(e);
    });

    //FOR MOBILE

    this.element.addEventListener("touchstart", (e) => {
      //Refresh only when the content is on top (mobile)
      if (this.contentPart.scrollTop > 0) {
        e.preventDefault();
      }
      this.touchStartY =
        e.touches[0].pageY -
        this.contentPart.offsetTop +
        this.contentPart.scrollTop;

      this.touchStartX =
        e.touches[0].pageX -
        this.contentPart.offsetLeft +
        this.contentPart.scrollLeft;
    });
    this.element.addEventListener("touchmove", (e) => {
      const isDone = this.touchStartY;

      const touchPositionY =
        e.touches[0].pageY -
        this.contentPart.offsetTop +
        this.contentPart.scrollTop;
      const touchPositionX =
        e.touches[0].pageX -
        this.contentPart.offsetLeft +
        this.contentPart.scrollLeft;

      const differenceY = this.touchStartY - touchPositionY;
      const differenceX = this.touchStartX - touchPositionX;

      this.contentPart.scrollTop = this.contentPart.scrollTop + differenceY;
      this.contentPart.scrollLeft = this.contentPart.scrollLeft + differenceX;
      this.V_scrollBarNode.style.top = this.calculateNode("top") + "px";
      this.H_scrollBarNode.style.left = this.calculateNode("left") + "px";
    });

    const keyboardSupport = (e) => {
      switch (e.key) {
        case "ArrowUp":
          scroll(e, false, false);
          break;
        case "ArrowDown":
          scroll(e, false, true);
          break;
        case "ArrowLeft":
          scroll(e, true, false);
          break;
        case "ArrowRight":
          scroll(e, true, true);
          break;
      }
    };

    const scroll = (e, isHorizontal, delta) => {
      let shiftKey = isHorizontal || e.shiftKey;
      let deltaY = delta ? 1 : -1;
      if (this.options.METHOD === "default") {
        if (dir) {
          this.addToScroll(e, "left");
        } else {
          this.addToScroll(e, "top");
        }
      }
      if (this.options.METHOD === "smooth") {
        const ev = {
          ...e,
          deltaY: e.deltaY || deltaY,
          shiftKey: e.shiftKey || shiftKey,
        };
        this.animate(0, 0, ev);
      }
    };
  }

  addCSSPseudo() {
    const {
      VERTICAL_BOX_STYLES_ACTIVE,
      VERTICAL_BOX_STYLES_HOVER,
      VERTICAL_NODE_STYLES_ACTIVE,
      VERTICAL_NODE_STYLES_HOVER,
      HORIZONTAL_BOX_STYLES_ACTIVE,
      HORIZONTAL_BOX_STYLES_HOVER,
      HORIZONTAL_NODE_STYLES_ACTIVE,
      HORIZONTAL_NODE_STYLES_HOVER,
      CORNER_STYLES_ACTIVE,
      CORNER_STYLES_HOVER,
      MIDDLE_NAVIGATOR_ACTIVE,
      MIDDLE_NAVIGATOR_HOVER,
    } = this.options;

    function setupEventListeners(element, styles, positionProperty) {
      let initialStylesHover, initialStylesActive;

      let isActive = false;
      let activeElement = null;

      element.addEventListener("mouseover", (event) => {
        if (event.target === element && !isActive) {
          initialStylesHover = element.style.cssText;
          element.style.cssText += styles.hover;
        }
      });

      element.addEventListener("mouseout", (event) => {
        const positionValue = element.style[positionProperty] || "0px";
        if (event.target === element && !isActive) {
          element.style.cssText = initialStylesHover;
          element.style[positionProperty] = positionValue;
        }
      });

      element.addEventListener("mousedown", (event) => {
        event.preventDefault();
        if (event.buttons !== 1) return;
        if (event.target === element) {
          initialStylesActive = element.style.cssText;
          element.style.cssText += styles.active;
          isActive = true;
          activeElement = element;
        }
      });

      window.addEventListener("mouseup", (event) => {
        if (event.button === 1) return;
        if (element === activeElement) {
          if (element !== event.target) {
            const positionValue =
              activeElement.style[positionProperty] || "0px";
            activeElement.style.cssText = initialStylesHover;
            activeElement.style[positionProperty] = positionValue;

            isActive = false;
          } else {
            const positionValue =
              activeElement.style[positionProperty] || "0px";
            activeElement.style.cssText = initialStylesActive;
            activeElement.style[positionProperty] = positionValue;
            isActive = false;
          }
        }
      });
    }

    setupEventListeners(this.cornerNode, {
      hover: CORNER_STYLES_HOVER,
      active: CORNER_STYLES_ACTIVE,
    });

    //vertical box
    setupEventListeners(this.V_scrollBarBox, {
      hover: VERTICAL_BOX_STYLES_HOVER,
      active: VERTICAL_BOX_STYLES_ACTIVE,
    });

    //vertical node
    setupEventListeners(
      this.V_scrollBarNode,
      {
        hover: VERTICAL_NODE_STYLES_HOVER,
        active: VERTICAL_NODE_STYLES_ACTIVE,
      },
      "top"
    );

    //horizontal box
    setupEventListeners(this.H_scrollBarBox, {
      hover: HORIZONTAL_BOX_STYLES_HOVER,
      active: HORIZONTAL_BOX_STYLES_ACTIVE,
    });

    //horizontal node
    setupEventListeners(
      this.H_scrollBarNode,
      {
        hover: HORIZONTAL_NODE_STYLES_HOVER,
        active: HORIZONTAL_NODE_STYLES_ACTIVE,
      },
      "left"
    );

    //Middle navigator
    setupEventListeners(this.middleNavigator, {
      hover: MIDDLE_NAVIGATOR_HOVER,
      active: MIDDLE_NAVIGATOR_ACTIVE,
    });
  }

  changeVisibility() {
    const { scrollHeight, scrollWidth } = this.contentPart;
    const { VERTICAL_FLOAT, SCROLL_SIZE, HORIZONTAL_FLOAT } = this.options;
    this.V_isElementScrollable = scrollHeight > this.element.offsetHeight;
    this.H_isElementScrollable = scrollWidth > this.element.offsetWidth;

    const isRight = VERTICAL_FLOAT === "right";
    const isBottom = HORIZONTAL_FLOAT === "bottom";

    const V_gridValue = isRight
      ? `1fr ${SCROLL_SIZE}px`
      : `${SCROLL_SIZE}px 1fr`;
    const H_gridValue = isBottom
      ? `1fr ${SCROLL_SIZE}px`
      : `${SCROLL_SIZE}px 1fr`;

    if (this.V_isElementScrollable) {
      this.V_scrollBarBox.style.display = "block";
      this.element.style.gridTemplateColumns = V_gridValue;

      const barOrder = isBottom ? (isRight ? 1 : 0) : isRight ? 3 : 2;
      const contentOrder = isBottom ? (isRight ? 0 : 1) : isRight ? 2 : 3;

      this.V_scrollBarBox.style.order = barOrder;
      this.contentPart.style.order = contentOrder;
    } else {
      this.V_scrollBarBox.style.display = "none";
      this.element.style.gridTemplateColumns = "1fr";
    }

    if (this.H_isElementScrollable) {
      this.H_scrollBarBox.style.display = "block";
      this.cornerNode.style.display = "block";
      this.element.style.gridTemplateRows = H_gridValue;

      const barOrder = isBottom ? (isRight ? 2 : 3) : isRight ? 0 : 1;
      const cornerOrder = isBottom ? (isRight ? 3 : 2) : isRight ? 1 : 0;

      this.H_scrollBarBox.style.order = barOrder;
      this.cornerNode.style.order = cornerOrder;
    } else {
      this.H_scrollBarBox.style.display = "none";
      this.cornerNode.style.display = "none";
      this.element.style.gridTemplateRows = "1fr";
    }
  }

  resizeEvent() {
    this.changeScrollNode("top");
    const nodeTop = this.calculateNode("top");
    this.V_scrollBarNode.style.top = nodeTop + "px";

    this.changeScrollNode("left");
    const nodeLeft = this.calculateNode("left");
    this.H_scrollBarNode.style.left = nodeLeft + "px";

    this.changeVisibility();
  }

  addToScroll(e, type) {
    const { METHOD, SCROLL_AMOUNT } = this.options;
    const isTop = type === "top";
    const amount = METHOD === "smooth" ? SCROLL_AMOUNT / 8 : SCROLL_AMOUNT;

    //Fused checks
    const calcScrollFn = isTop
      ? this.calculateScroll.bind(this, e, amount, "top")
      : this.calculateScroll.bind(this, e, amount, "left");

    //Fused calls
    if (e.isMiddle) {
      const directions = calcScrollFn();
      this.contentPart.scrollTop = directions.valueY;
      this.contentPart.scrollLeft = directions.valueX;
      const top = this.calculateNode("top");
      const left = this.calculateNode("left");

      this.V_scrollBarNode.style.top = `${top}px`;
      this.H_scrollBarNode.style.left = `${left}px`;
    } else {
      //Fused checks but without e.isMiddle
      const scrollProp = isTop ? "scrollTop" : "scrollLeft";
      const styleProp = isTop ? "top" : "left";
      const calcNodeFn = isTop
        ? () => this.calculateNode("top")
        : () => this.calculateNode("left");
      const node = isTop ? this.V_scrollBarNode : this.H_scrollBarNode;

      this.contentPart[scrollProp] = calcScrollFn();
      const nodePos = calcNodeFn.call(this);
      node.style[styleProp] = `${nodePos}px`;
    }
  }

  changeScrollNode(type) {
    const { clientSize, scrollSize } = this.getValues(type);

    //fused checks
    const isTop = type === "top";
    const scrollSizeName = isTop ? "V_scrollNodeHeight" : "H_scrollNodeWidth";
    const size = isTop ? "height" : "width";
    const scrollNodeName = isTop ? "V_scrollBarNode" : "H_scrollBarNode";
    const grabbedName = isTop ? "V_grabbedPos" : "H_grabbedPos";

    //fused calculations
    const oldScrollNodeSize = this[scrollSizeName];
    this[scrollSizeName] = (clientSize / scrollSize) * clientSize;
    this[scrollNodeName].style[size] = `${
      this[scrollSizeName] > 40 ? this[scrollSizeName] : 40
    }px`;
    this[grabbedName] =
      (this[grabbedName] / oldScrollNodeSize) * this[scrollSizeName];
  }

  addParentStyles() {
    this.element.style.boxSizing = "border-box";
    this.element.style.display = "grid";
    this.element.style.overflow = "hidden";
  }

  calculateNode(type) {
    const { clientSize, scrollSize, scrollDirection } = this.getValues(type);

    const scrollNodeSize =
      type === "top" ? this.V_scrollNodeHeight : this.H_scrollNodeWidth;

    //fused calculations
    const remaingingSpace =
      clientSize - (scrollNodeSize > 40 ? scrollNodeSize : 40);

    const realScrollWidth = scrollSize - clientSize;
    const nodeDirection = (remaingingSpace / realScrollWidth) * scrollDirection;

    return nodeDirection;
  }

  calculateScroll(event, amount, type) {
    //fused calculations
    let value = 0;
    if (event.isMiddle) {
      const { scrollTop, scrollLeft, clientHeight, clientWidth } =
        this.contentPart;
      let valueY = scrollTop + event.deltaY / 4;
      let valueX = scrollLeft + event.deltaX / 4;

      valueY = valueY > 0 ? valueY : valueY < 0 ? 0 : scrollTop - clientHeight;
      valueX = valueX > 0 ? valueX : valueX < 0 ? 0 : scrollLeft - clientWidth;

      return { valueY, valueX };
    }
    const { clientSize, scrollSize, scrollDirection } = this.getValues(type);

    value = scrollDirection + (event.deltaY < 0 ? 0 - amount : amount);

    const maxValue = scrollSize - clientSize;

    if (value > 0) {
      return value;
    }
    if (value < 0) {
      return 0;
    }
    if (value > maxValue) {
      return maxValue;
    }
  }

  animate(_, current, e, max = this.options.SCROLL_AMOUNT) {
    const isAnimationOver = max === false ? max : current >= max;
    let event;
    if (e.isMiddle) {
      event = {
        isMiddle: e.isMiddle,
        deltaY: this.middle_deltaY,
        deltaX: this.middle_deltaX,
      };
      if (!this.is_middle_grabbed) return;
    } else {
      event = e;
    }
    if (!isAnimationOver) {
      if (event.isMiddle) {
        this.addToScroll(event, "both");
      } else if (event.shiftKey) {
        this.addToScroll(event, "left");
      } else {
        this.addToScroll(event, "top");
      }
      current += this.options.SCROLL_AMOUNT / 8;
      requestAnimationFrame((timeStamp) =>
        this.animate(timeStamp, current, event, max)
      );
    }
  }

  getValues(type) {
    const {
      scrollHeight,
      scrollTop,
      clientHeight,
      scrollWidth,
      scrollLeft,
      clientWidth,
    } = this.contentPart;
    const isTop = type === "top";

    const clientSize = isTop ? clientHeight : clientWidth;
    const scrollSize = isTop ? scrollHeight : scrollWidth;
    const scrollDirection = isTop ? scrollTop : scrollLeft;

    return { clientSize, scrollSize, scrollDirection };
  }

  addMiddleClickStarter(top, left) {
    const { MIDDLE_NAVIGATOR } = this.options;
    this.middleNavigator.style.cssText = MIDDLE_NAVIGATOR;
    this.middleNavigator.style.position = "absolute";
    this.middleNavigator.style.translate = "-50% -50%";
    this.middleNavigator.style.top = `${top}px`;
    this.middleNavigator.style.left = `${left}px`;
    this.element.style.cursor = "all-scroll";
    this.contentPart.appendChild(this.middleNavigator);
  }

  removeMiddleClickStarter() {
    this.contentPart.removeChild(this.middleNavigator);
    this.element.style.cursor = "default";
  }
}
