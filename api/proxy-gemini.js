// Importa o 'node-fetch' para fazer requisições
const fetch = require('node-fetch');

// Esta é a função principal que a Vercel irá executar
module.exports = async (req, res) => {
    // Pega o prompt enviado pelo frontend
    const { prompt } = req.body;

    // Pega a chave de API de forma segura das Variáveis de Ambiente da Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave de API não encontrada no servidor.' });
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

        const geminiResponse = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Erro na API do Gemini:', errorBody);
            throw new Error(`Erro na API do Gemini: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const text = data.candidates[0].content.parts[0].text;

        // Permite que seu frontend acesse esta API (CORS)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Retorna a resposta para o frontend
        res.status(200).json({ text: text });

    } catch (error) {
        console.error('Erro no proxy do backend:', error);
        res.status(500).json({ error: 'Falha ao processar a requisição no servidor.' });
    }
};