import {scrollbar} from '../custom-scrollbar.js'

export default function changeScrollNodeHeight(element) {
  scrollbar.scrollNodeHeight =
    (element.clientHeight / element.scrollHeight) * element.clientHeight;
  scrollbar.scrollBarNode.style.height = `${
      scrollbar.scrollNodeHeight > 40 ? scrollbar.scrollNodeHeight : 40
  }px`;
}
