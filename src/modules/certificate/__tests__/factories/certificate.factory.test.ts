import { CertificateModuleFactory } from "../../factories/certificate.factory";
import { CertificateService } from "../../application/services/CertificateService";
import { ICertificateService } from "../../domain/interfaces/ICertificateService";

// Mock the CertificateService
jest.mock("../../application/services/CertificateService");

describe("CertificateModuleFactory", () => {
  let mockCertificateService: jest.Mocked<CertificateService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCertificateService = new CertificateService() as jest.Mocked<CertificateService>;
    (CertificateService as jest.Mock).mockImplementation(() => mockCertificateService);
  });

  describe("createCertificateService", () => {
    it("should create a certificate service instance", () => {
      const certificateService = CertificateModuleFactory.createCertificateService();

      expect(certificateService).toBeDefined();
      expect(CertificateService).toHaveBeenCalledTimes(1);
    });

    it("should return an instance that implements ICertificateService", () => {
      const certificateService = CertificateModuleFactory.createCertificateService();

      expect(certificateService).toBeInstanceOf(CertificateService);
      expect(typeof certificateService.createCertificate).toBe("function");
      expect(typeof certificateService.getCertificateUrl).toBe("function");
      expect(typeof certificateService.getCertificateBuffer).toBe("function");
      expect(typeof certificateService.logDownload).toBe("function");
    });

    it("should return different instances on each call", () => {
      const firstInstance = CertificateModuleFactory.createCertificateService();
      const secondInstance = CertificateModuleFactory.createCertificateService();

      expect(firstInstance).not.toBe(secondInstance);
      expect(CertificateService).toHaveBeenCalledTimes(2);
    });
  });
});
