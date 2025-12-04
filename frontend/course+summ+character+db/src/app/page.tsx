'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, MessageCircle, User, Lock, History, Trash2, Send, Bot, Settings, Sparkles, Clock, UserCircle, Users, FileText, GraduationCap, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ChatMessage {
  id: number
  question: string
  answer: string
  engine: string
  timestamp: string
}

interface User {
  username: string
  token?: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [selectedEngine, setSelectedEngine] = useState('gemini-2.5-flash-lite-preview-06-17')
  const [useHistory, setUseHistory] = useState(true)
  const [maxHistory, setMaxHistory] = useState(10)
  const [mockMode, setMockMode] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Login form state
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const API_BASE = 'https://my-ai-mitra.onrender.com'

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // API functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.token && { Authorization: `Bearer ${user.token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, { ...options, headers })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Network error')
    }
  }

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('username', loginUsername)
      formData.append('password', loginPassword)
      formData.append('grant_type', 'password')

      const response = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `Login failed (${response.status})`
        
        // If API is down, offer mock mode
        if (response.status >= 500 || response.status === 400) {
          setError(`API Error: ${errorMessage}. The backend server appears to be down. Try Mock Mode to test the interface.`)
          return
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const userData = { username: loginUsername, token: data.access_token }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setLoginUsername('')
      setLoginPassword('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(`${errorMessage}. The backend server may be unavailable.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerUsername || !registerPassword) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
        }),
      })

      // Auto-login after registration
      setLoginUsername(registerUsername)
      setLoginPassword(registerPassword)
      setRegisterUsername('')
      setRegisterPassword('')
      
      setTimeout(() => handleLogin(), 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(`${errorMessage}. The backend server may be unavailable. Try Mock Mode to test the interface.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMockLogin = () => {
    const userData = { username: 'Demo User' }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    setMockMode(true)
    setError(null)
    // Add some demo chat history
    setChatHistory([
      {
        id: 1,
        question: "Hello! How are you?",
        answer: "Hello! I'm doing great, thank you for asking! I'm here to help you with any questions you might have. What would you like to know today?",
        engine: "gemini-2.5-flash-lite-preview-06-17",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        question: "Can you explain quantum computing?",
        answer: "Quantum computing is a revolutionary computing paradigm that uses quantum mechanics principles like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously, allowing them to solve certain complex problems much faster than traditional computers.",
        engine: "llama3-8b-8192",
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user) return

    setIsLoading(true)
    setError(null)

    try {
      let response: any
      
      if (mockMode) {
        // Mock response for demo
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        response = {
          answer: `This is a mock response from ${getModelName(selectedEngine)}. The backend API is currently unavailable, but you can see how the interface works! Your question was: "${currentMessage}"`
        }
      } else {
        response = await apiCall('/ask', {
          method: 'POST',
          body: JSON.stringify({
            question: currentMessage,
            engine: selectedEngine,
            use_history: useHistory,
            max_history: maxHistory,
          }),
        })
      }

      const newMessage: ChatMessage = {
        id: Date.now(),
        question: currentMessage,
        answer: response.answer || response.response || 'No response received',
        engine: selectedEngine,
        timestamp: new Date().toISOString(),
      }

      setChatHistory(prev => [...prev, newMessage])
      setCurrentMessage('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(`${errorMessage}. The backend server may be unavailable.`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatHistory = async () => {
    if (!user) return

    try {
      const history = await apiCall('/history')
      setChatHistory(history || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const deleteHistory = async () => {
    if (!user) return

    try {
      await apiCall('/history', { method: 'DELETE' })
      setChatHistory([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete history')
    }
  }

  const deleteSpecificChat = async (chatId: number) => {
    if (!user) return

    try {
      await apiCall(`/history/${chatId}`, { method: 'DELETE' })
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
    }
  }

  useEffect(() => {
    if (user) {
      loadChatHistory()
    }
  }, [user])

  // Check for existing user session on page load
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Failed to parse user data:', err)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const getModelIcon = (engine?: string) => {
    if (!engine) return '🤖'
    if (engine.includes('gemini')) return '🚀'
    if (engine.includes('llama3')) return '🧠'
    if (engine.includes('gemma')) return '💎'
    if (engine.includes('llama-3.1')) return '⚡'
    return '🤖'
  }

  const getModelName = (engine?: string) => {
    if (!engine) return 'Unknown'
    if (engine.includes('gemini')) return 'Gemini'
    if (engine.includes('llama3')) return 'Llama 3'
    if (engine.includes('gemma')) return 'Gemma'
    if (engine.includes('llama-3.1')) return 'Llama 3.1'
    return engine
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
          }
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .slide-up {
            animation: slide-up 0.6s ease-out;
          }
          .gradient-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
          }
        `}</style>
        <div className="w-full max-w-md slide-up">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 gradient-shimmer pointer-events-none"></div>
            <CardHeader className="text-center pb-2 relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg float-animation pulse-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Mitra
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your intelligent conversation partner
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 relative">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 data-[state=active]:shadow-lg">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 data-[state=active]:shadow-lg">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 slide-up" style={{animationDelay: '0.1s'}}>
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-sm font-medium">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-indigo-500" />
                      <Input
                        id="login-username"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-indigo-500" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogin} 
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Login
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4 slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-sm font-medium">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-indigo-500" />
                      <Input
                        id="register-username"
                        placeholder="Choose a username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-indigo-500" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleRegister} 
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Register
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
              
              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50 slide-up" style={{animationDelay: '0.3s'}}>
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 slide-up" style={{animationDelay: '0.4s'}}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Having trouble with the API?
                  </p>
                  <Button 
                    onClick={handleMockLogin}
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Mock Mode (Demo)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Test the interface without backend connection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <style jsx>{`
        @keyframes slide-in-right {
          from { 
            opacity: 0;
            transform: translateX(50px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from { 
            opacity: 0;
            transform: translateX(-50px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce-in {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        .slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
        .bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .gradient-animated {
          background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        .message-hover {
          transition: all 0.3s ease;
        }
        .message-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
      `}</style>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Mitra
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.username}
                  {mockMode && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-200 animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Mock Mode
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/character-chat')}
                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300 hover:scale-[1.02]"
              >
                <Users className="w-4 h-4" />
                Character Chat
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/summarizer')}
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4" />
                AI Summarizer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUser(null)
                  setMockMode(false)
                  setChatHistory([])
                  localStorage.removeItem('user')
                }}
                className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02]"
              >
                <Lock className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* AI Tools Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            AI Tools & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Character Chat Tool */}
            <Card 
              className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              onClick={() => router.push('/character-chat')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Character Chat</h3>
                <p className="text-xs text-gray-600">Chat with AI characters</p>
              </CardContent>
            </Card>

            {/* Course Guidance Tool */}
            <Card 
              className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              onClick={() => router.push('/course-guidance')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Course Guidance</h3>
                <p className="text-xs text-gray-600">Generate AI courses</p>
              </CardContent>
            </Card>

            {/* Database Chat Tool */}
            <Card 
              className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              onClick={() => router.push('/db-chat')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Database Chat</h3>
                <p className="text-xs text-gray-600">Query your database</p>
              </CardContent>
            </Card>

            {/* Summarizer Tool */}
            <Card 
              className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              onClick={() => router.push('/summarizer')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Summarizer</h3>
                <p className="text-xs text-gray-600">Summarize content</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-xl">Chat Interface</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {chatHistory.length} messages
                  </Badge>
                </div>
                <CardDescription>Ask questions to different AI engines</CardDescription>
              </CardHeader>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-6">
                  <div className="space-y-6 py-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-16 bounce-in">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
                          <Bot className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                        <p className="text-sm">Ask your first question to begin chatting with AI</p>
                      </div>
                    ) : (
                      chatHistory.filter(chat => chat && chat.id).map((chat, index) => (
                        <div key={chat.id} className="space-y-4" style={{animationDelay: `${index * 0.1}s`}}>
                          {/* User Message */}
                          <div className="flex gap-3 slide-in-right message-hover">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-indigo-600">You</span>
                                <span className="text-xs text-muted-foreground">
                                  {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <div className="bg-indigo-50 rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-full message-hover">
                                <p className="text-sm text-gray-800">{chat.question || 'No question'}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSpecificChat(chat.id)}
                              className="opacity-0 hover:opacity-100 transition-all duration-300 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:scale-110"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* AI Response */}
                          <div className="flex gap-3 slide-in-left message-hover" style={{animationDelay: `${index * 0.1 + 0.2}s`}}>
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-purple-600">AI Assistant</span>
                                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                                  {getModelIcon(chat.engine)} {getModelName(chat.engine)}
                                </Badge>
                              </div>
                              <div className="bg-purple-50 rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-full message-hover">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{chat.answer || 'No response received'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Section - Fixed */}
              <div className="border-t bg-gray-50 p-4 transition-all duration-300">
                <div className="space-y-3">
                  {/* Model Selection */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                      <SelectTrigger className="w-72 h-10 bg-white border-gray-200 transition-all duration-300 hover:border-indigo-300 hover:shadow-md focus:ring-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama-3.1-8b-instant" className="transition-all duration-200 hover:bg-indigo-50">
                          ⚡ llama-3.1-8b-instant
                        </SelectItem>
                        <SelectItem value="llama-3.3-70b-versatile" className="transition-all duration-200 hover:bg-indigo-50">
                          🧠 llama-3.3-70b-versatile
                        </SelectItem>
                        <SelectItem value="gemini-2.5-flash-lite" className="transition-all duration-200 hover:bg-indigo-50">
                          🚀 gemini-2.5-flash-lite
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="use-history"
                        checked={useHistory}
                        onChange={(e) => setUseHistory(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200 hover:scale-110"
                      />
                      <Label htmlFor="use-history" className="text-sm font-medium cursor-pointer transition-colors hover:text-indigo-600">Use History</Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor="max-history" className="text-sm font-medium">Max History:</Label>
                      <Input
                        id="max-history"
                        type="number"
                        min="1"
                        max="50"
                        value={maxHistory}
                        onChange={(e) => setMaxHistory(parseInt(e.target.value) || 10)}
                        className="w-16 h-10 border-gray-200 transition-all duration-300 hover:border-indigo-300 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask your question..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white transition-all duration-300 focus:scale-[1.01] focus:shadow-lg"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isLoading || !currentMessage.trim()}
                      className="px-6 h-[60px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-xl active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50 slide-up">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-200px)] flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600 transition-transform duration-300 hover:scale-110" />
                    <CardTitle className="text-xl">Chat History</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deleteHistory}
                    disabled={chatHistory.length === 0}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 border-gray-200 transition-all duration-300 hover:scale-[1.05]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  {chatHistory.length} conversation{chatHistory.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-3 py-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 bounce-in">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                        <p className="text-xs mt-1">Start chatting to see your history</p>
                      </div>
                    ) : (
                      chatHistory.filter(chat => chat && chat.id).map((chat, index) => (
                        <Card key={chat.id} className="p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 bg-gradient-to-r from-gray-50 to-white message-hover" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
                                {getModelIcon(chat.engine)} {getModelName(chat.engine)}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSpecificChat(chat.id)}
                                className="h-6 w-6 p-0 opacity-0 hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed">
                                {chat.question || 'No question'}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {chat.answer || 'No response'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {chat.timestamp ? new Date(chat.timestamp).toLocaleString() : 'No timestamp'}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}