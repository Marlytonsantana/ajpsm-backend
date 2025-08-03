// Importa as ferramentas necessárias
const fetch = require('node-fetch');
// Adicione o 'cheerio' para ler o conteúdo das páginas
// Seu desenvolvedor precisará rodar `npm install cheerio` no projeto
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    // Cabeçalhos de permissão (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Identifica qual tarefa o frontend está pedindo
    const { task, prompt, url } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        let responseData;

        // TAREFA 1: BUSCAR NOTÍCIAS
        if (task === 'fetch_news') {
            // Aqui entraria a chamada para uma API de notícias real.
            // Como simulação, usamos a IA com um prompt muito específico.
            const newsPrompt = `URGENTE: A data de hoje é ${new Date().toLocaleDateString('pt-BR')}. Busque 3 notícias EM TEMPO REAL (hoje ou ontem) para a região Sul do Maranhão. Forneça um array JSON com 'title', 'content', 'source_domain', 'url' e 'publication_date'. Responda APENAS com o array JSON.`;
            const geminiResponse = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: newsPrompt }] }] }),
            });
            const data = await geminiResponse.json();
            responseData = data.candidates[0].content.parts[0].text;
        } 
        
        // TAREFA 2: EXTRAIR CONTEÚDO DE URL
        else if (task === 'extract_from_url') {
            const pageResponse = await fetch(url);
            const html = await pageResponse.text();
            const $ = cheerio.load(html);
            const title = $('h1').first().text();
            const content = $('article p').text(); // Tenta pegar parágrafos dentro de um <article>
            responseData = JSON.stringify({ title, content });
        } 
        
        // TAREFA 3: USAR A IA (ANÁLISE, GERAÇÃO)
        else {
            const geminiResponse = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });
            const data = await geminiResponse.json();
            responseData = data.candidates[0].content.parts[0].text;
        }

        res.status(200).json({ text: responseData });

    } catch (error) {
        console.error('Erro no backend:', error);
        res.status(500).json({ error: 'Falha ao processar a requisição no servidor.' });
    }
};
