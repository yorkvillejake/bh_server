const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ClassSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80},
  is_active: {type: Boolean, default: false},
  is_testing: {type: Boolean, default: false},
  towards_next: {type: Boolean, default: false},
  is_regular: {type: Boolean, default: false},
  belt_group: {type: Schema.ObjectId, ref: 'beltgroup', required: true},
  // belt_color: {type: Schema.ObjectId, ref: 'belt', required: true},
  loc_id: {type: Schema.ObjectId, ref: 'location', required: true}
})

module.exports = mongoose.model('Class', ClassSchema, 'class');
