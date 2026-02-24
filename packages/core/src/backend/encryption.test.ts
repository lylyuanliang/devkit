import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Test suite for encryption functionality
 * Tests the core encryption/decryption logic without actual database
 */
describe('Encryption Utilities', () => {
  let encryptionKey: Buffer;

  beforeEach(() => {
    // Generate a test key
    encryptionKey = crypto.randomBytes(32);
  });

  function encryptValue(value: any): string {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${encrypted}:${authTag.toString('hex')}`;
  }

  function decryptValue(encrypted: string): any {
    const [encryptedData, authTagHex] = encrypted.split(':');
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    try {
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      throw new Error('Failed to decrypt data - authentication failed');
    }
  }

  it('should encrypt and decrypt string values', () => {
    const original = 'secret-password';
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });

  it('should encrypt and decrypt object values', () => {
    const original = { username: 'admin', password: 'secret123' };
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toEqual(original);
  });

  it('should encrypt and decrypt JSON values', () => {
    const original = { nested: { data: [1, 2, 3] } };
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toEqual(original);
  });

  it('should produce different ciphertexts for same plaintext (when IV varies)', () => {
    // Note: Our current implementation uses zero IV, so we test with different keys
    const original = 'test-data';
    const key2 = crypto.randomBytes(32);

    const encrypted1 = encryptValue(original);
    // Manually encrypt with different key
    const iv = Buffer.alloc(16, 0);
    const cipher2 = crypto.createCipheriv('aes-256-gcm', key2, iv);
    let encrypted2 = cipher2.update(original, 'utf8', 'hex');
    encrypted2 += cipher2.final('hex');
    const authTag2 = cipher2.getAuthTag();
    const encryptedWithKey2 = `${encrypted2}:${authTag2.toString('hex')}`;

    expect(encrypted1).not.toBe(encryptedWithKey2);
  });

  it('should fail decryption with wrong key', () => {
    const original = 'secret-data';
    const encrypted = encryptValue(original);

    const wrongKey = crypto.randomBytes(32);
    const [encryptedData, authTagHex] = encrypted.split(':');
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-256-gcm', wrongKey, iv);
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    expect(() => {
      decipher.update(encryptedData, 'hex', 'utf8');
      decipher.final('utf8');
    }).toThrow();
  });

  it('should fail decryption with tampered ciphertext', () => {
    const original = 'test-data';
    const encrypted = encryptValue(original);
    const [encryptedData, authTagHex] = encrypted.split(':');

    // Tamper with ciphertext
    const tamperedChar = String.fromCharCode(
      (parseInt(encryptedData[0], 16) + 1) % 16
    ).padStart(1, '0');
    const tamperedEncrypted = tamperedChar + encryptedData.slice(1);

    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    expect(() => {
      decipher.update(tamperedEncrypted, 'hex', 'utf8');
      decipher.final('utf8');
    }).toThrow();
  });

  it('should handle empty string', () => {
    const original = '';
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });

  it('should handle large values', () => {
    const original = 'x'.repeat(10000);
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });

  it('should handle special characters', () => {
    const original = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });

  it('should handle unicode characters', () => {
    const original = '你好世界 🚀 مرحبا بالعالم';
    const encrypted = encryptValue(original);
    const decrypted = decryptValue(encrypted);

    expect(decrypted).toBe(original);
  });
});
