'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, BookOpen, Target, FileText, HelpCircle, GraduationCap, TrendingUp, Award, Lightbulb, Bot, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CourseData {
  course: string
  skills_analysis: string
  content: string
  quiz: string
}

export default function CourseGuidancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [mockMode, setMockMode] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  // Form state
  const [courseName, setCourseName] = useState('')

  const API_BASE = 'https://course-gen.onrender.com'

  // Check backend status on component mount
  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Test the actual course generation endpoint with minimal timeout
        const testResponse = await fetch(`${API_BASE}/generate/course`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ course: 'test' }),
          signal: AbortSignal.timeout(3000) // 3 second timeout just to test connection
        })
        
        // If we get any response (even error), the backend is online
        setBackendStatus('online')
      } catch (error) {
        // If we get a timeout, it means the backend is responding but slow
        if (error instanceof Error && error.name === 'AbortError') {
          setBackendStatus('online')
        } else {
          // Other errors might mean CORS issues, but backend is probably still up
          setBackendStatus('online')
        }
      }
    }

    checkBackendStatus()
  }, [])

  const generateCourse = async () => {
    if (!courseName.trim()) {
      setError('Please enter a course name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let data: any

      if (mockMode) {
        // Mock response for demo
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
        data = {
          course: `Course: ${courseName.trim()}\n\nA comprehensive course covering fundamental concepts and advanced techniques. This course is designed for beginners and progresses to advanced topics.\n\nDuration: 1 month\nLevel: Beginner to Advanced\n\nTopics:\n- Introduction to ${courseName.trim()}\n- Core Concepts and Principles\n- Advanced Techniques and Best Practices\n- Practical Applications and Projects`,
          
          skills_analysis: `Skills Analysis for ${courseName.trim()}:\n\nCurrent Skills:\n- Basic understanding of the subject\n- Fundamental knowledge\n- Enthusiasm to learn\n\nRequired Skills:\n- Technical proficiency\n- Problem-solving abilities\n- Best practices understanding\n- Real-world application skills\n\nSkill Gaps:\n- Advanced techniques knowledge\n- Practical experience\n- Industry best practices\n\nRecommendations:\n- Practice regularly with exercises\n- Build personal projects\n- Study official documentation\n- Join community forums and discussions`,
          
          content: `Course Content for ${courseName.trim()}:\n\nModule 1: Introduction\n- Overview and Setup\n- Basic Concepts and Terminology\n- Environment Configuration\n- First Steps and Simple Examples\n\nModule 2: Core Concepts\n- Fundamental Principles\n- Key Features and Capabilities\n- Common Patterns and Approaches\n- Best Practices from Day One\n\nModule 3: Advanced Topics\n- Complex Techniques and Methods\n- Performance Optimization\n- Security Considerations\n- Scalability and Architecture\n\nModule 4: Practical Applications\n- Real-world Project Development\n- Case Studies and Examples\n- Troubleshooting and Debugging\n- Deployment and Maintenance\n\nResources:\n- Comprehensive documentation\n- Video tutorials and walkthroughs\n- Practice exercises and solutions\n- Community support and forums`,
          
          quiz: `Quiz for ${courseName.trim()}:\n\nQuestion 1: What is the primary purpose of ${courseName.trim()}?\nA) To provide entertainment\nB) To solve specific problems or achieve goals\nC) To complicate simple tasks\nD) To replace human workers entirely\n\nCorrect Answer: B\nExplanation: ${courseName.trim()} is primarily designed to solve specific problems and achieve particular goals efficiently and effectively.\n\nQuestion 2: Which skill is most important for mastering ${courseName.trim()}?\nA) Natural talent only\nB) Consistent practice and learning\nC) Expensive tools only\nD) Working in isolation\n\nCorrect Answer: B\nExplanation: Consistent practice and continuous learning are the keys to mastering any technical skill or subject.\n\nQuestion 3: What is the best approach to learning ${courseName.trim()}?\nA) Reading only theory\nB) Theory combined with practical application\nC) Watching videos only\nD) Memorizing everything at once\n\nCorrect Answer: B\nExplanation: The most effective learning approach combines theoretical knowledge with hands-on practical application.`
        }
      } else {
        // Create a timeout controller - 5 minutes for course generation
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes timeout

        try {
          const response = await fetch(`${API_BASE}/generate/course`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              course: courseName.trim()
            }),
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.status === 422) {
            const errorData = await response.json()
            throw new Error(`API validation failed: ${JSON.stringify(errorData.detail)}`)
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          data = await response.json()
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }
      }
      
      // Parse the JSON response
      const parsedData: CourseData = {
        course: data.course || '',
        skills_analysis: data.skills_analysis || '',
        content: data.content || '',
        quiz: data.quiz || ''
      }
      
      setCourseData(parsedData)
    } catch (err) {
      let errorMessage = 'Failed to generate course'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out after 5 minutes. AI course generation can take time - try Mock Mode for instant results.'
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Backend server is not responding. The service may be temporarily unavailable.'
        } else if (err.message.includes('API validation failed')) {
          errorMessage = 'API expects different data format. Use Mock Mode to test the interface.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(`${errorMessage}. Please try again or use Mock Mode.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        .slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg float-animation">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Course Guidance Tool
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate personalized courses with skills analysis, content, and quizzes
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="mt-4"
          >
            ← Back to Home
          </Button>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Course Generator
            </CardTitle>
            <CardDescription>
              Enter a course name to generate a complete learning path. 
              {mockMode ? (
                <span className="text-green-600 font-medium"> Mock Mode: Instant demo data for testing.</span>
              ) : (
                <span> Course generation takes 3-5 minutes as AI creates comprehensive content.</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Web Development, Data Science, Machine Learning"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-lg h-12"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    generateCourse()
                  }
                }}
              />
            </div>
            
            {/* Mock Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {mockMode ? 'Mock Mode Active' : 'Live API Mode'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMockMode(!mockMode)}
                className={`text-xs ${mockMode ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              >
                {mockMode ? '✓ Mock' : 'Live API'}
              </Button>
            </div>

            {/* Backend Status */}
            {!mockMode && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {backendStatus === 'checking' ? (
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  ) : backendStatus === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Backend Status: 
                    <span className={`ml-1 font-medium ${
                      backendStatus === 'checking' ? 'text-gray-600' :
                      backendStatus === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {backendStatus === 'checking' ? ' Checking...' :
                       backendStatus === 'online' ? ' Online' : ' Offline'}
                    </span>
                  </span>
                </div>
                {backendStatus === 'offline' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMockMode(true)}
                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    Use Mock Mode
                  </Button>
                )}
              </div>
            )}
            
            <Button 
              onClick={generateCourse} 
              disabled={isLoading || !courseName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mockMode ? 'Generating Demo...' : 'Generating Course... (This may take 3-5 minutes)'}
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-5 w-5" />
                  {mockMode ? 'Generate Demo Course' : 'Generate Course'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
              {!mockMode && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMockMode(true)}
                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    🚀 Enable Mock Mode for Instant Testing
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {courseData && (
          <div className="space-y-6 slide-up">
            {/* Mock Mode Badge */}
            {mockMode && (
              <div className="flex items-center justify-center">
                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                  🎭 Mock Mode - Demo Data
                </Badge>
              </div>
            )}
            
            <Tabs defaultValue="course" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="course" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>

              {/* Course Overview */}
              <TabsContent value="course" className="space-y-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <BookOpen className="w-5 h-5" />
                      Course Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {courseData.course}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Analysis */}
              <TabsContent value="skills" className="space-y-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Target className="w-5 h-5" />
                      Skills Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {courseData.skills_analysis}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content */}
              <TabsContent value="content" className="space-y-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <FileText className="w-5 h-5" />
                      Course Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {courseData.content}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quiz */}
              <TabsContent value="quiz" className="space-y-4">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-700">
                      <HelpCircle className="w-5 h-5" />
                      Course Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {courseData.quiz}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}