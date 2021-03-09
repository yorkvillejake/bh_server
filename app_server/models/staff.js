const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var StaffSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80},
  birthday: {type: Date, required: true},
  is_active: {type: Boolean, default: false},
  is_junior: {type: Boolean, default: false},
  notes: {type: String},
  loc_id: {type: Schema.ObjectId, ref: 'location', required: true}
})

module.exports = mongoose.model('Staff', StaffSchema, 'staff');
