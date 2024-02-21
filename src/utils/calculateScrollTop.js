export default function calculateScrollTop(element, event, amount) {
  const { scrollHeight, scrollTop, clientHeight } = element;

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
