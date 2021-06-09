const Schedule = require('../models/schedule');
const Class = require('../models/class');
const Student = require('../models/student');
const LogStudent = require('../models/logstudent');
let ObjectId = require('mongoose').Types.ObjectId;
const { getToday } = require('../helper');

let checkMissedClasses = async function() {
  var date = new Date();
  var sp_query = { date, is_regular: false };
  var query = { is_regular: true, weekday: date.getDay() };
  var today = getToday();

  try {
    var classes = await Class.find({}).lean();
    var schedules = await Schedule.find({$or: [query, sp_query]}, null).sort({ time_start: 1, time_end: 1 });
    for (let schedule of schedules) {
      var students = await Student.find({ "attendance.schedules": schedule._id });
      for (let student of students) {
        // check if the student has checked in this schedule
        let log = await LogStudent.find({ student: student._id, schedule_id: schedule._id, createdAt: { $gte: today }});
        if (!log.length) {
          let cur_class = classes.find(cl => cl._id.equals(schedule.class_id));
          await new LogStudent({
            student: student._id,
            class_id: schedule.class_id,
            class_name: cur_class ? cur_class.name : '',
            schedule_id: schedule._id,
            is_missed: true,
          }).save();
        }
      }
    }

    console.log('Done checking')
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  checkMissedClasses
}