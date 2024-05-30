const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Router-1: Get all the notes using GET "api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user });
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
})

//Router-2: Add a new note using POST "api/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {
        //If there are errors, return bad response and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, tag } = req.body;
        const note = new Notes({ title, description, tag, user: req.user });
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
})

//Router-3: Update an existing note using PUT "api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        //Create a new note
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send({ message: 'Not Found' }); }
        if (note.user.toString() !== req.user) { return res.status(404).send({ message: 'Not allowed' }); }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

//Router-4: Delete an existing note using DELETE "api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send({ message: 'Not Found' }); }
        if (note.user.toString() !== req.user) { return res.status(404).send({ message: 'Not allowed' }); }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "success": "Note has been deleted", note: note });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;