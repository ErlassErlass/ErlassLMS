'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function uploadImage(file: File, folder: string = 'courses'): Promise<string | null> {
  if (!file) return null

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const path = join(uploadDir, uniqueName)
    await writeFile(path, buffer)

    // Return public URL
    return `/uploads/${folder}/${uniqueName}`
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}
