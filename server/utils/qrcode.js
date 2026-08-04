import QRCode from 'qrcode';
import crypto from 'crypto';

// A unique opaque token embedded in the ticket's QR code. Not a JWT on
// purpose -- it's just a lookup key scanned at check-in, kept short.
export const generateTicketToken = () => crypto.randomBytes(16).toString('hex');

export const generateQrDataUrl = async (payload) => {
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
};

export const generateQrPngBuffer = async (payload) => {
  return QRCode.toBuffer(payload, { margin: 1, width: 320 });
};
