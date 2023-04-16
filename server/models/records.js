const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    joint: String,
    time: String,
    report: String,
    data_type: String,
    hamstring_path: String,
    quadricep_path: String,
    patient: String,
    created: {
        type: Date,
        default: Date.now
    }

});
module.exports = mongoose.model("Record", recordSchema);