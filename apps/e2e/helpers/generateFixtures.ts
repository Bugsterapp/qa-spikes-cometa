import { promises as fs } from 'fs';
import path from 'path';
import * as forge from 'node-forge';

export async function generateFiscalEntityFixtures(fixturesDir?: string): Promise<void> {
  const targetDir = fixturesDir || path.join(__dirname, '../fixtures');

  await fs.mkdir(targetDir, { recursive: true });

  const pdfPath = path.join(targetDir, 'test-fiscal-entity.pdf');
  await fs.writeFile(pdfPath, generateTestPDF(), 'utf-8');

  const { privateKey, certificate } = generateCSDKeyAndCertificate();

  const keyPath = path.join(targetDir, 'test-csd.key');
  await fs.writeFile(keyPath, privateKey, 'utf-8');

  const cerPath = path.join(targetDir, 'test-csd.cer');
  await fs.writeFile(cerPath, certificate, 'utf-8');
}

export async function cleanupFiscalEntityFixtures(fixturesDir?: string): Promise<void> {
  const targetDir = fixturesDir || path.join(__dirname, '../fixtures');

  const files = ['test-fiscal-entity.pdf', 'test-csd.key', 'test-csd.cer'];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}

const generateTestPDF = (): string => `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test CSF Document) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
433
%%EOF
`;

const generateCSDKeyAndCertificate = (): { privateKey: string; certificate: string; rfc: string } => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random3Chars = Math.random().toString(36).substring(2, 5).toUpperCase();

  const rfc = `TST${year}${month}${day}${random3Chars}`;

  const keys = forge.pki.rsa.generateKeyPair(2048);

  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

  const attrs = [
    { name: 'countryName', value: 'MX' },
    { name: 'stateOrProvinceName', value: 'Ciudad de Mexico' },
    { name: 'localityName', value: 'Ciudad de Mexico' },
    { name: 'organizationName', value: 'Entidad Fiscal Test' },
    { name: 'commonName', value: 'Entidad Fiscal Test' },
    {
      type: '2.5.4.45',
      value: rfc,
    },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const certificatePem = forge.pki.certificateToPem(cert);

  return {
    privateKey: privateKeyPem,
    certificate: certificatePem,
    rfc,
  };
};
