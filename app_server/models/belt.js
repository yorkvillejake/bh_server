const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var BeltSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80},
  image: {type: String },
  sequence: {type: Number, default: 0},
  group: {type: Schema.ObjectId, ref: 'beltgroup'},
})

module.exports = mongoose.model('Belt', BeltSchema, 'belt');
