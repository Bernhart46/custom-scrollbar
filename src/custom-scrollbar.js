"use strict";
import calculateScrollTop from "./utils/calculateScrollTop.js";
import addParentStyles from "./utils/addParentStyles.js";
import addScrollBar from "./utils/addScrollBar.js";
import changeScrollNodeHeight from "./utils/changeScrollNodeHeight.js";
import calculateNodeTop from './utils/calculateNodeTop.js'

const wrapper = document.querySelector(".wrapper")
export const SCROLL_AMOUNT = 128;

export const scrollbar = {
  scrollBarBox: null,
  scrollBarNode: null,
  scrollNodeHeight: null
}

let prevTop = null;

function addCustomScroll(element, method = "default") {
  if (!element) throw new Error("No element has been added to the function!");
  const isElementScrollable = element.scrollHeight > element.clientHeight;

  if (isElementScrollable) {
    element.scrollTop = 0;
    addParentStyles(element);
    addScrollBar(element);
  }
  scrollbar.scrollBarBox.style.top = element.scrollTop + "px";
  const nodeTop = calculateNodeTop(element)
  scrollbar.scrollBarNode.style.top = nodeTop + "px";

  element.addEventListener("wheel", (e) => {
    //addToScrollTop(e)
    if (method === "default") {
      addToScrollTop(e, method);
    }
    if (method === "smooth") {
      animate(0, 0, SCROLL_AMOUNT, addToScrollTop, e, method);
    }
  });
  window.addEventListener("resize", (e) => {
    changeScrollNodeHeight(element)
    scrollbar.scrollBarBox.style.top = element.scrollTop + "px";
    const nodeTop = calculateNodeTop(element)
    scrollbar.scrollBarNode.style.top = nodeTop + "px"
  })

  function addToScrollTop(e, method) {
    const amount = method === "default" ? SCROLL_AMOUNT : SCROLL_AMOUNT / 8;
    element.scrollTop = calculateScrollTop(element, e, amount);
    scrollbar.scrollBarBox.style.top = element.scrollTop + "px";
    const nodeTop = calculateNodeTop(element)
    scrollbar.scrollBarNode.style.top = `${nodeTop}px`;
    prevTop = nodeTop
  }
}
addCustomScroll(wrapper, "smooth");

function animate(_, current, max, func, ...attr) {
  if (current < max) {
    func(...attr);
    current += SCROLL_AMOUNT / 8;
    requestAnimationFrame((timeStamp) => animate(timeStamp, current, max, func, ...attr));
  }
}
