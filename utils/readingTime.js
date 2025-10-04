function estimateReadingTime(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  const wpm = 200; // average
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return minutes;
}

module.exports = estimateReadingTime;
