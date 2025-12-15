import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface UserImportRow {
  email: string;
  name: string;
  password?: string;
  schoolCode?: string;
  phone?: string;
  classCode?: string;
}

class UserImporter {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public async process() {
    console.log(`Starting import from ${this.filePath}...`);
    
    const users = this.parseCsv();
    if (users.length === 0) {
      console.warn('No users found in CSV.');
      return;
    }

    // Pre-fetch classes for mapping
    const classes = await prisma.class.findMany({
      select: { code: true, id: true }
    });
    const classMap = new Map(classes.map(c => [c.code, c.id]));

    const hashedUsers = await this.prepareUsers(users, classMap);
    await this.saveUsers(hashedUsers);
  }

  private parseCsv(): UserImportRow[] {
    const content = fs.readFileSync(this.filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Basic validation
    if (!headers.includes('email') || !headers.includes('name')) {
      throw new Error('CSV must contain "email" and "name" columns');
    }

    const data: UserImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (row.email && row.name) {
        data.push(row);
      }
    }

    return data;
  }

  private async prepareUsers(users: UserImportRow[], classMap: Map<string, string>) {
    const prepared = [];
    const defaultPasswordHash = await bcrypt.hash('DefaultPass123!', 10);

    for (const user of users) {
      let classId = null;
      if (user.classCode && classMap.has(user.classCode)) {
        classId = classMap.get(user.classCode);
      } else if (user.classCode) {
        console.warn(`Warning: Class code '${user.classCode}' not found for user ${user.email}`);
      }

      prepared.push({
        email: user.email,
        name: user.name,
        password: user.password ? await bcrypt.hash(user.password, 10) : defaultPasswordHash,
        schoolCode: user.schoolCode || null,
        phone: user.phone || null,
        role: 'USER' as const, // Enforce type safety
        school: user.schoolCode ? `School ${user.schoolCode}` : null, // Fallback
        classId: classId,
      });
    }
    return prepared;
  }

  private async saveUsers(data: any[]) {
    try {
      console.log(`Attempting to import ${data.length} users...`);
      
      // Using createMany with skipDuplicates for safety/idempotency
      const result = await prisma.user.createMany({
        data,
        skipDuplicates: true,
      });

      console.log(`✅ Successfully imported ${result.count} users.`);
      
      if (result.count < data.length) {
        console.log(`⚠️  ${data.length - result.count} users were skipped (likely duplicate emails).`);
      }

    } catch (error) {
      console.error('❌ Import failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Execution
const main = async () => {
  const args = process.argv.slice(2);
  const csvPath = args[0] || path.join(process.cwd(), 'users_import.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    console.log('Usage: tsx scripts/bulk-import-users.ts <path-to-csv>');
    process.exit(1);
  }

  const importer = new UserImporter(csvPath);
  await importer.process();
};

main();
