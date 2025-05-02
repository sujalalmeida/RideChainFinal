"use client"

import React, { useState, useEffect } from "react"
import { analyzePasswordStrength } from "@/lib/security-service"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

interface PasswordStrengthAnalyzerProps {
  password: string
  onChange?: (analysis: {
    score: number,
    strength: "very weak" | "weak" | "moderate" | "strong" | "very strong",
    weaknesses: string[],
    improvement: string
  }) => void
}

export function PasswordStrengthAnalyzer({ password, onChange }: PasswordStrengthAnalyzerProps) {
  const [analysis, setAnalysis] = useState<{
    score: number,
    strength: "very weak" | "weak" | "moderate" | "strong" | "very strong",
    weaknesses: string[],
    improvement: string
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzedPassword, setLastAnalyzedPassword] = useState("")

  // Analyze password strength
  const analyzeStrength = async (pwd: string) => {
    if (!pwd || pwd.length < 1) {
      setAnalysis(null)
      return
    }
    
    if (pwd === lastAnalyzedPassword) return
    
    setIsAnalyzing(true)
    
    try {
      const result = await analyzePasswordStrength(pwd)
      setAnalysis(result)
      setLastAnalyzedPassword(pwd)
      
      if (onChange) {
        onChange(result)
      }
    } catch (error) {
      console.error("Error analyzing password strength:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Debounce the password analysis to avoid calling the API too frequently
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeStrength(password)
    }, 500) // 500ms debounce time
    
    return () => clearTimeout(timer)
  }, [password])

  // Get color based on strength
  const getStrengthColor = () => {
    if (!analysis) return "text-gray-400"
    
    switch (analysis.strength) {
      case "very weak":
        return "text-red-600"
      case "weak":
        return "text-orange-500"
      case "moderate":
        return "text-amber-500"
      case "strong":
        return "text-green-500"
      case "very strong":
        return "text-emerald-600"
      default:
        return "text-gray-500"
    }
  }

  // Get progress bar color
  const getProgressColor = () => {
    if (!analysis) return "bg-gray-200"
    
    switch (analysis.strength) {
      case "very weak":
        return "bg-red-600"
      case "weak":
        return "bg-orange-500"
      case "moderate":
        return "bg-amber-500"
      case "strong":
        return "bg-green-500"
      case "very strong":
        return "bg-emerald-600"
      default:
        return "bg-gray-500"
    }
  }

  // Get strength indicator icon
  const getStrengthIcon = () => {
    if (!analysis) return <Info className="h-4 w-4 text-gray-400" />
    
    switch (analysis.strength) {
      case "very weak":
      case "weak":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "moderate":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "strong":
      case "very strong":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="w-full space-y-2">
      {/* Strength meter */}
      <div className="flex items-center gap-2 mb-1">
        <div className="text-sm font-medium flex items-center gap-1.5">
          {getStrengthIcon()}
          <span>Password Strength:</span>
        </div>
        
        {analysis ? (
          <Badge 
            variant="outline"
            className={`ml-auto ${getStrengthColor()} border-current capitalize`}
          >
            {analysis.strength}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground ml-auto">
            {password ? (isAnalyzing ? "Analyzing..." : "Type more...") : "Enter password"}
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <Progress 
        value={analysis?.score || 0} 
        className="h-1.5 w-full"
        indicatorClassName={getProgressColor()}
      />
      
      {/* Analysis details */}
      {analysis && (
        <div className="pt-1 space-y-3">
          {/* Weaknesses */}
          {analysis.weaknesses.length > 0 && (
            <Alert variant="outline" className="py-2">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Password weaknesses:</p>
                    <ul className="list-disc pl-5 text-sm space-y-0.5">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Improvement suggestion */}
          {analysis.improvement && (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>{analysis.improvement}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}