import { LegalDocumentsResponse } from '@cometa/trpc/src/bot/types';
import { LegalDocumentDetailsDrawer } from '../shared/LegalDocumentDetailsDrawer';
import { FilesDisplay } from '../shared/FilesDisplay';

type ArticlesOfIncorporationDetailsDrawerProps = {
  legalDocuments: LegalDocumentsResponse | null | undefined;
  onClose: () => void;
};

export function ArticlesOfIncorporationDetailsDrawer({
  legalDocuments,
  onClose,
}: Readonly<ArticlesOfIncorporationDetailsDrawerProps>) {
  if (!legalDocuments) return null;

  const files = legalDocuments.articles_of_incorporation_files || [];

  return (
    <LegalDocumentDetailsDrawer title="Acta constitutiva" onClose={onClose}>
      <FilesDisplay files={files} />
    </LegalDocumentDetailsDrawer>
  );
}
