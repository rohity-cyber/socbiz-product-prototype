export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { messages, system, max_tokens } = req.body;

    // Combine system prompt into messages for Groq
    const groqMessages = [];
    if (system) {
      groqMessages.push({ role: 'system', content: system });
    }
    groqMessages.push(...messages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 1000,
        messages: groqMessages,
      }),
    });

    const data = await response.json();

    // Convert Groq format back to Anthropic format
    const converted = {
      content: [{ type: 'text', text: data.choices?.[0]?.message?.content || '' }]
    };

    res.status(200).json(converted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}