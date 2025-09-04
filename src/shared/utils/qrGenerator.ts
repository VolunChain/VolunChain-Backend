import QRCode from "qrcode";

export async function generateQRCode(url: string): Promise<Buffer> {
  return await QRCode.toBuffer(url, { width: 150 });
}
