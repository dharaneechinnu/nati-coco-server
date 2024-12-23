const express = require('express');
const { findNearestStore, addStore } = require('../Controller/StoreController');

const router = express.Router();

// Route to find the nearest store
router.get('/nearest', findNearestStore);
router.post('/add', addStore);

module.exports = router;