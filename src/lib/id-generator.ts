import { customAlphabet } from 'nanoid';

// Alphabet aman untuk URL (tanpa simbol aneh)
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const generateRandom = customAlphabet(alphabet, 16); // Panjang 16 karakter random

// Mapping Prefix
const PREFIXES = {
  user: 'usr',
  mentor: 'mnt',
  admin: 'adm',
  
  class: 'cls',
  course: 'crs',
  section: 'sec',
  enrollment: 'enr',
  progress: 'prg',
  
  challenge: 'chg',
  submission: 'sub',
  badge: 'bdg',
  userBadge: 'ubg',
  
  transaction: 'trx',
  voucher: 'vch',
  
  questionBank: 'bnk',
  quiz: 'qzz',
  question: 'qst',
  attempt: 'att',
  
  certificate: 'crt',
} as const;

type EntityType = keyof typeof PREFIXES;

/**
 * Menghasilkan ID standar dengan prefix.
 * Contoh: generateId('user') -> 'usr_8x92mk2a...'
 */
export function generateId(entity: EntityType): string {
  const prefix = PREFIXES[entity];
  return `${prefix}_${generateRandom()}`;
}
