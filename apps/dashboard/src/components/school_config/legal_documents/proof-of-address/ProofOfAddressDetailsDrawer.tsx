import { LegalDocumentsResponse } from '@cometa/trpc/src/bot/types';
import { LegalDocumentDetailsDrawer } from '../shared/LegalDocumentDetailsDrawer';
import { DetailsSection } from '../shared/DetailsSection';
import { FilesDisplay } from '../shared/FilesDisplay';
import { DetailsRow } from '../shared/DetailsRow';
import { formatDate } from '../../../../utils/legal-documents-utils';

type ProofOfAddressDetailsDrawerProps = {
  legalDocuments: LegalDocumentsResponse | null | undefined;
  onClose: () => void;
};

export function ProofOfAddressDetailsDrawer({ legalDocuments, onClose }: Readonly<ProofOfAddressDetailsDrawerProps>) {
  if (!legalDocuments) return null;

  const files = legalDocuments.proof_of_address_files || [];
  const issuedDate = legalDocuments.proof_of_address_issued_at;

  return (
    <LegalDocumentDetailsDrawer title="Comprobante de domicilio" onClose={onClose}>
      <DetailsSection title="Detalles del comprobante">
        <DetailsRow label="Fecha de emisión" content={formatDate(issuedDate)} />
      </DetailsSection>

      <FilesDisplay files={files} />
    </LegalDocumentDetailsDrawer>
  );
}
