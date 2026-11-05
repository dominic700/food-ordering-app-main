import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { extractReceiptCode } from './telebirrVerifier.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RECEIPTS_DIR = path.join(__dirname, '..', 'uploads', 'receipts');
fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// Saves a base64 data-URL screenshot to uploads/receipts and returns
// its public path (e.g. /uploads/receipts/ab12.jpg). Returns null if
// the data is not a valid jpeg/png/webp image or is larger than 5 MB.
export function saveReceiptImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length === 0 || buf.length > 5 * 1024 * 1024) return null;
  const name = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${EXT[m[1]]}`;
  fs.writeFileSync(path.join(RECEIPTS_DIR, name), buf);
  return `/uploads/receipts/${name}`;
}

// Turns what the customer typed (code, receipt URL or SMS text) and/or
// a screenshot into the value stored in transaction_number (max 100 chars).
// Returns null when neither a usable code nor a valid screenshot is given.
export function buildProofReference(input, screenshotData) {
  const typed = (input || '').trim();
  if (typed) return extractReceiptCode(typed) || typed.slice(0, 100);
  if (screenshotData) return saveReceiptImage(screenshotData);
  return null;
}
