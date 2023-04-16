const express = require('express');
const router = express.Router();
const API = require('../controllers/api');
const multer = require('multer');

// multer middleware
// let pdfStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./uploads");
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.buffer + "_" + Date.now() + "_" );
//     },
// });

// let pdfUpload = multer({
//     storage: pdfStorage,
// }).single("report");

const upload = multer()


router.get('/', API.fetchAllRecords);
router.get('/:id', API.fetchRecordByID);
router.post('/', upload.none(), API.createNewRecord);
router.delete('/:id', API.deleteRecord);




module.exports = router;
