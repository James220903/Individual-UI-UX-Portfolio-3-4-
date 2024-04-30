const mongoose = require('mongoose');

const relationshipSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'PersonalSupervisor' },
    startDate: Date,
    endDate: Date
});

const Relationship = mongoose.model('Relationship', relationshipSchema);
module.exports = Relationship;
