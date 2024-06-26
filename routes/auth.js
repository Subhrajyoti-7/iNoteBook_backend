const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret";
const fetchuser = require('../middleware/fetchuser');

//Router-1, Create a user using post "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password must be at least 6 characters').isLength({ min: 6 })

], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, errors: [{ msg: 'User already exists' }] });
        } else {
            success = true;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        const data = {
            user: {
                id: user.id
            }
        }
        // const JWT_SECRET = process.env.JWT_SECRET;
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authToken });
    } catch (err) {
        console.error(err);
        res.status(500).send(success, "Internal Server Error");
    }
});

//Router-2, Authenticate a user using post "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password can not be empty').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body; //De-structuring
    try {
        let user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ success, errors: "Please enter valid credentials." });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, errors: "Please enter valid credentials." });
        } else {
            success = true;
        }

        const data = {
            user: user.id
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.send({ success, authToken });

    } catch (err) {
        console.error(err);
        res.status(500).send(success, "Internal Server Error");
    }

});

//Router-3, Get user details using post "/api/auth/user" Login required
router.post('/getuser', fetchuser, async (req, res) => {
    let success = false;
    try {
        const userId = req.user;
        const user = await User.findById(userId).select("-password");
        res.json({ success, user });
    } catch (error) {
        console.error(error);
        res.status(500).send(success, "Internal Server Error");
    }
});

module.exports = router;