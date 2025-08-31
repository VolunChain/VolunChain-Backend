import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { generateQRCode } from "../../../../shared/infrastructure/utils/qrGenerator";
import { format } from "date-fns";

export async function generateCertificate({
  volunteerName,
  projectName,
  eventDate,
  organizationSignature,
  customMessage,
  uniqueId,
}: {
  volunteerName: string;
  projectName: string;
  eventDate: string;
  organizationSignature: string;
  customMessage: string;
  uniqueId: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const logoBytes = fs.readFileSync(
    path.join(__dirname, "../../../../assets/VolunChain.png")
  );
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const qrBuffer = await generateQRCode(
    `https://volunchain.org/verify/${uniqueId}`
  );
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  const normalFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const logoDims = logoImage.scale(0.2);
  const qrDims = qrImage.scale(0.4);

  const borderColor = rgb(0.8, 0.3, 0.3);

  // === Border ===
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 802,
    height: 555,
    borderColor,
    borderWidth: 4,
  });

  // === Centered Logo ===
  page.drawImage(logoImage, {
    x: (842 - logoDims.width) / 2,
    y: 430,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Manual center
  page.drawText("Certificate of Participation", {
    x:
      (842 - boldFont.widthOfTextAtSize("Certificate of Participation", 38)) /
      2,
    y: 360,
    size: 38,
    font: boldFont,
    color: borderColor,
  });

  // === Volunteer Name ===
  page.drawText(volunteerName, {
    x: (842 - boldFont.widthOfTextAtSize(volunteerName, 30)) / 2,
    y: 310,
    size: 30,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  // === Subtitle ===
  const subtitle = `has successfully participated in "${projectName}"`;
  page.drawText(subtitle, {
    x: (842 - italicFont.widthOfTextAtSize(subtitle, 24)) / 2,
    y: 280,
    size: 24,
    font: italicFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // === Event Date ===
  const eventDateFormatted = format(new Date(eventDate), "EEEE do MMMM yyyy");
  page.drawText(eventDateFormatted, {
    x: (842 - normalFont.widthOfTextAtSize(eventDateFormatted, 18)) / 2,
    y: 250,
    size: 18,
    font: normalFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // === Custom Message ===
  const lines = customMessage.match(/.{1,80}(\s|$)/g) || [customMessage];
  lines.forEach((line, i) => {
    const textWidth = normalFont.widthOfTextAtSize(line.trim(), 18);
    page.drawText(line.trim(), {
      x: (842 - textWidth) / 2,
      y: 210 - i * 20,
      size: 18,
      font: normalFont,
      color: rgb(0.15, 0.15, 0.15),
    });
  });

  // === Signature Text (Bottom Left) ===
  page.drawText(organizationSignature + ": ___________________", {
    x: 40,
    y: 60,
    size: 12,
    font: normalFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // === QR Code (Bottom Right) ===
  page.drawImage(qrImage, {
    x: 842 - qrDims.width - 40,
    y: 40,
    width: qrDims.width,
    height: qrDims.height,
  });

  const pdfBytes = await pdfDoc.save();
  // return pdfBytes;
  return Buffer.from(pdfBytes);
}
