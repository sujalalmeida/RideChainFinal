import { Location } from "./types";

// Get the API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface DeviceFingerprint {
  uniqueId: string;
  operatingSystem: string;
  browser: string;
  screenResolution: string;
  timezone: string;
  ipAddress?: string;
  lastLogin?: string;
}

export interface BiometricVerificationResult {
  isVerified: boolean;
  confidenceScore: number;
  verificationMethod: string;
  timestamp: string;
}

export interface TrustScore {
  overall: number;
  locationTrust: number;
  deviceTrust: number;
  behaviorTrust: number;
  timePatternTrust: number;
}

export interface BehavioralPattern {
  typicalTimes: string[];
  commonLocations: string[];
  regularRoutes: {from: string, to: string}[];
  averageRideFrequency: string;
  unusualActivity?: string[];
}

export interface SecurityAlert {
  alertId: string;
  alertType: "unusual_location" | "unusual_device" | "unusual_time" | "unusual_behavior" | "potential_fraud";
  severity: "low" | "medium" | "high";
  message: string;
  suggestedAction: string;
  timestamp: string;
}

export interface LiveRideSafetyAnalysis {
  currentRiskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  routeDeviation: number; // percentage of deviation from expected route
  speedAnalysis: string;
  neighborhoodSafetyRating: number;
  recommendations: string[];
}

/**
 * Analyze a user login for suspicious activity
 */
export async function analyzeLoginSecurity(
  currentLogin: {
    deviceInfo: DeviceFingerprint,
    location: Location,
    timestamp: string,
    loginMethod: string
  },
  userHistory: {
    previousLogins: Array<{
      deviceInfo: DeviceFingerprint,
      location: Location,
      timestamp: string,
      loginMethod: string
    }>,
    commonLocations: Location[]
  }
): Promise<{
  isSuspicious: boolean,
  suspiciousFactors: string[],
  riskScore: number,
  recommendedAction: string
}> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning mock security analysis");
      return {
        isSuspicious: false,
        suspiciousFactors: [],
        riskScore: 10,
        recommendedAction: "No suspicious activity detected"
      };
    }

    const prompt = `
      You are an advanced security system analyzing a user login for suspicious activity.
      
      CURRENT LOGIN:
      ${JSON.stringify(currentLogin, null, 2)}
      
      USER HISTORY:
      ${JSON.stringify(userHistory, null, 2)}
      
      Analyze this login and determine if it's suspicious based on:
      1. Location compared to common locations and previous logins
      2. Device fingerprint compared to previously used devices
      3. Time pattern compared to usual login times
      4. Any unusual combination of factors
      
      Return your analysis in this EXACT JSON format:
      {
        "isSuspicious": boolean,
        "suspiciousFactors": array of strings describing suspicious elements if any,
        "riskScore": number from 0-100 where higher is more risky,
        "recommendedAction": string describing what action should be taken
      }
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return {
        isSuspicious: false,
        suspiciousFactors: [],
        riskScore: 20,  // Slightly higher due to parsing error
        recommendedAction: "Consider reviewing this login as we couldn't fully analyze it"
      };
    }
  } catch (error) {
    console.error("Error in login security analysis:", error);
    return {
      isSuspicious: true,
      suspiciousFactors: ["Security analysis failed"],
      riskScore: 60,  // Higher risk score when analysis fails
      recommendedAction: "Verify this login attempt through alternative means as security analysis failed"
    };
  }
}

/**
 * Generate a user trust score based on behavioral patterns
 */
export async function generateUserTrustScore(
  user: {
    id: string,
    totalRides: number,
    createdAt: string,
    recentLogins: Array<{
      timestamp: string,
      deviceInfo: DeviceFingerprint,
      location: Location
    }>,
    recentRides: Array<{
      from: Location,
      to: Location,
      timestamp: string,
      driver: string,
      completed: boolean
    }>
  }
): Promise<TrustScore> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning mock trust score");
      return {
        overall: 85,
        locationTrust: 90,
        deviceTrust: 85,
        behaviorTrust: 80,
        timePatternTrust: 85
      };
    }

    const prompt = `
      You are an advanced security system generating a trust score for a ride-sharing app user.
      
      USER DATA:
      ${JSON.stringify(user, null, 2)}
      
      Analyze this user's behavior patterns and calculate trust scores in these categories:
      1. Location trust: consistency and predictability of locations
      2. Device trust: consistency of device usage
      3. Behavior trust: patterns in ride behavior, cancellations, etc.
      4. Time pattern trust: consistency in usage times
      
      Return your analysis as a trust score in this EXACT JSON format:
      {
        "overall": number from 0-100,
        "locationTrust": number from 0-100,
        "deviceTrust": number from 0-100,
        "behaviorTrust": number from 0-100,
        "timePatternTrust": number from 0-100
      }
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return {
        overall: 75,
        locationTrust: 75,
        deviceTrust: 75,
        behaviorTrust: 75,
        timePatternTrust: 75
      };
    }
  } catch (error) {
    console.error("Error generating trust score:", error);
    return {
      overall: 70,
      locationTrust: 70,
      deviceTrust: 70,
      behaviorTrust: 70,
      timePatternTrust: 70
    };
  }
}

/**
 * Analyze a live ride for safety concerns
 */
export async function analyzeLiveRideSafety(
  rideData: {
    rideId: string,
    startLocation: Location,
    currentLocation: Location,
    destination: Location,
    expectedRoute: Location[],
    startTime: string,
    currentTime: string,
    expectedEndTime: string,
    driver: {
      id: string,
      rating: number,
      totalRides: number
    },
    rider: {
      id: string,
      rating: number,
      totalRides: number
    },
    currentSpeed: number,
    averageSpeed: number,
    stops: Array<{location: Location, duration: number}>,
    isRideShared: boolean
  }
): Promise<LiveRideSafetyAnalysis> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning mock ride safety analysis");
      return {
        currentRiskLevel: "low",
        riskFactors: [],
        routeDeviation: 0,
        speedAnalysis: "Normal speed for this route",
        neighborhoodSafetyRating: 90,
        recommendations: ["Continue monitoring ride as normal"]
      };
    }

    const prompt = `
      You are an advanced AI safety system monitoring a ride-sharing trip in real-time.
      
      CURRENT RIDE DATA:
      ${JSON.stringify(rideData, null, 2)}
      
      Analyze this ride for safety concerns, focusing on:
      1. Route deviation from expected path
      2. Unusual stops or detours
      3. Speed analysis (too fast, too slow)
      4. Time of day and neighborhood safety
      5. Driver behavior patterns
      
      Return your analysis in this EXACT JSON format:
      {
        "currentRiskLevel": "low" | "medium" | "high",
        "riskFactors": array of strings describing risk factors if any,
        "routeDeviation": number representing percentage deviation from expected route,
        "speedAnalysis": string describing speed analysis,
        "neighborhoodSafetyRating": number from 0-100 where higher is safer,
        "recommendations": array of strings with safety recommendations
      }
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return {
        currentRiskLevel: "medium", // Higher due to parsing error
        riskFactors: ["Unable to complete safety analysis"],
        routeDeviation: 0,
        speedAnalysis: "Unable to analyze speed",
        neighborhoodSafetyRating: 70,
        recommendations: ["Consider checking in with rider", "Monitor ride more closely"]
      };
    }
  } catch (error) {
    console.error("Error analyzing ride safety:", error);
    return {
      currentRiskLevel: "medium",
      riskFactors: ["Safety analysis system failure"],
      routeDeviation: 0,
      speedAnalysis: "Analysis unavailable",
      neighborhoodSafetyRating: 70,
      recommendations: ["Technical issue with safety monitoring", "Consider manual verification of ride status"]
    };
  }
}

/**
 * Detect potential fraud or scam attempts in user communications
 */
export async function detectCommunicationFraud(
  message: string,
  context: {
    sender: "driver" | "rider" | "system" | "unknown",
    rideStatus: string,
    previousMessages: Array<{
      sender: "driver" | "rider" | "system" | "unknown",
      message: string,
      timestamp: string
    }>
  }
): Promise<{
  isFraudulent: boolean,
  fraudRisk: number,
  fraudType?: string,
  explanation: string,
  recommendedAction: string
}> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning mock fraud detection");
      return {
        isFraudulent: false,
        fraudRisk: 5,
        explanation: "No suspicious elements detected in message",
        recommendedAction: "No action needed"
      };
    }

    const prompt = `
      You are an advanced fraud detection system for a ride-sharing application.
      
      MESSAGE TO ANALYZE:
      "${message}"
      
      CONTEXT:
      ${JSON.stringify(context, null, 2)}
      
      Analyze this message for potential fraud, phishing, or scam attempts, such as:
      1. Requests for payment outside the app
      2. Requests for personal information
      3. Suspicious links or contact information
      4. Unusual requests that don't align with normal ride-sharing operations
      5. Social engineering tactics
      
      Return your analysis in this EXACT JSON format:
      {
        "isFraudulent": boolean,
        "fraudRisk": number from 0-100 where higher is more risky,
        "fraudType": string describing the type of fraud (if detected),
        "explanation": string explaining your analysis,
        "recommendedAction": string describing what action should be taken
      }
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return {
        isFraudulent: false,
        fraudRisk: 30,  // Higher due to parsing error
        explanation: "Unable to complete fraud analysis",
        recommendedAction: "Review message manually as automated analysis failed"
      };
    }
  } catch (error) {
    console.error("Error in fraud detection:", error);
    return {
      isFraudulent: false,
      fraudRisk: 40,  // Higher risk when analysis fails
      explanation: "Fraud detection system error",
      recommendedAction: "Proceed with caution and verify through official channels"
    };
  }
}

/**
 * Generate security recommendations based on user profile and usage patterns
 */
export async function getPersonalizedSecurityRecommendations(
  userProfile: {
    totalRides: number,
    accountAge: string,
    securitySettings: {
      twoFactorEnabled: boolean,
      biometricEnabled: boolean,
      locationSharingEnabled: boolean,
      emergencyContactsConfigured: boolean,
      lastPasswordChange: string
    },
    ridePatterns: {
      commonPickups: string[],
      commonDestinations: string[],
      typicalRideTimes: string[],
      frequentDrivers: string[]
    },
    deviceInfo: DeviceFingerprint
  }
): Promise<string[]> {
  try {
    if (!API_KEY) {
      console.warn("No Gemini API key found, returning mock security recommendations");
      return [
        "Enable two-factor authentication for additional account security.",
        "Regularly update your password to maintain account integrity.",
        "Set up emergency contacts to alert loved ones if needed during a ride."
      ];
    }

    const prompt = `
      You are an advanced security advisor for a ride-sharing application.
      
      USER PROFILE:
      ${JSON.stringify(userProfile, null, 2)}
      
      Based on this user's profile and usage patterns, provide 3-5 personalized security recommendations to improve their safety when using the ride-sharing service.
      
      Consider:
      1. Account security settings
      2. Ride patterns and behaviors
      3. Device usage
      4. Personal safety practices
      
      Return exactly 3-5 specific, actionable recommendations as an array of strings. Each recommendation should be 1-2 sentences maximum. Do not include any markdown formatting, numbering, or extra text.
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract recommendations from the text
    const recommendations = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[\d\-\.\*]+\s*/, '').trim()) // Remove any numbering
      .filter(line => line.length > 0 && !line.includes('["') && !line.includes('"]'));
    
    return recommendations.slice(0, 5); // Ensure we have at most 5 recommendations
  } catch (error) {
    console.error("Error getting security recommendations:", error);
    return [
      "Enable two-factor authentication for additional account security.",
      "Set up emergency contacts for quick access during rides.",
      "Verify driver information before entering the vehicle."
    ];
  }
}

/**
 * Generate a one-time secure ride code for verification
 */
export function generateSecureRideCode(): {code: string, expires: Date} {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = '';
  
  // Generate a 6-character code
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  // Set expiration to 5 minutes from now
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 5);
  
  return { code, expires };
}

/**
 * Hash and salt a password securely (in a real app, use a proper crypto library)
 * This is a simplified example for demonstration purposes
 */
export function secureHash(password: string): string {
  // In a real app, use a proper crypto library with salting
  // This is just a placeholder function
  return `hashed_${password}_with_salt`;
}

/**
 * Analyze and score a password strength using Gemini
 */
export async function analyzePasswordStrength(
  password: string
): Promise<{
  score: number,
  strength: "very weak" | "weak" | "moderate" | "strong" | "very strong",
  weaknesses: string[],
  improvement: string
}> {
  try {
    if (!API_KEY) {
      // Return a basic analysis without Gemini
      const lengthScore = Math.min(5, password.length / 4);
      const hasUpperCase = /[A-Z]/.test(password) ? 1 : 0;
      const hasLowerCase = /[a-z]/.test(password) ? 1 : 0;
      const hasDigit = /\d/.test(password) ? 1 : 0;
      const hasSpecial = /[^A-Za-z0-9]/.test(password) ? 2 : 0;
      
      const score = lengthScore + hasUpperCase + hasLowerCase + hasDigit + hasSpecial;
      let strength: "very weak" | "weak" | "moderate" | "strong" | "very strong" = "weak";
      
      if (score < 3) strength = "very weak";
      else if (score < 5) strength = "weak";
      else if (score < 7) strength = "moderate";
      else if (score < 9) strength = "strong";
      else strength = "very strong";
      
      return {
        score: Math.min(100, score * 10),
        strength,
        weaknesses: score < 7 ? ["Password may not be strong enough"] : [],
        improvement: "Consider using a longer password with a mix of uppercase, lowercase, numbers, and special characters."
      };
    }

    // NEVER send the actual password to Gemini - instead send characteristics
    const passwordLength = password.length;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigits = /\d/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    const hasRepeatedChars = /(.).*\1/.test(password);
    const hasConsecutiveDigits = /\d{3,}/.test(password);
    
    // Check for common patterns without revealing the password
    const hasPotentialDate = /19\d{2}|20\d{2}|[01]\d[0123]\d/.test(password);
    const hasKeyboardPattern = 
      /qwert|asdfg|zxcvb|12345|poiuy|lkjhg|mnbvc|54321/.test(password.toLowerCase());
    
    const characteristics = {
      length: passwordLength,
      hasUpperCase,
      hasLowerCase,
      hasDigits,
      hasSpecialChars,
      hasRepeatedChars,
      hasConsecutiveDigits,
      hasPotentialDate,
      hasKeyboardPattern
    };

    const prompt = `
      You are a password security analyzer. Analyze these password characteristics:
      ${JSON.stringify(characteristics, null, 2)}
      
      Based on these characteristics only (NOT an actual password), provide:
      1. A strength score from 0-100
      2. A categorical strength rating (very weak, weak, moderate, strong, very strong)
      3. Specific weaknesses in the password structure
      4. One specific suggestion to improve password strength
      
      Return your analysis in this EXACT JSON format:
      {
        "score": number from 0-100,
        "strength": "very weak" | "weak" | "moderate" | "strong" | "very strong",
        "weaknesses": array of strings describing specific weaknesses,
        "improvement": string with one specific suggestion for improvement
      }
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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonText = text.slice(jsonStart, jsonEnd);
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      // Fallback to basic analysis
      return {
        score: hasUpperCase && hasLowerCase && hasDigits && hasSpecialChars ? 75 : 45,
        strength: hasUpperCase && hasLowerCase && hasDigits && hasSpecialChars ? "strong" : "weak",
        weaknesses: ["Unable to complete full analysis"],
        improvement: "Use a mix of uppercase, lowercase, numbers, and special characters in a password at least 12 characters long."
      };
    }
  } catch (error) {
    console.error("Error analyzing password strength:", error);
    return {
      score: 50,
      strength: "moderate",
      weaknesses: ["Analysis error"],
      improvement: "Use a password manager to generate and store strong, unique passwords."
    };
  }
} 