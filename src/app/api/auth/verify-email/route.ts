import { NextRequest, NextResponse } from 'next/server';

// Backend API URL from environment variable or hardcoded for development
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Get the code from the query parameters
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Verification code is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to your backend API
    const response = await fetch(`${API_URL}/api/auth/verify-email?code=${code}`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Email verification proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
