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
    this.scrollBarBox = null;
    this.scrollBarNode = null;
    this.scrollNodeHeight = null;

    this.addScrollbar();
    this.addEvents();
    this.changeVisibility();
  }

  addScrollbar() {
    this.addParentStyles();

    //initialize parts
    const content = this.element.innerHTML;
    this.contentPart = document.createElement("div");
    this.scrollBarBox = document.createElement("div");
    this.scrollBarNode = document.createElement("div");

    //place the content inside the contentPart
    this.element.innerHTML = "";
    this.contentPart.innerHTML = content;

    //TEST FUNCTION
    setTimeout(() => {
      this.contentPart.innerHTML = content + content;
      this.resizeEvent();
    }, 2000);

    //add classes
    this.contentPart.classList.add("contentPart");
    this.scrollBarNode.classList.add("scrollNode");
    this.scrollBarBox.classList.add("scrollBarBox");

    //append
    this.element.appendChild(this.contentPart);
    this.scrollBarBox.appendChild(this.scrollBarNode);
    this.element.appendChild(this.scrollBarBox);

    this.changeScrollNodeHeight();

    // this.scrollBarBox.style.top = 0 + "px";
    // this.scrollBarNode.style.top = 0 + "px";
    this.contentPart.scrollTop = 0;
  }

  addEvents() {
    this.element.addEventListener("wheel", (e) => {
      e.preventDefault();
      scroll(e);
    });

    window.addEventListener("resize", this.resizeEvent.bind(this));

    //Moving by grabbing
    this.isGrabbed = false;
    this.grabbedPos = 0;
    this.scrollBarNode.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.isGrabbed = true;
      this.grabbedPos = e.layerY;
    });
    window.addEventListener("mousemove", (e) => {
      const { scrollHeight, clientHeight, offsetTop } = this.contentPart;
      if (this.isGrabbed) {
        const borderSize = (this.contentPart.offsetHeight - clientHeight) / 2;
        const cursorPos = e.clientY - offsetTop - borderSize - this.grabbedPos;
        const isTooSmall = this.scrollNodeHeight <= 40;
        const realScrollNodeHeight = isTooSmall ? 40 : this.scrollNodeHeight;
        const spaceWithoutNode = clientHeight - realScrollNodeHeight;

        let newTop = cursorPos;
        if (cursorPos < 0) {
          newTop = 0;
        }
        if (cursorPos >= spaceWithoutNode) {
          newTop = spaceWithoutNode;
        }

        this.scrollBarNode.style.top = `${newTop}px`;

        //scrollTop
        const realScrollHeight = scrollHeight - clientHeight;
        const newScrollTop = (newTop / spaceWithoutNode) * realScrollHeight;

        this.contentPart.scrollTop = newScrollTop;
      }
    });

    window.addEventListener("mouseup", (e) => {
      if (this.isGrabbed) {
        this.isGrabbed = false;
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
        this.addToScrollTop(e);
      }
      if (this.options.METHOD === "smooth") {
        this.animate(0, 0, e);
      }
    };
  }
  changeVisibility() {
    const { scrollHeight } = this.contentPart;
    const { VERTICAL_FLOAT, SCROLL_SIZE } = this.options;
    this.isElementScrollable = scrollHeight > this.element.offsetHeight;

    const isRight = VERTICAL_FLOAT === "right";

    const gridValue = isRight ? `1fr ${SCROLL_SIZE}px` : `${SCROLL_SIZE}px 1fr`;

    if (this.isElementScrollable) {
      this.scrollBarBox.style.display = "block";
      this.element.style.gridTemplateColumns = gridValue;
      this.scrollBarBox.style.order = isRight ? 1 : 0;
      this.contentPart.style.order = isRight ? 0 : 1;
    } else {
      this.scrollBarBox.style.display = "none";
      this.element.style.gridTemplateColumns = "1fr";
    }
  }

  resizeEvent() {
    this.changeScrollNodeHeight();
    const nodeTop = this.calculateNodeTop();
    this.scrollBarNode.style.top = nodeTop + "px";

    this.changeVisibility();
  }

  addToScrollTop(e) {
    const amount =
      this.options.METHOD === "smooth"
        ? this.options.SCROLL_AMOUNT / 8
        : this.options.SCROLL_AMOUNT;
    this.contentPart.scrollTop = this.calculateScrollTop(e, amount);
    const nodeTop = this.calculateNodeTop();
    this.scrollBarNode.style.top = `${nodeTop}px`;
  }

  changeScrollNodeHeight() {
    const { clientHeight, scrollHeight } = this.contentPart;
    const oldScrollNodeHeight = this.scrollNodeHeight;
    this.scrollNodeHeight = (clientHeight / scrollHeight) * clientHeight;
    this.scrollBarNode.style.height = `${
      this.scrollNodeHeight > 40 ? this.scrollNodeHeight : 40
    }px`;
    this.grabbedPos =
      (this.grabbedPos / oldScrollNodeHeight) * this.scrollNodeHeight;
  }

  addParentStyles() {
    this.element.style.boxSizing = "border-box";
    this.element.style.display = "grid";
    this.element.style.overflow = "hidden";
  }

  calculateNodeTop() {
    const { clientHeight, scrollHeight, scrollTop } = this.contentPart;

    const remainingSpace =
      clientHeight - (this.scrollNodeHeight > 40 ? this.scrollNodeHeight : 40);

    const realScrollHeight = scrollHeight - clientHeight;
    const nodeTop = (remainingSpace / realScrollHeight) * scrollTop;

    return nodeTop;
  }

  calculateScrollTop(event, amount) {
    const { scrollHeight, scrollTop, clientHeight } = this.contentPart;

    const value = scrollTop + (event.deltaY < 0 ? 0 - amount : amount);
    const maxValue = scrollHeight - clientHeight;

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
      this.addToScrollTop(e);
      current += this.options.SCROLL_AMOUNT / 8;
      requestAnimationFrame((timeStamp) => this.animate(timeStamp, current, e));
    }
  }
}

new CustomScrollbar(wrapper, {});
