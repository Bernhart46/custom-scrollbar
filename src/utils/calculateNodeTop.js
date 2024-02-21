import { scrollbar } from "../custom-scrollbar.js";

export default function calculateNodeTop(element) {
  const { clientHeight, scrollHeight, scrollTop } = element;

  const remainingSpace =
    clientHeight -
    (scrollbar.scrollNodeHeight > 40 ? scrollbar.scrollNodeHeight : 40);
  const realScrollHeight = scrollHeight - clientHeight;
  const nodeTop = (remainingSpace / realScrollHeight) * scrollTop;

  return nodeTop;
}
