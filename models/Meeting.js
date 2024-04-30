const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingsSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'PersonalSupervisor' },
    meetingDate: Date,
    meetingSubject: String,
    meetingNotes: String
});

const Meeting = mongoose.model('Meeting', meetingsSchema);
module.exports = Meeting;
