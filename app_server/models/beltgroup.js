const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var BeltGroupSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80},
})

module.exports = mongoose.model('BeltGroup', BeltGroupSchema, 'beltgroup');
