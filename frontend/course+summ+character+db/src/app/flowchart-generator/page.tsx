'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, RefreshCw, ArrowLeft, Sparkles, Copy, Check, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FlowchartGenerator() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [flowchartId, setFlowchartId] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const API_BASE_URL = 'https://flowchart-maker-dfmz.onrender.com'

  const handleGenerateFlowchart = async () => {
    if (!input.trim()) {
      setError('Please enter a flowchart description')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setHtmlContent(null)
    setFlowchartId(null)

    try {
      // Step 1: POST to /generate endpoint
      const generateResponse = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
        }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || `API Error: ${generateResponse.status}`)
      }

      const responseData = await generateResponse.json()
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to generate flowchart')
      }

      const { flowchart_id, download_url, generated_code } = responseData

      setFlowchartId(flowchart_id)
      setGeneratedCode(generated_code)
      
      // Step 2: GET the HTML file using the flowchart_id
      const htmlResponse = await fetch(`${API_BASE_URL}${download_url}`)
      
      if (!htmlResponse.ok) {
        throw new Error('Failed to fetch generated HTML')
      }

      const htmlText = await htmlResponse.text()
      setHtmlContent(htmlText)
      setSuccess('Flowchart generated successfully!')
      
      // Load HTML into iframe
      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlText
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flowchart'
      setError(`${errorMessage}. Please try again.`)
      console.error('Flowchart generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadHTML = () => {
    if (!htmlContent || !flowchartId) return

    try {
      const element = document.createElement('a')
      const file = new Blob([htmlContent], { type: 'text/html' })
      element.href = URL.createObjectURL(file)
      element.download = `flowchart_${flowchartId}.html`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      setSuccess('HTML file downloaded successfully!')
    } catch (err) {
      setError('Failed to download file')
    }
  }

  const handleCopyHTML = () => {
    if (!htmlContent) return

    try {
      navigator.clipboard.writeText(htmlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const handleCopyCode = () => {
    if (!generatedCode) return

    try {
      navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy code')
    }
  }

  const handleClear = () => {
    setInput('')
    setHtmlContent(null)
    setFlowchartId(null)
    setGeneratedCode(null)
    setError(null)
    setSuccess(null)
  }

  const exampleInputs = [
    "if a user age is more than 18 they can drive lmv and if more than 24 than hmv",
    "User logs in -> Validate credentials -> If valid, show dashboard, else show error",
    "Customer places order -> Check inventory -> If in stock, create shipment, else notify customer -> Process payment",
  ]

  const handleExampleInput = (example: string) => {
    setInput(example)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <style jsx>{`
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Flowchart Generator
                  </h1>
                </div>
              </Link>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 slide-up">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Flowchart Input
                </CardTitle>
                <CardDescription>Describe your flowchart logic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="flowchart-input" className="text-sm font-medium">
                    Flowchart Description
                  </Label>
                  <Textarea
                    id="flowchart-input"
                    placeholder="E.g., if a user age is more than 18 they can drive lmv and if more than 24 than hmv"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[200px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Describe the logic flow, decision points, and conditions clearly
                  </p>
                </div>

                {/* Example Inputs */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Examples</Label>
                  <div className="space-y-2">
                    {exampleInputs.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExampleInput(example)}
                        className="w-full text-left justify-start text-xs h-auto py-2 px-3 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
                      >
                        <span className="truncate">{example.substring(0, 40)}...</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    onClick={handleGenerateFlowchart}
                    disabled={isLoading || !input.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Flowchart
                      </>
                    )}
                  </Button>

                  {htmlContent && (
                    <>
                      <Button
                        onClick={handleDownloadHTML}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download HTML
                      </Button>
                      <Button
                        onClick={handleCopyHTML}
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy HTML
                          </>
                        )}
                      </Button>

                      {flowchartId && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Flowchart ID:</p>
                          <p className="text-xs text-gray-600 break-all font-mono">{flowchartId}</p>
                        </div>
                      )}
                    </>
                  )}

                  {input && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Status Messages */}
                {error && (
                  <Alert className="border-red-200 bg-red-50 slide-up">
                    <AlertDescription className="text-red-800 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 slide-up">
                    <AlertDescription className="text-green-800 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview & Code Panel */}
          <div className="lg:col-span-2 space-y-6 slide-up" style={{ animationDelay: '0.1s' }}>
            {/* HTML Preview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-[500px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Flowchart Preview
                    </CardTitle>
                    <CardDescription>
                      {htmlContent ? 'Your generated flowchart' : 'Flowchart preview will appear here'}
                    </CardDescription>
                  </div>
                  {htmlContent && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                {htmlContent ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 fade-in">
                    <iframe
                      ref={iframeRef}
                      title="Flowchart Preview"
                      className="w-full h-full border-0 rounded-lg shadow-lg bg-white"
                      srcDoc={htmlContent}
                      sandbox={{ allow: ['scripts', 'same-origin'] }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-12 h-12 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-700">No flowchart yet</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Enter a description and click "Generate Flowchart" to create your diagram
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Code */}
            {generatedCode && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        Generated Code
                      </CardTitle>
                      <CardDescription>Python code representation of the flowchart</CardDescription>
                    </div>
                    <Button
                      onClick={handleCopyCode}
                      size="sm"
                      variant="outline"
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[300px] text-sm font-mono">
                    <pre>{generatedCode}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Information Section */}
        <Card className="mt-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Badge className="bg-indigo-100 text-indigo-700 border-0">Step 1</Badge>
                <h4 className="font-medium">Describe Your Logic</h4>
                <p className="text-sm text-muted-foreground">
                  Write a clear description of your flowchart logic including decision points and conditions.
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-purple-100 text-purple-700 border-0">Step 2</Badge>
                <h4 className="font-medium">Generate Diagram</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Generate Flowchart" to convert your description into a visual diagram using AI.
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-700 border-0">Step 3</Badge>
                <h4 className="font-medium">Download & Use</h4>
                <p className="text-sm text-muted-foreground">
                  Download the HTML file, copy the code, or view the generated Python code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
