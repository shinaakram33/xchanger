const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A data must have a name'],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'A data mush have a address'],
  },
});

const DummyModal = mongoose.model('Dummy', dummySchema);

module.exports = DummyModal;
