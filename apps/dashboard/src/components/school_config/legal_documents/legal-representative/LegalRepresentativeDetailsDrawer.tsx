import { LegalDocumentsResponse } from '@cometa/trpc/src/bot/types';
import { LegalDocumentDetailsDrawer } from '../shared/LegalDocumentDetailsDrawer';
import { DetailsSection } from '../shared/DetailsSection';
import { FilePreview } from '../shared/FilePreview';
import { DetailsRow } from '../shared/DetailsRow';
import { formatDate } from '../../../../utils/legal-documents-utils';

type LegalRepresentativeDetailsDrawerProps = {
  legalDocuments: LegalDocumentsResponse | null | undefined;
  onClose: () => void;
};

export function LegalRepresentativeDetailsDrawer({
  legalDocuments,
  onClose,
}: Readonly<LegalRepresentativeDetailsDrawerProps>) {
  if (!legalDocuments) return null;

  const files = legalDocuments.legal_representative_files || [];

  const frontFile = files[0];
  const backFile = files[1];

  return (
    <LegalDocumentDetailsDrawer title="Representante legal" onClose={onClose}>
      <DetailsSection title="Datos del representante legal">
        <DetailsRow label="Nombres" content={legalDocuments.legal_representative_name || 'No especificado'} />
        <DetailsRow label="Apellidos" content={legalDocuments.legal_representative_last_name || 'No especificado'} />
        <DetailsRow label="CURP" content={legalDocuments.legal_representative_curp || 'No especificado'} />
        <DetailsRow label="Fecha de nacimiento" content={formatDate(legalDocuments.legal_representative_birth_date)} />
      </DetailsSection>

      {files.length > 0 && (
        <div className="flex flex-col gap-6">
          <h3 className="text-[#22283a] text-base font-semibold font-lota">Identificación oficial</h3>
          {frontFile && <FilePreview file={frontFile} label="Frente de la INE o IFE" />}
          {backFile && <FilePreview file={backFile} label="Reverso de la INE o IFE" />}
        </div>
      )}
    </LegalDocumentDetailsDrawer>
  );
}
