import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, DiscountType } from '../src/generated/prisma';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

interface CouponConfig {
  prefix: string;
  count: number;
  discountValue: number;
  discountType: DiscountType;
  expiresInDays: number;
}

class SchoolCouponGenerator {
  private config: CouponConfig;

  constructor(config: CouponConfig) {
    this.config = config;
  }

  public async generate() {
    console.log(`Generating ${this.config.count} coupons for prefix "${this.config.prefix}"...`);
    
    const coupons = this.createCouponData();
    await this.saveCoupons(coupons);
    this.exportToFile(coupons);
  }

  private createCouponData() {
    const coupons = [];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.config.expiresInDays);

    for (let i = 0; i < this.config.count; i++) {
      const code = this.generateUniqueCode(this.config.prefix);
      coupons.push({
        code,
        discountType: this.config.discountType,
        discountValue: this.config.discountValue,
        description: `School Voucher for ${this.config.prefix}`,
        maxUsage: 1,
        expiresAt: expiryDate,
        isActive: true,
      });
    }
    return coupons;
  }

  private generateUniqueCode(prefix: string): string {
    // Format: PREFIX-XXXX-XXXX
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  private async saveCoupons(coupons: any[]) {
    try {
      // Create many is efficient, but we need to handle potential collisions in random generation
      // though highly unlikely with 8 hex chars.
      
      const result = await prisma.voucher.createMany({
        data: coupons,
        skipDuplicates: true, 
      });

      console.log(`✅ Successfully created ${result.count} vouchers in database.`);
    } catch (error) {
      console.error('❌ Database insertion failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private exportToFile(coupons: any[]) {
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(outputDir, `coupons-${this.config.prefix}-${timestamp}.csv`);
    
    const csvContent = [
      'Code,Discount Value,Expires At',
      ...coupons.map(c => `${c.code},${c.discountValue},${c.expiresAt.toISOString()}`)
    ].join('\n');

    fs.writeFileSync(filename, csvContent);
    console.log(`📄 Coupons exported to: ${filename}`);
  }
}

// Execution
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: tsx scripts/generate-school-coupons.ts <PREFIX> <COUNT> [DISCOUNT_VALUE]');
    console.log('Example: tsx scripts/generate-school-coupons.ts SMAN1 50 100');
    process.exit(1);
  }

  const prefix = args[0].toUpperCase();
  const count = parseInt(args[1], 10);
  const discountValue = args[2] ? parseInt(args[2], 10) : 100; // Default 100% off if not specified

  const generator = new SchoolCouponGenerator({
    prefix,
    count,
    discountValue,
    discountType: 'PERCENTAGE', // Defaulting to percentage for "School Vouchers" (usually full scholarships)
    expiresInDays: 365,
  });

  await generator.generate();
};

main();
