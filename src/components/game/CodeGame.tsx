'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Play, RefreshCcw, HelpCircle } from "lucide-react"
import { toast } from "sonner"

export type LevelConfig = {
  gridSize: number
  start: { x: number, y: number }
  finish: { x: number, y: number }
  obstacles: { x: number, y: number }[]
  maxCommands?: number
}

// Default Level (Fallback)
const LEVEL_DEFAULT: LevelConfig = {
  gridSize: 5,
  start: { x: 0, y: 0 },
  finish: { x: 4, y: 0 },
  obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }]
}

interface CodeGameProps {
    levelConfig?: LevelConfig
    onComplete?: (code: string) => void
}

export default function CodeGame({ levelConfig = LEVEL_DEFAULT, onComplete }: CodeGameProps) {
  const [code, setCode] = useState("// Tulis kodemu di sini\n// Perintah: move(), turnRight(), turnLeft()\n\nmove()\nmove()")
  const [playerPos, setPlayerPos] = useState(levelConfig.start)
  const [playerDir, setPlayerDir] = useState(90) 
  const [isRunning, setIsRunning] = useState(false)
  const [level, setLevel] = useState(levelConfig)

  // Reset Game
  const handleReset = () => {
    setPlayerPos(level.start)
    setPlayerDir(90)
    setIsRunning(false)
  }

  // Interpreter Logic
  const runCode = async () => {
    if (isRunning) return
    setIsRunning(true)
    handleReset() // Reset posisi visual dulu

    const commands = code.split('\n').map(c => c.trim()).filter(c => c.length > 0 && !c.startsWith('//'))
    let currentX = level.start.x
    let currentY = level.start.y
    let currentDir = 90
    
    // Validasi & Simulasi Langkah
    for (const cmd of commands) {
      // Delay visual agar terlihat bergerak step-by-step
      await new Promise(r => setTimeout(r, 800)) 

      if (cmd === 'move()') {
        let nextX = currentX
        let nextY = currentY

        if (currentDir === 0) nextY -= 1
        if (currentDir === 90) nextX += 1
        if (currentDir === 180) nextY += 1
        if (currentDir === 270) nextX -= 1

        // Cek Tabrakan Tembok / Batas
        if (nextX < 0 || nextY < 0 || nextX >= level.gridSize || nextY >= level.gridSize || 
            level.obstacles.some(o => o.x === nextX && o.y === nextY)) {
            toast.error("Nabrak Tembok! 💥")
            setIsRunning(false)
            return
        }

        currentX = nextX
        currentY = nextY
        setPlayerPos({ x: currentX, y: currentY })

      } else if (cmd === 'turnRight()') {
        currentDir = (currentDir + 90) % 360
        setPlayerDir(currentDir)
      } else if (cmd === 'turnLeft()') {
        currentDir = (currentDir - 90 + 360) % 360
        setPlayerDir(currentDir)
      } else {
        toast.warning(`Perintah tidak dikenal: ${cmd}`)
      }
    }

    // Cek Win Condition
    if (currentX === level.finish.x && currentY === level.finish.y) {
        toast.success("Level Selesai! 🎉")
        if (onComplete) {
            onComplete(code)
        }
    } else {
        toast.error("Belum sampai tujuan. Coba lagi!")
    }
    
    setIsRunning(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
      {/* Code Editor Area */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#1e1e1e] rounded-xl p-4 flex-1 border-2 border-gray-700 shadow-inner font-mono">
            <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-green-400 focus:outline-none resize-none text-sm"
                spellCheck={false}
            />
        </div>
        <div className="flex gap-2">
            <Button onClick={runCode} disabled={isRunning} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                <Play className="mr-2 h-4 w-4" /> Jalankan Kode
            </Button>
            <Button onClick={handleReset} variant="outline" className="px-4">
                <RefreshCcw className="h-4 w-4" />
            </Button>
        </div>
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs">
            <p className="font-bold mb-1">Perintah Tersedia:</p>
            <ul className="list-disc list-inside">
                <li><code>move()</code> - Maju 1 langkah</li>
                <li><code>turnRight()</code> - Putar kanan 90°</li>
                <li><code>turnLeft()</code> - Putar kiri 90°</li>
            </ul>
        </div>
      </div>

      {/* Game Visualizer Area */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center relative border-4 border-gray-300 dark:border-gray-700 shadow-inner overflow-hidden">
        {/* Grid Container */}
        <div 
            className="grid gap-1 bg-white p-2 rounded-lg shadow-lg relative"
            style={{ 
                gridTemplateColumns: `repeat(${level.gridSize}, 60px)`,
                gridTemplateRows: `repeat(${level.gridSize}, 60px)`
            }}
        >
            {/* Render Grid Cells */}
            {Array.from({ length: level.gridSize * level.gridSize }).map((_, i) => {
                const x = i % level.gridSize
                const y = Math.floor(i / level.gridSize)
                const isObstacle = level.obstacles.some(o => o.x === x && o.y === y)
                const isFinish = level.finish.x === x && level.finish.y === y
                
                return (
                    <div 
                        key={i} 
                        className={`
                            w-[60px] h-[60px] rounded-md border border-gray-100 flex items-center justify-center text-2xl
                            ${isObstacle ? 'bg-gray-800 border-gray-900 shadow-inner' : 'bg-blue-50'}
                            ${isFinish ? 'bg-green-100 border-green-300' : ''}
                        `}
                    >
                        {isObstacle && '🧱'}
                        {isFinish && '🚩'}
                    </div>
                )
            })}

            {/* Render Player (Overlay) */}
            <div 
                className="absolute w-[60px] h-[60px] flex items-center justify-center transition-all duration-700 ease-in-out z-10"
                style={{
                    left: `${playerPos.x * 60 + 8}px`, // +8 for padding offset
                    top: `${playerPos.y * 60 + 8}px`,
                    transform: `rotate(${playerDir}deg)` // Rotasi visual robot
                }}
            >
                <span className="text-4xl filter drop-shadow-md">🤖</span>
            </div>
        </div>
      </div>
    </div>
  )
}
