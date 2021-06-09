const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var LogStudentSchema = new Schema ({
  student: {type: Schema.Types.ObjectId, ref: 'Student', required: true},
  class_id: {type: String, required: true},
  schedule_id: {type: String, required: true},
  class_name: {type: String},
  is_late: {type: Boolean, default: false},
  is_wrong: {type: Boolean, default: false},
  is_missed: {type: Boolean, default: false},
}, { timestamps: true })

module.exports = mongoose.model('LogStudent', LogStudentSchema, 'logstudent');
