const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    obj = {
        title: 'Computer Science',
        description: 'Computer'
    }
    res.json(obj);
})

module.exports = router;