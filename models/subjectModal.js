const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of a subject is required'],
  },
});

const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = Subject;
