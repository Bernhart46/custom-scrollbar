"use strict";
const wrapper = document.querySelector(".wrapper");

const METHODS = ["default", "smooth"];
const ERROR_MESSAGES = {
  NO_ELEMENT: "No element has been added to the function!",
  WRONG_METHOD: 'Wrong method type. Method types: "default", "smooth"',
};

const DEFAULT_OPTIONS = {
  SCROLL_AMOUNT: 128,
};

class CustomScrollbar {
  constructor(element, method = "default", options = DEFAULT_OPTIONS) {
    if (!element) throw new Error(ERROR_MESSAGES.NO_ELEMENT);
    if (!METHODS.includes(method)) throw new Error(ERROR_MESSAGES.WRONG_METHOD);

    this.element = element;
    this.method = method;
    this.options = options;

    //PARTS
    this.scrollBarBox = null;
    this.scrollBarNode = null;
    this.scrollNodeHeight = null;

    this.isElementScrollable =
      this.element.scrollHeight > this.element.clientHeight;

    if (this.isElementScrollable) {
      //remove scrollBar
    }

    //scrollToTheTop
    this.element.scrollTop = 0;

    this.addScrollbar();
    this.addEvents();
  }

  addScrollbar() {
    this.addParentStyles();

    //initialize parts
    const content = this.element.innerHTML;
    const contentPart = document.createElement("div");
    this.scrollBarBox = document.createElement("div");
    this.scrollBarNode = document.createElement("div");

    //place the content inside the contentPart
    this.element.innerHTML = "";
    contentPart.innerHTML = content;

    //add classes
    this.scrollBarNode.classList.add("scrollNode");
    this.scrollBarBox.classList.add("scrollBarBox");

    //append
    this.element.appendChild(contentPart);
    this.scrollBarBox.appendChild(this.scrollBarNode);
    this.element.appendChild(this.scrollBarBox);

    this.changeScrollNodeHeight();

    this.scrollBarBox.style.top = this.element.scrollTop + "px";
    const nodeTop = this.calculateNodeTop();
    this.scrollBarNode.style.top = nodeTop + "px";
  }

  addEvents() {
    this.element.addEventListener("wheel", (e) => {
      if (this.method === "default") {
        this.addToScrollTop(e);
      }
      if (this.method === "smooth") {
        this.animate(0, 0, e);
      }
    });

    window.addEventListener("resize", () => {
      this.changeScrollNodeHeight();
      this.scrollBarBox.style.top = this.element.scrollTop + "px";
      const nodeTop = this.calculateNodeTop();
      this.scrollBarNode.style.top = nodeTop + "px";
    });
  }

  addToScrollTop(e) {
    const amount =
      this.method === "smooth"
        ? this.options.SCROLL_AMOUNT / 8
        : this.options.SCROLL_AMOUNT;
    this.element.scrollTop = this.calculateScrollTop(e, amount);
    this.scrollBarBox.style.top = this.element.scrollTop + "px";
    const nodeTop = this.calculateNodeTop();
    this.scrollBarNode.style.top = `${nodeTop}px`;
  }

  changeScrollNodeHeight() {
    const { clientHeight, scrollHeight } = this.element;
    this.scrollNodeHeight = (clientHeight / scrollHeight) * clientHeight;
    this.scrollBarNode.style.height = `${
      this.scrollNodeHeight > 40 ? this.scrollNodeHeight : 40
    }px`;
  }

  addParentStyles() {
    this.element.style.boxSizing = "border-box";
    this.element.style.paddingRight = "16px";
    this.element.style.position = "relative";
    this.element.style.overflow = "hidden";
  }

  calculateNodeTop() {
    const { clientHeight, scrollHeight, scrollTop } = this.element;

    const remainingSpace =
      clientHeight - (this.scrollNodeHeight > 40 ? this.scrollNodeHeight : 40);
    const realScrollHeight = scrollHeight - clientHeight;
    const nodeTop = (remainingSpace / realScrollHeight) * scrollTop;

    return nodeTop;
  }

  calculateScrollTop(event, amount) {
    const { scrollHeight, scrollTop, clientHeight } = this.element;

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

new CustomScrollbar(wrapper, "smooth");
