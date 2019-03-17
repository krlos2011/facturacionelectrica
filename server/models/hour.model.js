const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const HourSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  consumption: {
    type: Number,
    required: true,
    minimum: 0,
  },
  price: {
    type: Number,
    required: true,
    minimum: 0,
  },
  cost: {
    type: Number,
    required: true,
    minimum: 0,
  }
});
HourSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Hour', HourSchema);
