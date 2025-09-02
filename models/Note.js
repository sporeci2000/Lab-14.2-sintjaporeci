const { Schema, model, Types } = require('mongoose');

// This is the model you will be modifying
const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const Note = model('Note', noteSchema);

module.exports = Note;