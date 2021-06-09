const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var LogStaffSchema = new Schema ({
  staff: {type: Schema.Types.ObjectId, ref: 'staff', required: true},
  schedules: [{
    _id: { type: String },
    time_start: { type: String },
    time_end: { type: String },
    class_name: { type: String }
  }],
  additional: {
    time_start: { type: String },
    time_end: { type: String }
  },
  total_time: {type: Number}
}, { timestamps: true })

module.exports = mongoose.model('LogStaff', LogStaffSchema, 'logstaff');
