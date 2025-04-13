function getPastWeekDates() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setUTCHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
}

module.exports = { getPastWeekDates };
