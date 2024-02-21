import changeScrollNodeHeight from "./changeScrollNodeHeight.js";

export default function addScrollBar(element) {
  //initialize parts
  const content = element.innerHTML;
  const contentPart = document.createElement("div");
  const scrollPart = document.createElement("div");
  const scrollBarNode = document.createElement("div");

  //place the content inside the contentPart
  element.innerHTML = "";
  contentPart.innerHTML = content;

  //add classes
  scrollBarNode.classList.add("scrollNode");
  scrollPart.classList.add("scrollBarBox");

  //append
  element.appendChild(contentPart);
  scrollPart.appendChild(scrollBarNode);
  element.appendChild(scrollPart);

  return { contentPart, scrollPart, scrollBarNode };
}
