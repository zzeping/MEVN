const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    joint: String,
    time: String,
    report: String,
    data: String,
    patient: {type:mongoose.Schema.Types.ObjectId, ref:'Patient'},
    created: {
        type: Date,
        default: Date.now
    }

});
module.exports = mongoose.model("Record", recordSchema);