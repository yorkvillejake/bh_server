const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var StudentSchema = new Schema ({
  firstname: {type: String, required: true, maxlength: 80},
  lastname: {type: String, required: true, maxlength: 80},
  birthday: {type: Date, required: true},
  date_started: {type: Date, required: true},
  date_end: {type: Date, required: true},
  is_active: {type: Boolean, default: false},
  avatar: {type: String},
  contact_person: {type: String, maxlength: 80},
  contact_email: {type: String, maxlength: 80},
  contact_phone: {type: String, maxlength: 25},
  is_trial: {type: Boolean, required: true},
  trial_start: {type: Date},
  trial_end: {type: Date},
  trial_num_classes: {type: Number},
  levels: [{type: String}],
  notes: {type: String},
  attendance: [{
    class_id: {type: Schema.ObjectId, ref: 'class'},
    schedules: [{type: Schema.ObjectId, ref: 'schedule'}]
  }],
  loc_id: {type: Schema.ObjectId, ref: 'location', required: true}
})

module.exports = mongoose.model('Student', StudentSchema, 'student');
