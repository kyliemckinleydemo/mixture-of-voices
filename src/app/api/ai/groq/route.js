// src/app/api/ai/groq/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extract data from request body
    const body = await request.json();
    const { message, apiKey, model } = body;

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

    // Choose the best available Llama model
    // Default to latest Llama 4 Scout, fallback to older models if specified
    const modelToUse = model || 'meta-llama/llama-4-scout-17b-16e-instruct';
    
    // Validate model selection
    const supportedModels = [
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'meta-llama/llama-4-maverick-17b-128e-instruct', 
      'llama-3.1-405b-reasoning',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3-groq-70b-tool-use',
      'llama-3-groq-8b-tool-use'
    ];

    if (!supportedModels.includes(modelToUse)) {
      return NextResponse.json(
        { 
          error: 'Unsupported model',
          message: `Model "${modelToUse}" is not supported. Available models: ${supportedModels.join(', ')}` 
        },
        { status: 400 }
      );
    }

    console.log(`Making Groq API call for ${modelToUse}: "${message.slice(0, 100)}..."`);
    
    // Make request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ 
          role: 'user', 
          content: message.trim() 
        }],
        max_tokens: 2048, // Increased for better responses
        temperature: 0.7,  // Balanced creativity/accuracy
        top_p: 0.95,      // Good diversity
        stream: false
      })
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Groq API error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }

      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: modelToUse
      });

      return NextResponse.json(
        { 
          error: 'Groq API error',
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
      console.error('Unexpected Groq API response structure:', data);
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          message: 'Groq API returned unexpected response structure' 
        },
        { status: 500 }
      );
    }

    if (!data.choices[0].message || !data.choices[0].message.content) {
      console.error('No message content in Groq response:', data);
      return NextResponse.json(
        { 
          error: 'No content',
          message: 'Groq API response contained no message content' 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Groq API call successful for ${modelToUse}`);
    
    // Return the message content with model info
    return NextResponse.json({ 
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
      actualModel: modelToUse
    });

  } catch (error) {
    console.error('Groq API call failed:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to Groq API. Please try again later.' 
        },
        { status: 503 }
      );
    }

    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { 
          error: 'Parse error',
          message: 'Unable to parse Groq API response' 
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
    { 
      error: 'Method not allowed', 
      message: 'This endpoint only accepts POST requests',
      availableModels: [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct', 
        'llama-3.1-405b-reasoning',
        'llama-3.1-70b-versatile',
        'llama-3.1-8b-instant',
        'llama-3-groq-70b-tool-use',
        'llama-3-groq-8b-tool-use'
      ]
    },
    { status: 405 }
  );
}