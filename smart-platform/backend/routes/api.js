const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.get('/school-data', deviceController.getSchoolData);

module.exports = router;
