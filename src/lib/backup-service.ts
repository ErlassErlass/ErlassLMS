
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function generateBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'public', 'backups')
  const tempDir = path.join(process.cwd(), 'temp')
  
  // Ensure directories exist
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

  const dbDumpPath = path.join(tempDir, `db-dump-${timestamp}.sql`)
  const zipFileName = `full-backup-${timestamp}.zip`
  const zipFilePath = path.join(backupDir, zipFileName)

  try {
    // 1. Dump Database
    // Note: pg_dump must be in system PATH. If using Laragon, usually in bin/postgresql/bin
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw new Error("DATABASE_URL is missing")
    
    // Parse connection string simply or pass directly. 
    // pg_dump -d "postgres://user:pass@host:port/db" -f output.sql
    console.log('Starting database dump...')
    
    // Set PG credential via env for the command
    const env = { ...process.env }
    
    // Simple extract for Windows compatibility if needed, but passing connection string is easier
    await execAsync(`pg_dump "${databaseUrl}" -f "${dbDumpPath}"`, { env })
    
    console.log('Database dumped successfully.')

    // 2. Create ZIP
    return new Promise<{ success: boolean, downloadUrl?: string, error?: string }>((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        console.log('Backup archive created: ' + archive.pointer() + ' total bytes')
        // Clean up SQL file
        fs.unlinkSync(dbDumpPath)
        resolve({ success: true, downloadUrl: `/backups/${zipFileName}` })
      })

      archive.on('error', (err) => {
        reject({ success: false, error: err.message })
      })

      archive.pipe(output)

      // Append Database Dump
      archive.file(dbDumpPath, { name: 'database.sql' })

      // Append Uploads Folder
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, 'uploads')
      }

      // Append .env (OPTIONAL/RISKY - but requested for rebuild ease. Encrypting in real world recommended)
      // We will append a template instead or the real one with a warning.
      // Let's append the real one but name it .env.backup
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        archive.file(envPath, { name: '.env.backup' })
      }

      archive.finalize()
    })

  } catch (error: any) {
    console.error('Backup failed:', error)
    return { success: false, error: error.message || "Backup failed" }
  }
}
