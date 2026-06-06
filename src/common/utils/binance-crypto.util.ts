import * as crypto from 'crypto';

export const generateBinanceSignature = (payload: string, secretKey: string): string => {
  return crypto
    .createHmac('sha512', secretKey)
    .update(payload)
    .digest('hex');
};