import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:50495',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/jokesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define Joke schema
const jokeSchema = new mongoose.Schema({
    jokeId: String,
    question: String,
    answer: String,
    votes: [{ label: String, value: Number }],
    availableVotes: [String]
});

const Joke = mongoose.model('Joke', jokeSchema);

// Fetch joke with votes
app.get('/api/joke', async (req, res) => {
    try {
        // Fetch a random joke from the TeeHee API
        const response = await axios.get('https://teehee.dev/api/joke');
        const { id, question, answer } = response.data;

        // Check if the joke is already in MongoDB
        let joke = await Joke.findOne({ jokeId: id });

        // If the joke doesn't exist or has incomplete emoji data, initialize it
        if (!joke || !joke.availableVotes || joke.availableVotes.length === 0) {
            joke = new Joke({
                jokeId: id,
                question,
                answer,
                votes: [
                    { label: '\u{1F602}', value: 0 },
                    { label: '\u{1F44D}', value: 0 },
                    { label: '\u2764', value: 0 }
                ],
                availableVotes: ['\u{1F602}', '\u{1F44D}', '\u2764']
            });
            await joke.save();
        }

        res.json(joke);
    } catch (error) {
        console.error('Failed to fetch joke:', error);
        res.status(500).json({ error: 'Failed to fetch joke' });
    }
});


// Handle voting
app.post('/api/joke/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { emoji } = req.body;

    try {
        const joke = await Joke.findOne({ jokeId: id });
        if (!joke) {
            return res.status(404).json({ error: 'Joke not found' });
        }

        // Find the emoji in the votes array
        const vote = joke.votes.find((v) => v.label === emoji);
        if (vote) {
            vote.value += 1;
        } else {
            joke.votes.push({ label: emoji, value: 1 });
        }

        await joke.save();
        res.json(joke);
    } catch (error) {
        console.error('Failed to submit vote:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
