"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Shield, AlertTriangle, Mic, Volume2, PhoneCall, Bell, Info, MapPin, UserPlus, Headphones, AlertCircle, CheckCircle2, X } from "lucide-react"

// Gemini AI service for safety analysis
const GeminiSafetyService = {
  API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  
  async analyzeRidePattern(rideData: any): Promise<any> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this ride data for safety concerns and unusual patterns. Provide observations and recommendations:
              ${JSON.stringify(rideData)}
              
              Return response in this JSON format:
              {
                "safetyScore": number between 0-100,
                "unusualPatterns": [],
                "recommendations": [],
                "emergencyRisk": "low"|"medium"|"high"
              }`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
          }
        })
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        try {
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}') + 1;
          const jsonText = text.slice(jsonStart, jsonEnd);
          return JSON.parse(jsonText);
        } catch (e) {
          console.error("Failed to parse Gemini response:", e);
          return {
            safetyScore: 85,
            unusualPatterns: [],
            recommendations: ["Unable to analyze ride data. Default safety measures active."],
            emergencyRisk: "low"
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error analyzing ride patterns:", error);
      return null;
    }
  },
  
  async getPersonalizedSafetyTips(userProfile: any): Promise<string[]> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on this rider profile, provide 3-5 personalized safety tips for ride-sharing:
              ${JSON.stringify(userProfile)}
              
              Return only the array of tips, with each being 1-2 sentences maximum.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          }
        })
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        const tips = text.split('\n').filter(line => line.trim().length > 0 && !line.includes('["') && !line.includes('"]'));
        
        // Clean up any remaining JSON artifacts
        return tips.map(tip => {
          return tip.replace(/^"/, '').replace(/",$/, '').replace(/^- /, '').trim();
        });
      }
      return [];
    } catch (error) {
      console.error("Error getting safety tips:", error);
      return [
        "Always share your trip details with trusted contacts.",
        "Verify driver identity before entering the vehicle.",
        "Sit in the back seat when possible for more exit options."
      ];
    }
  },
  
  async analyzeVoiceCommand(audioTranscript: string): Promise<any> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this voice command from a ride-share passenger for emergency intent or safety concerns:
              "${audioTranscript}"
              
              Return response in this JSON format:
              {
                "isEmergency": boolean,
                "emergencyType": null or string describing type,
                "confidenceScore": number between 0-100,
                "recommendedAction": string
              }`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
          }
        })
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        try {
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}') + 1;
          const jsonText = text.slice(jsonStart, jsonEnd);
          return JSON.parse(jsonText);
        } catch (e) {
          console.error("Failed to parse Gemini response:", e);
          return {
            isEmergency: false,
            emergencyType: null,
            confidenceScore: 0,
            recommendedAction: "Could not analyze command. Please use emergency button if needed."
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error analyzing voice command:", error);
      return null;
    }
  }
};

export function SafetyAssistant() {
  const { user, currentRide, updateRideStatus } = useAppContext();
  const [safetyScore, setSafetyScore] = useState<number>(95);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioTranscript, setAudioTranscript] = useState<string>("");
  const [safetyTips, setSafetyTips] = useState<string[]>([]);
  const [safetyAlert, setSafetyAlert] = useState<{visible: boolean, message: string, level: 'low' | 'medium' | 'high'}>({
    visible: false,
    message: "",
    level: "low"
  });
  const [emergencyContacts, setEmergencyContacts] = useState<{name: string, phone: string, notified: boolean}[]>([
    { name: "Emergency Contact 1", phone: "123-456-7890", notified: false },
    { name: "Emergency Contact 2", phone: "098-765-4321", notified: false }
  ]);
  const [safetyPreferences, setSafetyPreferences] = useState({
    shareLocation: true,
    voiceMonitoring: true,
    autoEmergency: true,
    recordRide: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Mock function for voice recognition (in a real app this would use Web Speech API or a similar service)
  const recognizeAudio = async (audioBlob: Blob): Promise<string> => {
    // Simulate audio transcription with a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Driver is going off route. Help me.");
      }, 1000);
    });
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const transcript = await recognizeAudio(audioBlob);
        setAudioTranscript(transcript);
        
        // Analyze the transcript with Gemini
        const analysis = await GeminiSafetyService.analyzeVoiceCommand(transcript);
        if (analysis && analysis.isEmergency) {
          setEmergencyMode(true);
          setSafetyAlert({
            visible: true,
            message: `Voice command detected: ${analysis.emergencyType}. ${analysis.recommendedAction}`,
            level: analysis.confidenceScore > 80 ? "high" : "medium"
          });
          
          // Notify emergency contacts if auto-emergency is enabled
          if (safetyPreferences.autoEmergency) {
            notifyEmergencyContacts(analysis.emergencyType || "Emergency detected via voice command");
          }
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks from the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const notifyEmergencyContacts = (reason: string) => {
    // In a real app, this would send SMS or push notifications
    console.log(`Emergency notification sent to contacts: ${reason}`);
    
    setEmergencyContacts(contacts => contacts.map(contact => ({
      ...contact,
      notified: true
    })));
  };
  
  const triggerEmergency = () => {
    setEmergencyMode(true);
    
    // Notify emergency contacts
    notifyEmergencyContacts("Emergency button pressed");
    
    // In a real app, you would also notify emergency services or the ride-sharing company
  };
  
  const cancelEmergency = () => {
    setEmergencyMode(false);
    setSafetyAlert({
      visible: false,
      message: "",
      level: "low"
    });
    
    // Reset emergency contacts notification status
    setEmergencyContacts(contacts => contacts.map(contact => ({
      ...contact,
      notified: false
    })));
  };
  
  // Analyze current ride for safety patterns
  useEffect(() => {
    if (currentRide) {
      // Create a data object for analysis
      const rideData = {
        rider: user,
        ride: currentRide,
        historicalRides: [], // In a real app, you would include historical ride data
        time: new Date().toISOString(),
        location: currentRide.from,
        destination: currentRide.to
      };
      
      const analyzeSafety = async () => {
        const analysis = await GeminiSafetyService.analyzeRidePattern(rideData);
        if (analysis) {
          setSafetyScore(analysis.safetyScore);
          
          // Show safety alert if unusual patterns detected
          if (analysis.unusualPatterns && analysis.unusualPatterns.length > 0) {
            setSafetyAlert({
              visible: true,
              message: `Unusual pattern detected: ${analysis.unusualPatterns[0]}. ${analysis.recommendations[0]}`,
              level: analysis.emergencyRisk as 'low' | 'medium' | 'high'
            });
          }
        }
      };
      
      analyzeSafety();
    }
  }, [currentRide, user]);
  
  // Get personalized safety tips based on user profile
  useEffect(() => {
    if (user) {
      const getUserSafetyTips = async () => {
        const tips = await GeminiSafetyService.getPersonalizedSafetyTips(user);
        setSafetyTips(tips);
      };
      
      getUserSafetyTips();
    }
  }, [user]);
  
  // Safety score color
  const getSafetyScoreColor = () => {
    if (safetyScore >= 90) return "text-green-500";
    if (safetyScore >= 70) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <div className="space-y-4">
      {/* Emergency Mode */}
      {emergencyMode && (
        <Alert variant="destructive" className="border-red-600 bg-red-50 animate-pulse">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-600 font-bold">Emergency Mode Activated</AlertTitle>
          <AlertDescription className="text-red-700">
            Emergency contacts have been notified. Stay on the line and share your location.
            {currentRide && (
              <div className="mt-2">
                <p className="font-medium">Current Location:</p>
                <p className="text-sm">{typeof currentRide.from === 'string' ? currentRide.from : currentRide.from.address}</p>
              </div>
            )}
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="bg-white hover:bg-gray-100 border-red-600 text-red-600"
                onClick={cancelEmergency}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Emergency
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Safety Alert */}
      {safetyAlert.visible && !emergencyMode && (
        <Alert 
          className={
            safetyAlert.level === "high" ? "border-red-600 bg-red-50" : 
            safetyAlert.level === "medium" ? "border-amber-600 bg-amber-50" :
            "border-yellow-600 bg-yellow-50"
          }
        >
          <AlertTriangle className={
            safetyAlert.level === "high" ? "h-5 w-5 text-red-600" : 
            safetyAlert.level === "medium" ? "h-5 w-5 text-amber-600" :
            "h-5 w-5 text-yellow-600"
          } />
          <AlertTitle>Safety Alert</AlertTitle>
          <AlertDescription>{safetyAlert.message}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Safety Assistant</CardTitle>
            <Badge 
              className={
                safetyScore >= 90 ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                safetyScore >= 70 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : 
                "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              Safety Score: <span className={getSafetyScoreColor()}>{safetyScore}</span>
            </Badge>
          </div>
          <CardDescription>AI-powered safety monitoring and assistance</CardDescription>
          <Separator className="mt-2" />
        </CardHeader>
        <CardContent className="pb-2">
          <Tabs defaultValue="monitor">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="voice">Voice Help</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monitor" className="space-y-4">
              {/* Emergency Button */}
              <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white" 
                onClick={triggerEmergency}
                disabled={emergencyMode}
              >
                <Shield className="mr-2 h-5 w-5" />
                Emergency Assistance
              </Button>
              
              {/* Safety Tips */}
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Personalized Safety Tips</h3>
                <ul className="space-y-2">
                  {safetyTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Current Ride Safety */}
              {currentRide && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Current Ride Safety</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm border rounded-md p-2">
                      <UserPlus className="h-4 w-4 mr-2 text-indigo-600" />
                      Verified Driver
                    </div>
                    <div className="flex items-center text-sm border rounded-md p-2">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                      Location Shared
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="voice" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm mb-2">Press and hold to record voice commands like:</p>
                  <p className="text-xs text-muted-foreground">"Call emergency", "Driver is going off route", "I need help"</p>
                </div>
                
                <Button
                  className="w-24 h-24 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                >
                  <Mic className={`h-10 w-10 ${isRecording ? 'animate-pulse text-red-200' : ''}`} />
                </Button>
                
                {audioTranscript && (
                  <div className="p-3 bg-gray-50 rounded-md border mt-4">
                    <h3 className="text-sm font-medium mb-1">Detected:</h3>
                    <p className="text-sm">{audioTranscript}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Share Location</h3>
                    <p className="text-xs text-muted-foreground">Share your real-time location with trusted contacts</p>
                  </div>
                  <Switch
                    checked={safetyPreferences.shareLocation}
                    onCheckedChange={(checked) => setSafetyPreferences(prev => ({...prev, shareLocation: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Voice Monitoring</h3>
                    <p className="text-xs text-muted-foreground">Monitor voice for emergency keywords</p>
                  </div>
                  <Switch
                    checked={safetyPreferences.voiceMonitoring}
                    onCheckedChange={(checked) => setSafetyPreferences(prev => ({...prev, voiceMonitoring: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Auto-Emergency</h3>
                    <p className="text-xs text-muted-foreground">Automatically alert contacts in emergencies</p>
                  </div>
                  <Switch
                    checked={safetyPreferences.autoEmergency}
                    onCheckedChange={(checked) => setSafetyPreferences(prev => ({...prev, autoEmergency: checked}))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Record Ride</h3>
                    <p className="text-xs text-muted-foreground">Automatically record audio during rides</p>
                  </div>
                  <Switch
                    checked={safetyPreferences.recordRide}
                    onCheckedChange={(checked) => setSafetyPreferences(prev => ({...prev, recordRide: checked}))}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Emergency Contacts</h3>
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between mb-2 p-2 border rounded-md">
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SafetyAssistant; 