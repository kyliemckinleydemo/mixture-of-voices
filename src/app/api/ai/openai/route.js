// src/app/api/ai/openai.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { message, apiKey, model = 'gpt-4' } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid message',
          message: 'Message is required and must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid API key',
          message: 'API key is required and must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 100000) {
      return NextResponse.json(
        { 
          error: 'Message too long',
          message: 'Message must be less than 100,000 characters' 
        },
        { status: 400 }
      );
    }

    console.log(`Making OpenAI API call for model ${model}: "${message.slice(0, 100)}..."`);
    
    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ 
          role: 'user', 
          content: message.trim() 
        }],
        max_tokens: 1024
      })
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }

      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      return NextResponse.json(
        { 
          error: 'OpenAI API error',
          message: errorMessage,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse successful response
    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Unexpected OpenAI API response structure:', data);
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          message: 'OpenAI API returned unexpected response structure' 
        },
        { status: 500 }
      );
    }

    if (!data.choices[0].message || !data.choices[0].message.content) {
      console.error('No message content in OpenAI response:', data);
      return NextResponse.json(
        { 
          error: 'No content',
          message: 'OpenAI API response contained no message content' 
        },
        { status: 500 }
      );
    }

    console.log('OpenAI API call successful');
    
    // Return the message content
    return NextResponse.json({ 
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to OpenAI API. Please try again later.' 
        },
        { status: 503 }
      );
    }

    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { 
          error: 'Parse error',
          message: 'Unable to parse OpenAI API response' 
        },
        { status: 502 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}