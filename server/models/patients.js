const mongoose = require('mongoose');


const patientSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    // image: String,
    birthday: String,
    gender: String,
    fileNumber:String,
    records: [{
        type: String, ref: 'Record'
    }],
    created: {
        type: Date,
        default: Date.now
    }

});
module.exports = mongoose.model("Patient", patientSchema);