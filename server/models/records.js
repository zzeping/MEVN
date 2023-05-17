const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
    x: Number,
    y: Number
});

const recordSchema = mongoose.Schema({
    joint: String,
    time: String,
    report: String,
    data_type: String,
    hamstring: [dataSchema],
    quadricep: [dataSchema],
    patient: String,
    created: {
        type: Date,
        default: Date.now
    }

});
module.exports = mongoose.model("Record", recordSchema);