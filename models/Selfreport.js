const mongoose = require('mongoose');

const selfReportsSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    reportDate: Date,
    reportContent: String
});

const SelfReport = mongoose.model('SelfReport', selfReportsSchema);
module.exports = SelfReport;
