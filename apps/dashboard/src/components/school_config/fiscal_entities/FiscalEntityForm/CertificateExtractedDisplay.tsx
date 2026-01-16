type CertificateExtractedDisplayProps = {
  taxId: string;
  name: string;
  issuedAt: string;
  expiresAt?: string;
  className?: string;
};

export function CertificateExtractedDisplay({
  taxId,
  name,
  issuedAt,
  expiresAt,
  className = '',
}: Readonly<CertificateExtractedDisplayProps>) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-blue-900 mb-3">Datos extraídos del certificado</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-blue-700 font-medium">RFC:</span>
          <p className="text-blue-900">{taxId}</p>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Razón Social:</span>
          <p className="text-blue-900">{name}</p>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Fecha de Emisión:</span>
          <p className="text-blue-900">{issuedAt}</p>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Fecha de Expiración:</span>
          <p className="text-blue-900">{expiresAt || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
