"use client"

import React, { useState, useEffect } from "react"
import { detectCommunicationFraud } from "@/lib/security-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle, Ban, Info, SendHorizontal } from "lucide-react"

interface MessageFraudDetectorProps {
  onAnalysisComplete?: (analysis: {
    isFraudulent: boolean,
    fraudRisk: number,
    fraudType?: string,
    explanation: string,
    recommendedAction: string
  }) => void
  initialMessage?: string
  sender?: "driver" | "rider" | "system" | "unknown"
  rideStatus?: string
}

export function MessageFraudDetector({
  onAnalysisComplete,
  initialMessage = "",
  sender = "unknown",
  rideStatus = "pending"
}: MessageFraudDetectorProps) {
  const [message, setMessage] = useState(initialMessage)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fraudAnalysis, setFraudAnalysis] = useState<{
    isFraudulent: boolean,
    fraudRisk: number,
    fraudType?: string,
    explanation: string,
    recommendedAction: string
  } | null>(null)
  const [previousMessages, setPreviousMessages] = useState<Array<{
    sender: "driver" | "rider" | "system" | "unknown",
    message: string,
    timestamp: string
  }>>([
    {
      sender: "system",
      message: "Your ride has been confirmed.",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
    },
    {
      sender: sender === "driver" ? "rider" : "driver",
      message: "I'll be there in 5 minutes.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    }
  ])

  // Analyze message for fraud
  const analyzeMessage = async () => {
    if (!message.trim()) return
    
    setIsAnalyzing(true)
    
    try {
      // Prepare context
      const context = {
        sender,
        rideStatus,
        previousMessages
      }
      
      // Call fraud detection service
      const analysis = await detectCommunicationFraud(message, context)
      setFraudAnalysis(analysis)
      
      // Call callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis)
      }
    } catch (error) {
      console.error("Error analyzing message for fraud:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get risk level based on score
  const getRiskLevel = (): "low" | "medium" | "high" => {
    if (!fraudAnalysis) return "low"
    
    const score = fraudAnalysis.fraudRisk
    if (score < 30) return "low"
    if (score < 70) return "medium"
    return "high"
  }

  // Get color based on risk level
  const getRiskColor = () => {
    const level = getRiskLevel()
    switch (level) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-amber-500"
      default:
        return "text-green-600"
    }
  }

  // Get background color based on risk level
  const getRiskBgColor = () => {
    const level = getRiskLevel()
    switch (level) {
      case "high":
        return "bg-red-100"
      case "medium":
        return "bg-amber-100"
      default:
        return "bg-green-100"
    }
  }

  // Add current message to conversation history
  const addMessageToHistory = () => {
    if (!message.trim()) return
    
    const newMessage = {
      sender,
      message,
      timestamp: new Date().toISOString()
    }
    
    setPreviousMessages(prev => [...prev, newMessage])
    setMessage("")
    setFraudAnalysis(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-indigo-600" />
          Message Security Check
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Previous messages */}
        <div className="border rounded-md p-3 space-y-3 max-h-40 overflow-y-auto">
          <h3 className="text-sm font-medium mb-1">Conversation History</h3>
          {previousMessages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === sender ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                  msg.sender === 'system' 
                    ? 'bg-gray-100 text-gray-700' 
                    : msg.sender === sender 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">Type or paste a message to analyze</h3>
            
            <Badge variant="outline">
              Sender: {sender === "driver" ? "Driver" : sender === "rider" ? "Rider" : "You"}
            </Badge>
          </div>
          
          <Textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[100px]"
          />
        </div>
        
        {/* Analysis results */}
        {fraudAnalysis && (
          <div className="space-y-3 border rounded-md p-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Security Analysis</h3>
              
              <Badge 
                variant="outline"
                className={`${getRiskBgColor()} hover:${getRiskBgColor()}`}
              >
                {fraudAnalysis.isFraudulent 
                  ? "Potentially Fraudulent" 
                  : fraudAnalysis.fraudRisk > 30 
                    ? "Suspicious" 
                    : "Seems Safe"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Risk Level:</span>
                <span className={`font-medium ${getRiskColor()}`}>
                  {getRiskLevel() === "low" ? "Low" : getRiskLevel() === "medium" ? "Medium" : "High"}
                </span>
              </div>
              
              <Progress 
                value={fraudAnalysis.fraudRisk} 
                className="h-1.5"
              />
              
              {fraudAnalysis.fraudType && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Detected Issue:</span>
                  <span className="font-medium">{fraudAnalysis.fraudType}</span>
                </div>
              )}
            </div>
            
            {fraudAnalysis.isFraudulent && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: Potential Fraud Detected</AlertTitle>
                <AlertDescription>
                  {fraudAnalysis.explanation}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border-t pt-2 mt-2">
              <h4 className="text-sm font-medium">Recommendation:</h4>
              <p className="text-sm mt-1">{fraudAnalysis.recommendedAction}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={addMessageToHistory}
          disabled={!message.trim() || isAnalyzing}
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          Add to Conversation
        </Button>
        
        <Button 
          variant="default" 
          className="flex-1"
          onClick={analyzeMessage}
          disabled={!message.trim() || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Check for Fraud
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}