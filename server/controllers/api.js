const Patient = require('../models/patients');
const Record = require('../models/records');
const fs = require('fs');
// const plotly = require('plotly')('zzeping', 'jniUkNB4Lup0xvQcYMlA');



module.exports = class API {

    static async fetchAllPatients(req, res) {
        try {
            const patients = await Patient.find();
            res.status(200).json(patients);
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }


    static async fetchPatientByID(req, res) {
        const id = req.params.id;
        try {
            const patient = await Patient.findById(id);
            res.status(200).json(patient);
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }


    // static async uploadData(req, res) {
    //     try {
    //         const fileContent = fs.readFileSync(req.file.path, 'utf8');
    //         const lines = fileContent.split('\n');
    //         const test_time = lines[1];
    //         console.log(test_time);
    //         const data = lines.slice(2).map(line => {
    //             const [time, torque, position, posAnat, velocity] = line.split(/\s+/);
    //             return { time, torque, position, posAnat, velocity };
    //         });

    //         res.status(200).json({torqueTrace, posAnatTrace, velocityTrace});

    //     } catch (err) {
    //         res.status(400).json({ message: err.message })
    //     }
    // }

    static async updatePatient(req, res) {
        const id = req.params.id;
        // let new_image = "";
        // if (req.file) {
        //     new_image = req.file.filename;
        //     try {
        //         fs.unlinkSync("./uploads/", + req.body.old_image);
        //     } catch (err) {
        //         console.log(err);
        //     }
        // } else {
        //     new_image = req.body.old_image;
        // }

        const newPatient = req.body;
        // newPatient.image = new_image;
        try {
            await Patient.findByIdAndUpdate(id, newPatient);
            res.status(200).json({ message: "Patient update successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async updatePatientRecord(req, res) {
        const id = req.params.id;
        const record = req.body.record;
        const newPatient = await Patient.findById(id);
        newPatient.records.push(record);
        try {
            await Patient.findByIdAndUpdate(id, newPatient);
            res.status(200).json({ message: "Patient update successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async removePatientRecord(req, res) {
        const id = req.params.id;
        const record = req.body.record;
        const newPatient = await Patient.findById(id);
        const index = newPatient.records.indexOf(record);
        if (index > -1) {
            newPatient.records.splice(index, 1);
        }
        try {
            await Patient.findByIdAndUpdate(id, newPatient);
            res.status(200).json({ message: "Patient update successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async deletePatient(req, res) {
        const id = req.params.id;
        try {
            const result = await Patient.findByIdAndDelete(id);
            // if (result.image != "" && result.image != "default_image.jpg") {
            //     try {
            //         fs.unlinkSync("./uploads/" + result.image);
            //     } catch (err) {
            //         console.log(err);
            //     }
            // }
            res.status(200).json({ message: "Patient deleted successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async createNewPatient(req, res) {
        const patient = req.body;
        // if (!req.file) {
        //     patient.image = "default_image.jpg";
        // } else {
        //     const imagename = req.file.filename;
        //     patient.image = imagename;
        // }

        try {
            await Patient.create(patient);
            res.status(201).json({ message: "Patient created successfully!" })
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }

    static async fetchAllRecords(req, res) {
        try {
            const records = await Record.find();
            res.status(200).json(records);
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async createNewRecord(req, res) {
        const record = req.body;
        const reportFile = req.file.filename;
        record.report = reportFile; 
        record.hamstring = JSON.parse(record.hamstring);
        record.quadricep = JSON.parse(record.quadricep);
        try {
            const newRecord = await Record.create(record);
            res.status(201).json({ message: "Record created successfully!", recordId: newRecord._id });
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
    static async fetchRecordByID(req, res) {
        const id = req.params.id;
        try {
            const record = await Record.findById(id);
            res.status(200).json(record);
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }

    static async deleteRecord(req, res) {
        const id = req.params.id;
        try {
            const result = await Record.findByIdAndDelete(id);
            if (result.report != "") {
                try {
                    fs.unlinkSync("./uploads/" + result.report);
                } catch (err) {
                    console.log(err);
                }
            }
            res.status(200).json({ message: "Record deleted successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }



};