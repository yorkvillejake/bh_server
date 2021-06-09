const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var LocationSchema = new Schema ({
  name: {type: String, required: true},
})

module.exports = mongoose.model('Location', LocationSchema, 'location');
