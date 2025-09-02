const router = require('express').Router();
const Note = require('../../models/Note');
const { authMiddleware } = require('../../utils/auth');
const mongoose = require('mongoose');

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/notes - Get all notes for the logged-in user
// THIS IS THE ROUTE THAT CURRENTLY HAS THE FLAW
router.get('/', async (req, res) => {
    // This currently finds all notes in the database.
    // It should only find notes owned by the logged in user.
    try {
        const notes = await Note.find({ user: req.user._id });
        res.json(notes);
    } catch (err) {
        res.status(500).json(err);
    }
});


//Get a note
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid note id' });

    try {
        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User not authorized ' });
        }
        res.json(note);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
    try {
        const note = await Note.create({
            title: req.body.title,
            content: req.body.content,
            user: req.user._id,
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(400).json(err);
    }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid note id' });

    try {
        // This needs an authorization check
        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User not authorized to update this note' });
        }

        note.title = req.body.title;
        note.content = req.body.content;
        await note.save();
        res.json(note);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid note id' });

    try {
        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'User not authorized ' });
        }

        await note.deleteOne();
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;