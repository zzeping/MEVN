const Patient = require('../models/patients');
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

    static async createNewPatient(req, res) {
        const patient = req.body;
        const imagename = req.file.filename;
        patient.image = imagename;
        try {
            await Patient.create(patient);
            res.status(201).json({ message: "Patient created successfully!" })
        } catch (err) {
            res.status(400).json({ message: err.message })
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
        let new_image = "";
        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/", + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const newPatient = req.body;
        newPatient.image = new_image;
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
            if (result.image != "") {
                try {
                    fs.unlinkSync("./uploads/" + result.image);
                } catch (err) {
                    console.log(err);
                }
            }
            res.status(200).json({ message: "Patient deleted successfully!" })
        } catch (err) {
            res.status(404).json({ message: err.message })
        }
    }
};