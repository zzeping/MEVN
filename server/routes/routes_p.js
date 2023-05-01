const express = require('express');
const router = express.Router();
const API = require('../controllers/api');
const multer = require('multer');

// multer middleware
let imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

// let dataStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./uploads");
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
//     },
// });

let imageUpload = multer({
    storage: imageStorage,
}).single("image");

const upload = multer()
// let dataUpload = multer({
//     storage: dataStorage,
// }).single("data");

router.get('/', API.fetchAllPatients);
router.get('/:id', API.fetchPatientByID);
router.post('/', upload.none(), API.createNewPatient);
router.patch('/:id', upload.none(), API.updatePatient);
router.patch('/:id/record', upload.none(), API.updatePatientRecord);
router.patch('/:id/record_r', upload.none(), API.removePatientRecord);
router.delete('/:id', API.deletePatient);

// router.post('/dataUpload',dataUpload, API.uploadData);





module.exports = router;
