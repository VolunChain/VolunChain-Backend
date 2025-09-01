import { CertificateService } from "../application/services/CertificateService";
import { ICertificateService } from "../domain/interfaces/ICertificateService";

export class CertificateModuleFactory {
  static createCertificateService(): ICertificateService {
    return new CertificateService();
  }
}
