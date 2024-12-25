const express = require('express');
const {  addStore } = require('../Controller/Admin/StoreController');

const router = express.Router();

// Route to find the nearest store

router.post('/add', addStore);

module.exports = router;