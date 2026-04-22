const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.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;

// Selected Models
const MODELS = [
  "openai/gpt-3.5-turbo",
  "meta-llama/llama-3-8b-instruct",
  "mistralai/mistral-7b-instruct"
];
app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: OPENROUTER_API_KEY is missing' });
  }

  try {
    const promises = MODELS.map(async (model) => {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [{ role: 'user', content: prompt }]
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173', // Vite default port
              'X-Title': 'CouncilBench'
            }
          }
        );
        return {
          model,
          response: response.data.choices[0].message.content,
          success: true
        };
      } catch (err) {
        console.error(`Error with model ${model}:`, err.message);
        return {
          model,
          error: err.response?.data?.error?.message || err.message,
          success: false
        };
      }
    });

    const results = await Promise.all(promises);
    res.json({ results });
  } catch (error) {
    console.error('Unified API Error:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
