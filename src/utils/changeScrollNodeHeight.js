import { scrollbar } from "../custom-scrollbar.js";

export default function changeScrollNodeHeight(element) {
  const { clientHeight, scrollHeight } = element;
  scrollbar.scrollNodeHeight = (clientHeight / scrollHeight) * clientHeight;
  scrollbar.scrollBarNode.style.height = `${
    scrollbar.scrollNodeHeight > 40 ? scrollbar.scrollNodeHeight : 40
  }px`;
}
