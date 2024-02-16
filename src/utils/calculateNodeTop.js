import { scrollbar } from "../custom-scrollbar.js";

export default function calculateNodeTop(element){
    const remainingSpace =
    element.clientHeight - (scrollbar.scrollNodeHeight > 40 ? scrollbar.scrollNodeHeight : 40);
    const realScrollHeight = element.scrollHeight - element.clientHeight;
    const nodeTop = (remainingSpace / realScrollHeight) * element.scrollTop;

    console.log(element.scrollHeight);
    return nodeTop;
}