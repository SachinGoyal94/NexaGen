"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Globe, FileText, BookOpen, Zap } from "lucide-react"

const guideSteps = [
  {
    title: "Welcome to AI Summarizer",
    description: "Transform any content into concise summaries and blog posts with AI",
    icon: <Zap className="h-8 w-8 text-blue-500" />,
    features: ["Multiple content sources", "AI-powered processing", "Blog generation"]
  },
  {
    title: "Choose Your Content Source",
    description: "Select from websites or YouTube videos to process",
    icon: <Globe className="h-8 w-8 text-green-500" />,
    features: ["Website URLs", "YouTube links", "Direct content analysis"]
  },
  {
    title: "Generate Smart Summaries",
    description: "Get AI-powered concise summaries of your content",
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    features: ["Concise summaries", "Key insights extraction", "Processing time display"]
  },
  {
    title: "Language & YouTube Requirements",
    description: "For YouTube videos, specify language code and ensure transcript availability",
    icon: <BookOpen className="h-8 w-8 text-orange-500" />,
    features: ["Language codes (en, hi, es, etc.)", "YouTube transcript required", "Audio language matching"]
  }
]

export default function FeatureGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Show guide on first visit
    const hasSeenGuide = localStorage.getItem("hasSeenFeatureGuide")
    if (!hasSeenGuide) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("hasSeenFeatureGuide", "true")
  }

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  if (!isOpen) return null

  const step = guideSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center mb-4">
            {step.icon}
          </div>
          <CardTitle className="text-xl">{step.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {step.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-1 mt-4">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNext} size="sm">
                {currentStep === guideSteps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}