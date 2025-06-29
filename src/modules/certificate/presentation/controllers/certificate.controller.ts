import { container } from "../../../../shared/infrastructure/container";
import { prisma } from "../../../../config/prisma";
import { ICertificateService } from "../../../../shared/domain/interfaces/ICertificateService";
import { AuthenticatedRequest } from "../../../../types/auth.types";
import { Response } from "express";

const certificateService: ICertificateService = container.certificateService;

export const downloadCertificate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const volunteerId = req.params.id;
  const userId: string = `${req.user?.id}`;

  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: { project: true },
  });

  if (!volunteer || !volunteer.id) {
    res.status(403).json({ error: "No such volunteer exists" });
    return;
  }

  try {
    if (req.query.direct === "true") {
      const pdfBuffer =
        await certificateService.getCertificateBuffer(volunteerId);

      const cert = await prisma.certificate.findUnique({
        where: { volunteerId },
      });

      await certificateService.logDownload(cert!.id, userId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificate-${volunteer.name}.pdf"`
      );

      res.send(pdfBuffer);
      return;
    } else {
      const cert = await prisma.certificate.findUnique({
        where: { volunteerId },
      });

      if (!cert) {
        res.status(404).json({ error: "Certificate not found" });
        return;
      }

      await certificateService.logDownload(cert.id, userId);

      const presignedUrl =
        await certificateService.getCertificateUrl(volunteerId);
      return res.redirect(presignedUrl);
    }
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Certificate not available" });
  }
};

export const createCertificate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const volunteerId = req.params.id;

  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: { userVolunteers: true, project: true },
  });

  if (!volunteer || !volunteer.id) {
    res.status(403).json({ error: "No such volunteer exists" });
    return;
  }

  const { eventDate, organizationSignature, customMessage } = req.body;

  if (!eventDate || !organizationSignature || !customMessage) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const uniqueId = await certificateService.createCertificate(volunteerId, {
      volunteerName: volunteer.name,
      projectName: volunteer.project.name,
      eventDate,
      organizationSignature,
      customMessage,
    });

    res.status(201).json({
      message: "Certificate created successfully",
      certificateId: uniqueId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create certificate", err });
  }
};
