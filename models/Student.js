const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: String,
    lastName: String
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
