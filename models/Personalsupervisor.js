const mongoose = require('mongoose');

const personalSupervisorSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: String,
    lastName: String
});

const PersonalSupervisor = mongoose.model('PersonalSupervisor', personalSupervisorSchema);
module.exports = PersonalSupervisor;
