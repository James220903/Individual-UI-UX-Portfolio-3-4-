const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a schema
const seniorTutorSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: String,
    lastName: String
});

const SeniorTutor = mongoose.model('SeniorTutor', seniorTutorSchema);
module.exports = SeniorTutor;
