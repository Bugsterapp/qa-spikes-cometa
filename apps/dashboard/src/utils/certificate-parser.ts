import { X509Certificate } from '@peculiar/x509';

export type CertificateMetadata = {
  rfc?: string;
  legalName?: string;
  issuedAt?: string;
  expiresAt?: string;
};

export async function parseCertificateWithDates(file: File): Promise<CertificateMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const cert = new X509Certificate(arrayBuffer);
  const subjectString = cert.subject;
  const subjectFields = parseSubjectString(subjectString);

  let legalName = subjectFields.CN || subjectFields.O;
  if (legalName && legalName.includes(', 2.5.4.')) {
    legalName = legalName.split(', 2.5.4.')[0];
  }

  let rfc: string | undefined;
  const oidRFC = subjectFields['2.5.4.45'];
  if (oidRFC) {
    const rfcPart = oidRFC.split('/')[0].trim();
    rfc = extractRFCFromSerial(rfcPart) || rfcPart;
  }

  const notBefore = cert.notBefore;
  const notAfter = cert.notAfter;
  const issuedAt = notBefore ? notBefore.toISOString().split('T')[0] : undefined;
  const expiresAt = notAfter ? notAfter.toISOString().split('T')[0] : undefined;

  return {
    rfc,
    legalName,
    issuedAt,
    expiresAt,
  };
}

function parseSubjectString(subjectString: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const parts = subjectString.split(/,\s*(?=[A-Z0-9.]+=)/);

  parts.forEach((part) => {
    const trimmed = part.trim();
    const equalIndex = trimmed.indexOf('=');

    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      fields[key] = value;
    }
  });

  return fields;
}

function extractRFCFromSerial(serialNumber?: string): string | undefined {
  if (!serialNumber) return undefined;

  const rfcPattern = /([A-ZÑ&]{3,4}\d{6}[A-Z\d]{3})/i;
  const match = serialNumber.match(rfcPattern);

  if (match) {
    return match[1].toUpperCase().replace(/[\s-]/g, '');
  }

  return undefined;
}
