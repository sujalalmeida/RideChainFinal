import { Location } from "./types";

// Get the API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface RouteEstimate {
  distance: string;
  duration: string;
  carbonFootprint: number;
  trafficLevel: "low" | "medium" | "high";
  suggestedDepartureTime?: string;
}

export interface WeatherInsight {
  condition: string;
  temperature: string;
  precipitation: string;
  recommendation: string;
}

export interface RouteInsights {
  landmarks: string[];
  trafficAlerts: string[];
  weatherImpact: string;
  alternativeRoute?: {
    description: string;
    timeDifference: string;
    distanceDifference: string;
  };
}

export interface RideSuggestion {
  type: string;
  reason: string;
  benefitDescription: string;
}

export interface RideEfficiencyAnalysis {
  efficiencyScore: number;
  timeEfficiency: string;
  costEfficiency: string;
  sustainabilityScore: number;
  recommendations: string[];
}

export interface SmartTravelTip {
  category: "time" | "cost" | "comfort" | "sustainability";
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

// Get mock route estimate based on coordinates
function getMockRouteEstimate(pickup: Location, destination: Location): RouteEstimate {
  // Calculate actual distance using Haversine formula
  const distanceKm = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
  const distanceMiles = distanceKm * 0.621371;
  
  // Format distance string
  const distance = `${distanceMiles.toFixed(1)} miles (${distanceKm.toFixed(1)} km)`;
  
  // Calculate mock duration (assuming average speed of 45 km/h)
  const durationMinutes = Math.round((distanceKm / 45) * 60);
  
  let duration: string;
  if (durationMinutes >= 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    duration = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    duration = `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
  }
  
  // Calculate carbon footprint (0.4kg per mile is a common estimate)
  const carbonFootprint = distanceMiles * 0.4;
  
  // Determine traffic level based on time of day
  const hour = new Date().getHours();
  let trafficLevel: "low" | "medium" | "high" = "medium";
  
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    trafficLevel = "high";
  } else if (hour >= 22 || hour <= 5) {
    trafficLevel = "low";
  }
  
  return {
    distance,
    duration,
    carbonFootprint,
    trafficLevel
  };
}

/**
 * Uses Gemini to search Google for accurate distance and time between locations
 */
export async function estimateRoute(pickup: Location, destination: Location): Promise<RouteEstimate> {
  try {
    // Validate inputs
    if (!pickup || !pickup.lat || !pickup.lng || !destination || !destination.lat || !destination.lng) {
      console.error("Invalid pickup or destination coordinates");
      throw new Error("Invalid location coordinates");
    }

    // Log API key availability (without exposing the key itself)
    if (!API_KEY) {
      console.warn("No Gemini API key found, using mock data");
      throw new Error("Gemini API key is required. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment");
    } else {
      console.log("Gemini API key is available");
    }

    // Prepare pickup and destination strings
    const pickupString = pickup.address || `${pickup.lat},${pickup.lng}`;
    const destinationString = destination.address || `${destination.lat},${destination.lng}`;

    console.log("Submitting route calculation to Gemini API:", {
      from: pickupString,
      to: destinationString
    });

    // Prepare prompt for Gemini to search Google
    const prompt = `
      You are a helpful assistant that provides accurate travel information.
      
      I need you to search Google for the accurate driving distance and time between these two locations:
      - From: ${pickupString}
      - To: ${destinationString}
      
      Please provide:
      1. The exact driving distance in miles and kilometers (be precise to 0.1 precision)
      2. The current estimated travel time considering traffic conditions
      3. Based on the estimated time, assess the traffic level as "low", "medium", or "high"
      4. Estimate the carbon footprint in kg of CO2 for this journey (use 0.4kg CO2 per mile as a baseline)
      
      Format your response EXACTLY as a JSON object with these fields:
      {
        "distance": "X.X miles (Y.Y kilometers)",
        "duration": "X minutes" or "X hours Y minutes",
        "carbonFootprint": X.X,
        "trafficLevel": "low|medium|high"
      }
      
      Return ONLY the JSON object and nothing else. Be absolutely certain the JSON is valid and properly formatted.
    `;

    // Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more factual responses
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw Gemini API response:", data);
    
    // Check if we have valid data
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response structure from Gemini API:", data);
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    console.log("Gemini API response text:", text);
    
    try {
      // Try to parse the JSON response from Gemini
      const parsedResponse = JSON.parse(text);
      console.log("Parsed Gemini response:", parsedResponse);
      
      // Validate response
      if (!parsedResponse.distance || !parsedResponse.duration || 
          !parsedResponse.carbonFootprint || !parsedResponse.trafficLevel) {
        console.error("Missing fields in Gemini response:", parsedResponse);
        throw new Error("Missing fields in Gemini response");
      }
      
      // Return the parsed response
      return {
        distance: parsedResponse.distance,
        duration: parsedResponse.duration,
        carbonFootprint: parsedResponse.carbonFootprint,
        trafficLevel: parsedResponse.trafficLevel as "low" | "medium" | "high"
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "text:", text);
      throw new Error("Failed to parse Gemini response");
    }
  } catch (error) {
    console.error("Error estimating route with Gemini:", error);
    throw error;
  }
}

/**
 * Uses Gemini to get personalized ride type suggestions based on route, weather, and user preferences
 */
export async function getPersonalizedRideSuggestions(
  pickup: Location, 
  destination: Location, 
  routeInfo: RouteEstimate, 
  userPreferences?: {
    ecoFriendly?: boolean,
    costSensitive?: boolean,
    comfortPreferred?: boolean
  }
): Promise<RideSuggestion[]> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning default ride suggestions");
      return [
        {
          type: "green",
          reason: "Eco-friendly option for your journey",
          benefitDescription: "Reduces your carbon footprint by up to 40%"
        },
        {
          type: "standard",
          reason: "Balanced choice with good value",
          benefitDescription: "Our most popular option with quick pickup times"
        }
      ];
    }

    const pickupString = pickup.address || `${pickup.lat},${pickup.lng}`;
    const destinationString = destination.address || `${destination.lat},${destination.lng}`;
    
    const preferences = {
      ecoFriendly: userPreferences?.ecoFriendly || false,
      costSensitive: userPreferences?.costSensitive || false,
      comfortPreferred: userPreferences?.comfortPreferred || false
    };

    const prompt = `
      You are a helpful transportation assistant that provides personalized ride suggestions.
      
      Consider a journey from "${pickupString}" to "${destinationString}" with these details:
      - Distance: ${routeInfo.distance}
      - Estimated travel time: ${routeInfo.duration}
      - Current traffic level: ${routeInfo.trafficLevel}
      
      User preferences:
      - Eco-friendly: ${preferences.ecoFriendly ? 'Yes' : 'No'}
      - Cost-sensitive: ${preferences.costSensitive ? 'Yes' : 'No'}
      - Comfort preference: ${preferences.comfortPreferred ? 'Yes' : 'No'}
      
      Give me 3 ride type suggestions in this exact JSON format:
      [
        {
          "type": "standard|premium|green|carpool",
          "reason": "Brief explanation for why this ride type is suggested",
          "benefitDescription": "One key benefit of this option"
        }
      ]
      
      Return ONLY the JSON array and nothing else. Do not include any markdown formatting, code blocks, or extra text.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log("Ride suggestions raw response:", text);
    
    try {
      // Try to handle markdown code blocks or extra formatting that might be in the response
      let cleanedText = text;
      // Remove markdown code block markers if present
      if (text.includes("```")) {
        cleanedText = text.replace(/```(?:json)?\n|\n```/g, "");
      }
      // Attempt to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "text:", text);
      throw new Error("Failed to parse Gemini API response");
    }
  } catch (error) {
    console.error("Error getting personalized ride suggestions:", error);
    // Return fallback suggestions as last resort
    return [
      {
        type: "green",
        reason: "Eco-friendly option for your journey",
        benefitDescription: "Reduces your carbon footprint by up to 40%"
      },
      {
        type: "standard",
        reason: "Balanced choice with good value",
        benefitDescription: "Our most popular option with quick pickup times"
      }
    ];
  }
}

/**
 * Uses Gemini to get weather insights for the route
 */
export async function getWeatherInsights(pickup: Location, destination: Location): Promise<WeatherInsight> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning default weather insights");
      return {
        condition: "Partly cloudy",
        temperature: "72°F (22°C)",
        precipitation: "10% chance of rain",
        recommendation: "Weather looks good for your trip. No special preparations needed."
      };
    }

    const pickupString = pickup.address || `${pickup.lat},${pickup.lng}`;
    const destinationString = destination.address || `${destination.lat},${destination.lng}`;

    const prompt = `
      You are a helpful assistant that provides accurate weather information.
      
      I need you to search for the current weather conditions for a journey from "${pickupString}" to "${destinationString}".
      
      Please provide:
      1. The current weather condition at both locations (sunny, cloudy, rainy, etc.)
      2. The current temperature in both Fahrenheit and Celsius
      3. Precipitation chance if any
      4. A brief recommendation for the traveler based on weather conditions
      
      Format your response EXACTLY as a JSON object with these fields:
      {
        "condition": "Brief weather condition description",
        "temperature": "Temperature in both F and C",
        "precipitation": "Precipitation chance if any",
        "recommendation": "Brief recommendation based on weather"
      }
      
      Return ONLY the JSON object and nothing else. Do not include any markdown formatting, code blocks, or extra text.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log("Weather API raw response:", text);
    
    try {
      // Try to handle markdown code blocks or extra formatting that might be in the response
      let cleanedText = text;
      // Remove markdown code block markers if present
      if (text.includes("```")) {
        cleanedText = text.replace(/```(?:json)?\n|\n```/g, "");
      }
      // Attempt to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/({[\s\S]*})/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "text:", text);
      throw new Error("Failed to parse Gemini API response");
    }
  } catch (error) {
    console.error("Error getting weather insights:", error);
    // Return fallback weather insights only if all else fails
    return {
      condition: "Partly cloudy",
      temperature: "72°F (22°C)",
      precipitation: "10% chance of rain",
      recommendation: "Weather looks good for your trip. No special preparations needed."
    };
  }
}

/**
 * Uses Gemini to get detailed route insights
 */
export async function getRouteInsights(pickup: Location, destination: Location): Promise<RouteInsights> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning default route insights");
      return {
        landmarks: ["Central Park", "Empire State Building"],
        trafficAlerts: ["Construction on Main Street"],
        weatherImpact: "Clear conditions with no impact on travel time",
        alternativeRoute: {
          description: "Take Highway 101 instead of I-95",
          timeDifference: "+5 minutes",
          distanceDifference: "-0.8 miles"
        }
      };
    }

    const pickupString = pickup.address || `${pickup.lat},${pickup.lng}`;
    const destinationString = destination.address || `${destination.lat},${destination.lng}`;

    const prompt = `
      You are a helpful assistant that provides detailed route information.
      
      I need insights about a journey from "${pickupString}" to "${destinationString}".
      
      Please provide:
      1. Notable landmarks along this route (list 2-3)
      2. Any current traffic alerts or road conditions to be aware of (list 1-2)
      3. How current weather might impact the journey
      4. A possible alternative route with estimated time/distance difference
      
      Format your response EXACTLY as a JSON object with these fields:
      {
        "landmarks": ["Landmark 1", "Landmark 2", ...],
        "trafficAlerts": ["Alert 1", "Alert 2", ...],
        "weatherImpact": "Brief description of weather impact",
        "alternativeRoute": {
          "description": "Brief description of alternative route",
          "timeDifference": "+X minutes" or "-X minutes",
          "distanceDifference": "+X.X miles" or "-X.X miles"
        }
      }
      
      Return ONLY the JSON object and nothing else. Do not include any markdown formatting, code blocks, or extra text.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log("Route insights raw response:", text);
    
    try {
      // Try to handle markdown code blocks or extra formatting that might be in the response
      let cleanedText = text;
      // Remove markdown code block markers if present
      if (text.includes("```")) {
        cleanedText = text.replace(/```(?:json)?\n|\n```/g, "");
      }
      // Attempt to extract JSON if there's extra text
      const jsonMatch = cleanedText.match(/({[\s\S]*})/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, "text:", text);
      throw new Error("Failed to parse Gemini API response");
    }
  } catch (error) {
    console.error("Error getting route insights:", error);
    // Return fallback route insights as last resort
    return {
      landmarks: ["City Center", "Main Bridge"],
      trafficAlerts: ["Normal traffic conditions"],
      weatherImpact: "Good weather conditions for travel",
      alternativeRoute: {
        description: "Alternative route via secondary roads",
        timeDifference: "+10 minutes",
        distanceDifference: "-1.2 miles"
      }
    };
  }
}

// Mock locations for different cities
const mockLocations: Record<string, Location[]> = {
  "mumbai": [
    { name: "Andheri", address: "Andheri, Mumbai, Maharashtra, India", lat: 19.1136, lng: 72.8697 },
    { name: "Bandra", address: "Bandra, Mumbai, Maharashtra, India", lat: 19.0596, lng: 72.8295 },
    { name: "Colaba", address: "Colaba, Mumbai, Maharashtra, India", lat: 18.9067, lng: 72.8147 },
    { name: "Dadar", address: "Dadar, Mumbai, Maharashtra, India", lat: 19.0178, lng: 72.8478 },
    { name: "Juhu", address: "Juhu, Mumbai, Maharashtra, India", lat: 19.1075, lng: 72.8263 }
  ],
  "delhi": [
    { name: "Connaught Place", address: "Connaught Place, New Delhi, Delhi, India", lat: 28.6329, lng: 77.2196 },
    { name: "India Gate", address: "India Gate, New Delhi, Delhi, India", lat: 28.6129, lng: 77.2295 },
    { name: "Chandni Chowk", address: "Chandni Chowk, Old Delhi, Delhi, India", lat: 28.6505, lng: 77.2303 },
    { name: "Hauz Khas", address: "Hauz Khas, New Delhi, Delhi, India", lat: 28.5494, lng: 77.2001 },
    { name: "Saket", address: "Saket, New Delhi, Delhi, India", lat: 28.5203, lng: 77.2159 }
  ],
  "bangalore": [
    { name: "Koramangala", address: "Koramangala, Bengaluru, Karnataka, India", lat: 12.9279, lng: 77.6271 },
    { name: "Indiranagar", address: "Indiranagar, Bengaluru, Karnataka, India", lat: 12.9784, lng: 77.6408 },
    { name: "MG Road", address: "MG Road, Bengaluru, Karnataka, India", lat: 12.9715, lng: 77.6108 },
    { name: "Whitefield", address: "Whitefield, Bengaluru, Karnataka, India", lat: 12.9698, lng: 77.7499 },
    { name: "Electronic City", address: "Electronic City, Bengaluru, Karnataka, India", lat: 12.8399, lng: 77.6770 }
  ],
  "home": [
    { name: "Home", address: "Home", lat: 19.1136, lng: 72.8697 }
  ],
  "work": [
    { name: "Work", address: "Work", lat: 19.0596, lng: 72.8295 }
  ]
};

/**
 * Uses Gemini to provide location suggestions based on user input
 */
export async function getLocationSuggestions(query: string): Promise<Location[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Search for the query in our mock locations first
    const queryLower = query.toLowerCase();
    
    for (const key in mockLocations) {
      if (key.includes(queryLower)) {
        return mockLocations[key];
      }
    }
    
    // For cities in mock data, return those locations
    for (const key in mockLocations) {
      const locations = mockLocations[key];
      for (const location of locations) {
        if ((location.name?.toLowerCase().includes(queryLower)) || 
            (location.address?.toLowerCase().includes(queryLower))) {
          return mockLocations[key];
        }
      }
    }
    
    // If no matches in our mock data and no API key, generate a single mock location
    if (!API_KEY) {
      console.warn("No Gemini API key found, using mock location data");
      return [
        {
          name: query,
          address: `${query}, Some City, Some Country`,
          lat: 19.0 + Math.random() * 2,
          lng: 72.0 + Math.random() * 2,
        }
      ];
    }

    // Prepare prompt for Gemini
    const prompt = `
      You are a helpful assistant that provides location suggestions.
      
      I am typing a location search: "${query}"
      
      Please suggest 5 specific locations that match my query. These should be real places that someone might want to travel to.
      
      Format your response EXACTLY as a JSON array with objects containing these fields:
      [
        {
          "address": "Full address with city, state/country",
          "name": "Brief location name",
          "lat": latitude_as_number,
          "lng": longitude_as_number
        }
      ]
      
      Return ONLY the JSON array and nothing else. Be absolutely certain the JSON is valid and properly formatted.
      Ensure the latitude and longitude values are accurate for each location.
    `;

    // Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return [
        {
          name: query,
          address: `${query}, Some City, Some Country`,
          lat: 19.0 + Math.random() * 2,
          lng: 72.0 + Math.random() * 2,
        }
      ];
    }

    const data = await response.json();
    
    // Check if we have valid data
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini API response structure:", data);
      return [
        {
          name: query,
          address: `${query}, Some City, Some Country`,
          lat: 19.0 + Math.random() * 2,
          lng: 72.0 + Math.random() * 2,
        }
      ];
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      // Try to parse the JSON response from Gemini
      const suggestions = JSON.parse(text);
      
      if (!Array.isArray(suggestions)) {
        console.error("Expected array of suggestions but got:", suggestions);
        return [
          {
            name: query,
            address: `${query}, Some City, Some Country`,
            lat: 19.0 + Math.random() * 2,
            lng: 72.0 + Math.random() * 2,
          }
        ];
      }
      
      return suggestions.map((suggestion: any) => ({
        lat: suggestion.lat,
        lng: suggestion.lng,
        address: suggestion.address,
        name: suggestion.name
      }));
    } catch (parseError) {
      console.error("Failed to parse Gemini location suggestions:", parseError);
      return [
        {
          name: query,
          address: `${query}, Some City, Some Country`,
          lat: 19.0 + Math.random() * 2,
          lng: 72.0 + Math.random() * 2,
        }
      ];
    }
  } catch (error) {
    console.error("Error getting location suggestions with Gemini:", error);
    return [
      {
        name: query,
        address: `${query}, Some City, Some Country`,
        lat: 19.0 + Math.random() * 2,
        lng: 72.0 + Math.random() * 2,
      }
    ];
  }
}

/**
 * Analyzes ride efficiency using Gemini AI
 */
export async function getRideEfficiencyAnalysis(
  pickup: Location,
  destination: Location,
  rideType: string,
  fareAmount: number
): Promise<RideEfficiencyAnalysis> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, using mock data for ride efficiency analysis");
      return getMockRideEfficiencyAnalysis(rideType);
    }

    const pickupString = pickup.address || `${pickup.lat},${pickup.lng}`;
    const destinationString = destination.address || `${destination.lat},${destination.lng}`;
    const distanceKm = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);

    const prompt = `
      You are a helpful ride analysis assistant that provides insights about ride efficiency.
      
      Analyze this ride information:
      - From: ${pickupString}
      - To: ${destinationString}
      - Ride type: ${rideType}
      - Approximate distance: ${distanceKm.toFixed(1)} km
      - Fare amount: $${fareAmount.toFixed(2)}
      
      Please provide a comprehensive efficiency analysis with:
      1. An overall efficiency score (0-100)
      2. Time efficiency analysis
      3. Cost efficiency analysis
      4. Sustainability score (0-100)
      5. 2-3 specific recommendations to improve future rides
      
      Format your response EXACTLY as a JSON object with these fields:
      {
        "efficiencyScore": number,
        "timeEfficiency": "detailed analysis of time efficiency",
        "costEfficiency": "detailed analysis of cost efficiency",
        "sustainabilityScore": number,
        "recommendations": ["recommendation 1", "recommendation 2", ...]
      }
      
      Return ONLY the JSON object and nothing else.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const parsedResponse = JSON.parse(text);
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse Gemini response");
    }
  } catch (error) {
    console.error("Error getting ride efficiency analysis:", error);
    return getMockRideEfficiencyAnalysis(rideType);
  }
}

function getMockRideEfficiencyAnalysis(rideType: string): RideEfficiencyAnalysis {
  // Different mock data based on ride type
  if (rideType === "green") {
    return {
      efficiencyScore: 87,
      timeEfficiency: "This green ride takes only 10% more time than a standard ride while reducing emissions by 40%.",
      costEfficiency: "While slightly more expensive than standard rides, the environmental benefits provide excellent value.",
      sustainabilityScore: 92,
      recommendations: [
        "Continue using green rides for similar distances to maximize environmental benefits.",
        "Consider off-peak travel times to further reduce your carbon footprint.",
        "Try carpooling options for longer journeys to improve both cost and sustainability metrics."
      ]
    };
  } else if (rideType === "premium") {
    return {
      efficiencyScore: 72,
      timeEfficiency: "Premium rides often arrive faster and take more direct routes, saving you approximately 15% in travel time.",
      costEfficiency: "Premium rides cost 40-50% more than standard options but provide additional comfort and amenities.",
      sustainabilityScore: 65,
      recommendations: [
        "Reserve premium rides for special occasions or time-sensitive trips.",
        "Consider standard rides for regular commutes to improve cost efficiency.",
        "When possible, schedule rides in advance to ensure availability without surge pricing."
      ]
    };
  } else if (rideType === "carpool") {
    return {
      efficiencyScore: 90,
      timeEfficiency: "Carpooling adds approximately 5-10 minutes to your journey but significantly reduces costs.",
      costEfficiency: "Carpooling reduces your fare by 30-40% compared to standard rides.",
      sustainabilityScore: 88,
      recommendations: [
        "Plan ahead to accommodate the slightly longer travel time with carpooling.",
        "Use carpooling for regular commutes to maximize cost savings over time.",
        "Consider scheduling carpool rides during off-peak hours for even faster service."
      ]
    };
  } else {
    // Standard ride
    return {
      efficiencyScore: 80,
      timeEfficiency: "Standard rides provide a good balance of timeliness and cost. Your route was efficiently planned.",
      costEfficiency: "Standard rides offer the best value for everyday trips. Your fare was appropriate for the distance.",
      sustainabilityScore: 75,
      recommendations: [
        "Try carpooling for this route to save money on regular trips.",
        "Consider scheduling rides during off-peak hours to reduce wait times.",
        "For environmentally-sensitive areas, opt for green ride options when available."
      ]
    };
  }
}

/**
 * Gets smart travel tips based on ride history and preferences
 */
export async function getSmartTravelTips(
  rideHistory: any[],
  userPreferences: {
    ecoFriendly?: boolean,
    costSensitive?: boolean,
    comfortPreferred?: boolean
  } = {}
): Promise<SmartTravelTip[]> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, using mock data for smart travel tips");
      return getMockSmartTravelTips(userPreferences);
    }

    const prompt = `
      You are a smart travel assistant that provides personalized tips based on ride history and preferences.
      
      User preferences: ${JSON.stringify(userPreferences)}
      
      Recent ride history: ${JSON.stringify(rideHistory)}
      
      Provide 3-5 smart travel tips that are highly personalized, considering:
      1. Time-saving strategies specific to the user's common routes
      2. Cost-saving opportunities 
      3. Comfort enhancements
      4. Sustainability improvements
      
      Each tip should be actionable and specific.
      
      Format your response EXACTLY as a JSON array with these fields for each tip:
      [
        {
          "category": "time" | "cost" | "comfort" | "sustainability",
          "title": "short title",
          "description": "detailed description",
          "actionable": boolean,
          "action": "specific action the user can take (optional)"
        },
        ...
      ]
      
      Return ONLY the JSON array and nothing else.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const parsedResponse = JSON.parse(text);
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse Gemini response");
    }
  } catch (error) {
    console.error("Error getting smart travel tips:", error);
    return getMockSmartTravelTips(userPreferences);
  }
}

function getMockSmartTravelTips(userPreferences: any): SmartTravelTip[] {
  const allTips: SmartTravelTip[] = [
    {
      category: "time",
      title: "Schedule morning rides 15 minutes earlier",
      description: "Based on your morning commute pattern, scheduling rides 15 minutes earlier can reduce wait times by up to 40% and avoid peak traffic.",
      actionable: true,
      action: "Set a reminder to book your morning ride at 8:15 AM instead of 8:30 AM"
    },
    {
      category: "cost",
      title: "Weekly pass for your regular route",
      description: "You take the same route 3-4 times weekly. A weekly pass would save you approximately 22% compared to individual rides.",
      actionable: true,
      action: "Purchase a weekly pass for your common route in the Subscriptions section"
    },
    {
      category: "sustainability",
      title: "Switch to green rides for short trips",
      description: "For trips under 5 miles, switching to green rides would reduce your carbon footprint by 30% with minimal time impact.",
      actionable: true,
      action: "Toggle 'Prefer green rides' in your ride preferences"
    },
    {
      category: "comfort",
      title: "Try premium ride for your Friday evening trips",
      description: "You frequently take longer rides on Friday evenings. Premium rides offer extra comfort with high-rated drivers for these special occasions.",
      actionable: true,
      action: "Select 'Premium' for your next Friday evening ride"
    },
    {
      category: "time",
      title: "Optimize your pickup locations",
      description: "For downtown destinations, setting your pickup at intersection corners rather than building entrances can reduce driver arrival time by 3-4 minutes.",
      actionable: true,
      action: "Adjust your pickup point when in downtown areas"
    }
  ];
  
  // Filter based on user preferences
  let filteredTips = [...allTips];
  
  if (userPreferences.ecoFriendly) {
    // Prioritize sustainability tips
    filteredTips = filteredTips.sort((a, b) => a.category === "sustainability" ? -1 : b.category === "sustainability" ? 1 : 0);
  }
  
  if (userPreferences.costSensitive) {
    // Prioritize cost tips
    filteredTips = filteredTips.sort((a, b) => a.category === "cost" ? -1 : b.category === "cost" ? 1 : 0);
  }
  
  if (userPreferences.comfortPreferred) {
    // Prioritize comfort tips
    filteredTips = filteredTips.sort((a, b) => a.category === "comfort" ? -1 : b.category === "comfort" ? 1 : 0);
  }
  
  // Return top 3-4 tips
  return filteredTips.slice(0, 4);
} 