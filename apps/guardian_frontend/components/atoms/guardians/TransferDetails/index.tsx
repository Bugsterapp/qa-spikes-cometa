import { CopyToClipboard, RFC_KUSHKI } from '~/components/molecules/guardians/KushkiTransferInCard';

interface TransferDetailsProps {
  duration: string;
  guardianName: string;
  clabe: string;
  bankName: string;
  beneficiaryName: string;
  paymentExpiryFormatted: string;
  referenceId: string;
}

const TransferDetails = ({
  duration,
  guardianName,
  clabe,
  bankName,
  beneficiaryName,
  paymentExpiryFormatted,
  referenceId,
}: TransferDetailsProps) => (
  <div className="flex flex-col">
    <div className="flex flex-col gap-y-1 mb-4 text-[#57537A] text-sm/6">
      <span>Creado hace {duration}</span>
      <span>Creado por: {guardianName}</span>
    </div>
    <div className="flex flex-col gap-y-1.5">
      <div className="flex items-center font-medium text-sm/6 gap-x-1.5">
        <span className="text-[#3366FF]">CLABE: </span>
        <CopyToClipboard text={clabe || referenceId} successMessage="CLABE copiada">
          <span className="text-[#3366FF]">{clabe || referenceId}</span>
        </CopyToClipboard>
      </div>
      {paymentExpiryFormatted !== 'Invalid Date' && (
        <span className="text-[#57537A]">Esta CLABE expira el: {paymentExpiryFormatted}</span>
      )}
      <span className="text-[#57537A]">Banco de destino: {bankName}</span>
      <div className="flex items-center gap-x-1.5">
        <span className="text-[#637381]">RFC de destino:</span>
        <CopyToClipboard text={RFC_KUSHKI} successMessage="RFC copiado">
          <span className="text-[#3366FF]">{RFC_KUSHKI}</span>
        </CopyToClipboard>
      </div>
      <span className="text-[#57537A]">Beneficiario: {beneficiaryName || 'KUSHKI'}</span>
    </div>
  </div>
);

export default TransferDetails;
