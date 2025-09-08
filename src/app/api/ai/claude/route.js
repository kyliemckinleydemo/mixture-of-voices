// src/app/api/ai/claude/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { message, apiKey } = body;

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

    // Validate message length (Anthropic has limits)
    if (message.length > 100000) {
      return NextResponse.json(
        { 
          error: 'Message too long',
          message: 'Message must be less than 100,000 characters' 
        },
        { status: 400 }
      );
    }

    console.log(`Making Claude Sonnet 4 API call for message: "${message.slice(0, 100)}..."`);
    
    // Make request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ 
          role: 'user', 
          content: message.trim() 
        }]
      })
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Claude API error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }

      console.error('Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      return NextResponse.json(
        { 
          error: 'Claude API error',
          message: errorMessage,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse successful response
    const data = await response.json();
    
    // Validate response structure
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('Unexpected Claude API response structure:', data);
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          message: 'Claude API returned unexpected response structure' 
        },
        { status: 500 }
      );
    }

    if (!data.content[0].text) {
      console.error('No text content in Claude response:', data);
      return NextResponse.json(
        { 
          error: 'No content',
          message: 'Claude API response contained no text content' 
        },
        { status: 500 }
      );
    }

    console.log('Claude Sonnet 4 API call successful');
    
    // Return the text content
    return NextResponse.json({ 
      content: data.content[0].text,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Claude API call failed:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to Claude API. Please try again later.' 
        },
        { status: 503 }
      );
    }

    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { 
          error: 'Parse error',
          message: 'Unable to parse Claude API response' 
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

// Explicitly handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}