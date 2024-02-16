export default function calculateScrollTop(element, event, amount) {
  const value = element.scrollTop + (event.deltaY < 0 ? 0 - amount : amount);
  const maxValue = element.scrollHeight - element.clientHeight;

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
