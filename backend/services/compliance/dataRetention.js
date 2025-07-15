const schedules = [];

function schedule(dataType, days) {
  schedules.push({ dataType, days });
}

function listSchedules() {
  return schedules.slice();
}

module.exports = { schedule, listSchedules };
