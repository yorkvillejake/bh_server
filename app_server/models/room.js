const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RoomSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80},
  loc_id: {type: Schema.ObjectId, ref: 'location', required: true}
})

module.exports = mongoose.model('Room', RoomSchema, 'room');
