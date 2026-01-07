export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'メッセージが必要です' });
    }

    try {
        const response = await fetch('https://api.dify.ai/v1/chat-messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {},
                query: message,
                response_mode: 'blocking',
                user: 'user-' + Date.now()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Dify API error');
        }

        return res.status(200).json({
            reply: data.answer || 'エラーが発生しました'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'サーバーエラーが発生しました'
        });
    }
}
