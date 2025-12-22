
type ExecutionResult = {
  success: boolean
  output: string
  error?: string
}

const PISTON_API_URL = "https://emkc.org/api/v2/piston"

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  // Add more if needed
}

export class CodeExecutionService {
  /**
   * Execute code using Piston API
   */
  static async execute(language: string, code: string): Promise<ExecutionResult> {
    const langConfig = LANGUAGE_MAP[language.toLowerCase()]
    
    if (!langConfig) {
      // Fallback or error if language not supported
      // For now, if it's a web challenge (html/css), we shouldn't be here
      return { 
        success: false, 
        output: "", 
        error: `Language '${language}' not supported for server-side execution.` 
      }
    }

    try {
      const response = await fetch(`${PISTON_API_URL}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: langConfig.language,
          version: langConfig.version,
          files: [
            {
              content: code,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Piston API Error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Piston returns { run: { stdout: "", stderr: "", code: 0, ... } }
      const { run } = data
      
      if (run.code !== 0) {
        // Runtime error or Compilation error
        return {
          success: true, // Request succeeded, but code failed
          output: run.stdout + run.stderr,
          error: run.stderr
        }
      }

      return {
        success: true,
        output: run.stdout,
      }

    } catch (error: any) {
        console.error("Code Execution Error:", error)
        return {
            success: false,
            output: "",
            error: error.message
        }
    }
  }
}
