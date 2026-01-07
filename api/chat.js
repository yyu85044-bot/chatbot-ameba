export default async function handler(req, res) {
    // CORSヘッダーを追加
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'メッセージが必要です' });
    }

    const DIFY_API_KEY = process.env.DIFY_API_KEY;
    
    if (!DIFY_API_KEY) {
        console.error('DIFY_API_KEY is not set');
        return res.status(500).json({ error: 'API設定エラー' });
    }

    try {
        console.log('Calling Dify API...');
        
        const response = await fetch('https://api.dify.ai/v1/chat-messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {},
                query: message,
                response_mode: 'blocking',
                user: 'user-' + Date.now(),
                conversation_id: ''
            })
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            console.error('Dify API error:', data);
            return res.status(response.status).json({
                error: data.message || 'Dify API error'
            });
        }

        return res.status(200).json({
            reply: data.answer || 'エラーが発生しました'
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'サーバーエラー: ' + error.message
        });
    }
}
