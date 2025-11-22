const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { 
        title: 'MidAI - Asisten AI Basa Sunda'
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Kedah aya patarosan' });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `Anjeun mangrupakeun asistén AI anu ngagunakeun basa Sunda. 
                        Wajib ngabales dina basa Sunda wae, sanajan anu nanya maké basa Indonésia atawa basa séjén.
                        Gunakeun basa Sunda anu hampang jeung sopan.
                        Upami teu nyaho jawabanana, ngomongkeun wae 'Hapunten, abdi teu acan terang ngeunaan ieu.'
                        Ulah ngomongkeun yén anjeun AI atawa robot.
                        Mangga ngabales kalayan basa Sunda anu rileks jeung ramah.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            })
        });

        if (!groqResponse.ok) {
            throw new Error(`Eror API Groq: ${groqResponse.status}`);
        }

        const data = await groqResponse.json();
        
        res.json({ 
            success: true, 
            response: data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Aya gangguan dina server: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server MidAI ngajalankeun di http://localhost:${PORT}`);

});

