// app/api/ai/route.js
export async function POST(request) {
  try {
    const { engine, message, apiKey } = await request.json();

    let apiResponse;

    switch (engine) {
      case 'claude':
        apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [
              {
                role: 'user',
                content: message
              }
            ]
          })
        });
        break;

      case 'chatgpt':
        apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 4000
          })
        });
        break;

      case 'grok':
        apiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'grok-4',
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 4000
          })
        });
        break;

      case 'deepseek':
        apiResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 4000
          })
        });
        break;

      case 'llama':
        apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 4000
          })
        });
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown engine: ${engine}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return new Response(JSON.stringify({ 
        error: `${engine} API Error: ${apiResponse.status} - ${errorData.error?.message || errorData.message || apiResponse.statusText}` 
      }), {
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await apiResponse.json();
    
    // Extract response text based on API format
    let responseText;
    if (engine === 'claude') {
      responseText = data.content[0].text;
    } else {
      responseText = data.choices[0].message.content;
    }

    return new Response(JSON.stringify({ response: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API route error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}