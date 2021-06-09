let getToday = function()
{
  let today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  return today;
}

module.exports = {
  getToday
}