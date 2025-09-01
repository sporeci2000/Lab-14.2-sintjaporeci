const router = require('express').Router();
const { Note } = require('../../models');
const { authMiddleware } = require('../../utils/auth');
const mongoose = require('mongoose');

// Apply authMiddleware to all routes in this file
router.use(authMiddleware);

// helper to validate ObjectId early
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/notes - Get all notes for the logged-in user
// THIS IS THE ROUTE THAT CURRENTLY HAS THE FLAW
router.get('/', async (req, res) => {
    // This currently finds all notes in the database.
    // It should only find notes owned by the logged in user.
    try {
        const notes = await Note.find({ author: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
    try {
        const note = await Note.create({
            title: req.body.title,
            content: req.body.conten,
            author: req.user._id,
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
        const note = await Note.findByIdAndUpdate(
            { _id: id, author: req.user._id },
            { title: req.body.title, content: req.body.content },
            { new: true, runValidators: true }
        )

        if (!note) {
            return res.status(404).json({ message: 'No note found with this id!' });
        }
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
        // This needs an authorization check
        const deleted = await Note.findOneAndDelete({ _id: id, owner: req.user._id }); // <-- enforce ownership
        if (!deleted) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;