const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Student = require('./student');

var ScheduleSchema = new Schema ({
  class_id: {type: Schema.ObjectId, ref: 'class', required: true},
  is_regular: {type: Boolean, required: true},
  weekday: {type: Number},
  date: {type: Date},
  time_start: {type: String, required: true},
  time_end: {type: String, required: true},
  staffs: [{type: Schema.ObjectId, ref: 'staff'}],
  room_id: {type: Schema.ObjectId, ref: 'room', required: true},
  loc_id: {type: Schema.ObjectId, ref: 'location', required: true}
})

ScheduleSchema.post('findOneAndDelete', function(result) {
  console.log('hey', result._id);
  Student.updateMany({ 'attendance.schedules': result._id }, { $pull: { 'attendance.$.schedules': result._id }}, { multi: true}).exec();
});

module.exports = mongoose.model('Schedule', ScheduleSchema, 'schedule');
