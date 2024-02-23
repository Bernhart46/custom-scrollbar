"use strict";
const wrapper = document.querySelector(".wrapper");

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
};

//It needed if I only want to change 1 variable but keep the rest
function makeDefaultOptions(defaults, changed) {
  return { ...defaults, ...changed };
}

class CustomScrollbar {
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

    this.addScrollbar();
    this.addEvents();
    this.changeVisibility();
  }

  addScrollbar() {
    this.addParentStyles();

    //initialize parts
    const content = this.element.innerHTML;
    this.contentPart = document.createElement("div");
    this.V_scrollBarBox = document.createElement("div");
    this.V_scrollBarNode = document.createElement("div");

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
    this.contentPart.classList.add("contentPart");
    this.V_scrollBarNode.classList.add("V_scrollNode");
    this.V_scrollBarBox.classList.add("V_scrollBarBox");

    this.cornerNode.classList.add("cornerNode");

    this.H_scrollBarNode.classList.add("H_scrollNode");
    this.H_scrollBarBox.classList.add("H_scrollBarBox");

    //append
    this.element.appendChild(this.contentPart);
    this.V_scrollBarBox.appendChild(this.V_scrollBarNode);
    this.element.appendChild(this.V_scrollBarBox);

    this.element.appendChild(this.cornerNode);

    this.H_scrollBarBox.appendChild(this.H_scrollBarNode);
    this.element.appendChild(this.H_scrollBarBox);

    this.changeScrollNode("top");
    this.changeScrollNode("left");

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
    this.H_grabbedPos = false;

    this.V_scrollBarNode.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.V_isGrabbed = true;
      this.V_grabbedPos = e.layerY;
    });
    this.H_scrollBarNode.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.H_isGrabbed = true;
      this.H_grabbedPos = e.layerX;
    });
    window.addEventListener("mousemove", (e) => {
      const { scrollHeight, clientHeight, offsetTop } = this.contentPart;
      const { scrollWidth, clientWidth, offsetLeft } = this.contentPart;
      //VERTICAL
      if (this.V_isGrabbed) {
        const borderSize = (this.contentPart.offsetHeight - clientHeight) / 2;
        const cursorPos =
          e.clientY - offsetTop - borderSize - this.V_grabbedPos;
        const isTooSmall = this.V_scrollNodeHeight <= 40;
        const realScrollNodeHeight = isTooSmall ? 40 : this.V_scrollNodeHeight;
        const spaceWithoutNode = clientHeight - realScrollNodeHeight;

        let newTop = cursorPos;
        if (cursorPos < 0) {
          newTop = 0;
        }
        if (cursorPos >= spaceWithoutNode) {
          newTop = spaceWithoutNode;
        }

        this.V_scrollBarNode.style.top = `${newTop}px`;

        //scrollTop
        const realScrollHeight = scrollHeight - clientHeight;
        const newScrollTop = (newTop / spaceWithoutNode) * realScrollHeight;

        this.contentPart.scrollTop = newScrollTop;
      }

      //HORIZONTAL
      if (this.H_isGrabbed) {
        const borderSize = (this.contentPart.offsetWidth - clientWidth) / 2;
        const cursorPos =
          e.clientX - offsetLeft - borderSize - this.H_grabbedPos;
        const isTooSmall = this.H_scrollNodeWidth <= 40;
        const realScrollNodeWidth = isTooSmall ? 40 : this.H_scrollNodeWidth;
        const spaceWithoutNode = clientWidth - realScrollNodeWidth;

        let newLeft = cursorPos;
        if (cursorPos < 0) {
          newLeft = 0;
        }
        if (cursorPos >= spaceWithoutNode) {
          newLeft = spaceWithoutNode;
        }

        this.H_scrollBarNode.style.left = `${newLeft}px`;

        //scrollTop
        const realScrollWidth = scrollWidth - clientWidth;
        const newScrollLeft = (newLeft / spaceWithoutNode) * realScrollWidth;

        this.contentPart.scrollLeft = newScrollLeft;
      }
    });

    window.addEventListener("mouseup", (e) => {
      if (this.V_isGrabbed) {
        this.V_isGrabbed = false;
      }
      if (this.H_isGrabbed) {
        this.H_isGrabbed = false;
      }
    });

    //FOR MOBILE
    // this.touchStartY;

    // this.element.addEventListener("touchstart", (e) => {
    //   this.touchStartY = e.touches[0].clientY;
    // });
    // this.element.addEventListener("touchmove", (e) => {
    //   // e.preventDefault();

    //   this.options.SCROLL_AMOUNT = 24;

    //   const isDone = this.touchStartY;

    //   scroll({
    //     deltaY: this.touchStartY - e.touches[0].clientY,
    //   });
    // });

    const scroll = (e) => {
      if (this.options.METHOD === "default") {
        if (e.shiftKey) {
          this.addToScroll(e, "left");
        } else {
          this.addToScroll(e, "top");
        }
      }
      if (this.options.METHOD === "smooth") {
        this.animate(0, 0, e);
      }
    };
  }
  changeVisibility() {
    const { scrollHeight, scrollWidth } = this.contentPart;
    const { VERTICAL_FLOAT, SCROLL_SIZE, HORIZONTAL_FLOAT } = this.options;
    const V_isElementScrollable = scrollHeight > this.element.offsetHeight;
    const H_isElementScrollable = scrollWidth > this.element.offsetWidth;

    const isRight = VERTICAL_FLOAT === "right";
    const isBottom = HORIZONTAL_FLOAT === "bottom";

    const V_gridValue = isRight
      ? `1fr ${SCROLL_SIZE}px`
      : `${SCROLL_SIZE}px 1fr`;
    const H_gridValue = isBottom
      ? `1fr ${SCROLL_SIZE}px`
      : `${SCROLL_SIZE}px 1fr`;

    if (V_isElementScrollable) {
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

    if (H_isElementScrollable) {
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
    const scrollProp = isTop ? "scrollTop" : "scrollLeft";
    const styleProp = isTop ? "top" : "left";
    const calcScrollFn = isTop
      ? this.calculateScroll.bind(this, e, amount, "top")
      : this.calculateScroll.bind(this, e, amount, "left");
    const calcNodeFn = isTop
      ? () => this.calculateNode("top")
      : () => this.calculateNode("left");
    const node = isTop ? this.V_scrollBarNode : this.H_scrollBarNode;

    //Fused calls
    this.contentPart[scrollProp] = calcScrollFn();
    const nodePos = calcNodeFn.call(this);
    node.style[styleProp] = `${nodePos}px`;
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
    const { clientSize, scrollSize, scrollDirection } = this.getValues(type);
    //fused calculations
    const value = scrollDirection + (event.deltaY < 0 ? 0 - amount : amount);
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

  animate(_, current, e) {
    const isAnimationOver = current >= this.options.SCROLL_AMOUNT;
    if (!isAnimationOver) {
      if (e.shiftKey) {
        this.addToScroll(e, "left");
      } else {
        this.addToScroll(e, "top");
      }
      current += this.options.SCROLL_AMOUNT / 8;
      requestAnimationFrame((timeStamp) => this.animate(timeStamp, current, e));
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
}

new CustomScrollbar(wrapper, {
  SCROLL_SIZE: 8,
});
