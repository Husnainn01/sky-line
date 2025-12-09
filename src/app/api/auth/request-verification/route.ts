import { NextRequest, NextResponse } from 'next/server';

// Backend API URL from environment variable or hardcoded for development
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to your backend API
    const response = await fetch(`${API_URL}/api/auth/request-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Verification request proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to request verification' },
      { status: 500 }
    );
  }
}
