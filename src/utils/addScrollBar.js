import { scrollbar } from "../custom-scrollbar.js";
import changeScrollNodeHeight from './changeScrollNodeHeight.js'

export default function addScrollBar(element) {
  scrollbar.scrollBarBox = document.createElement("div");
  scrollbar.scrollBarBox.classList.add("scrollBarBox");

  scrollbar.scrollBarNode = document.createElement("div");
  scrollbar.scrollBarNode.classList.add("scrollNode");
  changeScrollNodeHeight(element, element.clientHeight);

  scrollbar.scrollBarBox.appendChild(scrollbar.scrollBarNode);
  element.appendChild(scrollbar.scrollBarBox);
}
