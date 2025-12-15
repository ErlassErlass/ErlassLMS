"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Save, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { submitChallenge } from "@/app/actions/challenge-actions"
import { useRouter } from "next/navigation"
import CodeGame, { LevelConfig } from "@/components/game/CodeGame"


interface ChallengeEditorProps {
  challenge: {
    id: string
    title: string
    instructions: string
    expectedOutput: string | null // Make optional
    starterCode: string | null
    category: string 
    type: string // Added type
    gameConfig: any // Added gameConfig
  }
}

export function ChallengeEditor({ challenge }: ChallengeEditorProps) {
  const [code, setCode] = useState(challenge.starterCode || "")
  const [output, setOutput] = useState("Ready to run...")
  const [isRunning, setIsRunning] = useState(false)
  const [resultStatus, setResultStatus] = useState<"idle" | "success" | "error">("idle")
  const router = useRouter()

  // Determine mode
  const mode = challenge.category.toLowerCase()
  const isScratch = mode.includes('scratch') || mode.includes('block')
  const isWeb = mode.includes('web') || mode.includes('html') || mode.includes('css') || mode.includes('javascript')
  const isPython = mode.includes('python')
  const isGame = challenge.type === 'GAME'

  // Handle Game Completion
  const handleGameComplete = async (submittedCode: string) => {
      try {
          const result = await submitChallenge(challenge.id, submittedCode, true)
          if (result.success) {
              setResultStatus("success")
              router.refresh()
          }
      } catch (e) {
          console.error(e)
      }
  }

  // Render Game View
  if (isGame) {
      return (
        <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
            <div className="h-16 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/challenges/${challenge.id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-sm md:text-base">{challenge.title}</h1>
                </div>
                {resultStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-500 font-bold bg-green-900/20 px-4 py-2 rounded-full border border-green-800">
                        <CheckCircle className="h-5 w-5" /> Level Selesai!
                    </div>
                )}
            </div>
            <div className="flex-1 p-6 overflow-hidden">
                <CodeGame 
                    levelConfig={challenge.gameConfig as LevelConfig} 
                    onComplete={handleGameComplete}
                />
            </div>
        </div>
      )
  }

  // Setup default starter code based on mode if empty
  useState(() => {
    if (!code) {
        if (isPython) setCode("# Tulis kode Python kamu di sini\nprint('Hello World')")
        if (isWeb) setCode("<!-- Tulis kode HTML kamu di sini -->\n<h1>Hello World</h1>")
    }
  })

  const handleRun = async () => {
    setIsRunning(true)
    setOutput("Running...")
    setResultStatus("idle")

    // For Scratch
    if (isScratch) {
        setTimeout(() => {
            setOutput("Project Scratch berhasil dijalankan (Simulasi).")
            setResultStatus("success")
            setIsRunning(false)
        }, 1000)
        return
    }

    // For Web (HTML/CSS/JS) - Client Side Validation
    if (isWeb) {
        try {
            // Create a temporary DOM to validate structure without rendering
            const parser = new DOMParser()
            const doc = parser.parseFromString(code, "text/html")
            
            // Simple Validation Logic based on instructions/expected output keywords
            // Example: If expectedOutput contains "h1:Hello World", we check for it.
            // For now, let's assume expectedOutput contains simple keywords to check present
            const validationKeywords = challenge.expectedOutput.split(',').map(k => k.trim())
            let webPassed = true
            let errorMsg = ""

            // Check 1: Basic Keyword Check in Code
            // This is rudimentary. Real validation needs a test script field in DB.
            // But for MVP, let's check if key elements exist.
            if (validationKeywords.length > 0 && validationKeywords[0] !== "") {
                for (const keyword of validationKeywords) {
                    // Simple check: tag presence or class presence
                    if (!code.includes(keyword)) {
                        webPassed = false
                        errorMsg = `Kode kamu kurang elemen: "${keyword}". Coba periksa lagi instruksi.`
                        break
                    }
                }
            }

            // Simulate server submission of result
            const result = await submitChallenge(challenge.id, code, webPassed) // We need to update action to accept passed status
            
            if (webPassed && result.success) {
                setOutput("Halaman berhasil dirender dan memenuhi kriteria!")
                setResultStatus("success")
                router.refresh()
            } else {
                setOutput(errorMsg || "Kode berjalan, tapi belum memenuhi semua kriteria tantangan.")
                setResultStatus("error")
            }
        } catch (e) {
            setOutput("Error saat validasi HTML.")
            setResultStatus("error")
        } finally {
            setIsRunning(false)
        }
        return
    }

    // For Python (Server Side)
    try {
      const result = await submitChallenge(challenge.id, code)
      
      if (result.success) {
        setOutput(result.output || "")
        setResultStatus(result.passed ? "success" : "error")
        if (result.passed) {
            router.refresh()
        }
      } else {
        setOutput(`Error: ${result.message}`)
        setResultStatus("error")
      }
    } catch (error) {
      setOutput("An unexpected error occurred.")
      setResultStatus("error")
    } finally {
      setIsRunning(false)
    }
  }

  // Scratch Editor View
  if (isScratch) {
    return (
        <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">
            <div className="h-16 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/challenges/${challenge.id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-sm md:text-base">{challenge.title}</h1>
                </div>
                <Button 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    onClick={handleRun} // Logic to submit "I'm done"
                >
                    <CheckCircle className="h-4 w-4 mr-2" /> Tandai Selesai
                </Button>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="bg-blue-900/30 p-4 text-center text-sm text-blue-200 border-b border-blue-800">
                    Silakan buat project Scratch di bawah ini sesuai instruksi. Setelah selesai, klik tombol "Tandai Selesai" di pojok kanan atas.
                </div>
                <iframe 
                    src="https://machinelearningforkids.co.uk/scratch/" 
                    className="w-full h-full border-0"
                    allow="microphone; camera"
                />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/challenges/${challenge.id}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{challenge.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Badge */}
          <div className="px-3 py-1 rounded bg-[#333] text-xs font-mono text-gray-400 mr-2 border border-[#444]">
            {isWeb ? 'HTML/JS' : 'Python'}
          </div>

          <Button variant="secondary" className="bg-[#333] text-white hover:bg-[#444] border-0">
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
          <Button 
            className={`${resultStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#FF5656] hover:bg-[#CC0000]'} text-white font-bold min-w-[140px]`}
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : resultStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
                <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : resultStatus === 'success' ? 'Selesai!' : 'Jalankan'}
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Instructions */}
        <div className="w-1/3 border-r border-[#333] flex flex-col bg-[#1e1e1e]">
          <div className="p-2 bg-[#252526] border-b border-[#333] text-xs font-bold text-gray-400 uppercase tracking-wider">
            Instruksi
          </div>
          <div className="flex-1 overflow-y-auto p-6 text-gray-300 text-sm leading-relaxed custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-4">{challenge.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none">
               <div dangerouslySetInnerHTML={{ __html: challenge.instructions.replace(/\n/g, '<br/>') }} />
            </div>
            
            {!isWeb && (
                <div className="mt-8">
                <h3 className="font-bold text-white mb-2">Expected Output:</h3>
                <pre className="bg-black p-3 rounded-lg text-green-400 font-mono text-xs overflow-x-auto border border-[#333]">
                    {challenge.expectedOutput}
                </pre>
                </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <div className="p-2 bg-[#252526] border-b border-[#333] text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>{isWeb ? 'index.html' : 'main.py'}</span>
            <span className="text-[10px] bg-[#333] px-2 py-0.5 rounded text-gray-500">{isWeb ? 'HTML5' : 'Python 3.x'}</span>
          </div>
          
          {/* Editor Area */}
          <div className={`flex-1 relative ${isWeb ? 'h-1/2 border-b border-[#333]' : 'h-2/3'}`}>
            <textarea 
              className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none leading-6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder={isWeb ? "<!-- Tulis kode HTML di sini -->" : "# Tulis kode Python di sini"}
            ></textarea>
          </div>
          
          {/* Output Panel */}
          <div className={`flex flex-col bg-[#1e1e1e] ${isWeb ? 'h-1/2' : 'h-1/3 border-t border-[#333]'}`}>
            <div className="p-2 bg-[#252526] border-b border-[#333] text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
              <span>{isWeb ? 'Preview' : 'Console Output'}</span>
              {resultStatus === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passed</span>}
              {resultStatus === 'error' && <span className="text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</span>}
            </div>
            
            {isWeb ? (
                <div className="flex-1 bg-white w-full h-full">
                    <iframe 
                        className="w-full h-full border-0"
                        srcDoc={code}
                        sandbox="allow-scripts"
                    />
                </div>
            ) : (
                <div className="flex-1 p-4 font-mono text-sm text-gray-400 overflow-y-auto whitespace-pre-wrap">
                    {output}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

