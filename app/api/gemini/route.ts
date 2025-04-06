import { NextRequest, NextResponse } from "next/server";

// Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { prompt, temperature, maxOutputTokens } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature || 0.2,
          maxOutputTokens: maxOutputTokens || 1000
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json({ error: "Error calling Gemini API" }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to extract safety information from ride data
export function extractSafetyData(rideData: any) {
  return {
    origin: typeof rideData.from === 'string' ? rideData.from : rideData.from.address,
    destination: typeof rideData.to === 'string' ? rideData.to : rideData.to.address,
    time: rideData.date,
    status: rideData.status,
    rideType: rideData.rideType,
    driverId: rideData.driver?.id,
    riderId: rideData.rider?.id
  };
} 