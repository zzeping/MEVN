const express = require('express');
const router = express.Router();
const API = require('../controllers/api');
const multer = require('multer');

// multer middleware
let pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        file.originalname = file.originalname.slice(0, -4);
        cb(null, file.originalname + "-" + uniqueSuffix + '.pdf');
    },
});

let pdfUpload = multer({
    storage: pdfStorage,
}).single("report");


router.get('/', API.fetchAllRecords);
router.get('/:id', API.fetchRecordByID);
router.post('/', pdfUpload, API.createNewRecord);
router.delete('/:id', API.deleteRecord);




module.exports = router;
