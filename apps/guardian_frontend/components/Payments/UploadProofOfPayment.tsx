import UploadFile from '~/components/Payments/UploadFile';
import ViewFile from '~/public/icons/fi-rr-file-check.svg';
import { GuardianDependentPayin } from '@cometa/trpc';
import { Button } from '~/components/ui/Button';

interface UploadProofOfPaymentProps {
  payment: GuardianDependentPayin;
  disabled: boolean;
  onUploadFile: (file: File) => void;
}

export default function UploadProofOfPayment({ payment, disabled, onUploadFile }: UploadProofOfPaymentProps) {
  return (
    <div className="w-full flex items-center gap-x-2.5 inline-flex">
      {payment.proof_of_payment ? (
        <Button
          className="w-full px-4 py-3 bg-[#F6F5FA] rounded-full cursor-pointer hover:bg-[#F6F5FA] active:bg-[#F6F5FA] shadow-none hover:shadow-none active:shadow-none disabled:shadow-none"
          disabled={disabled}
          onClick={() => window.open(payment.proof_of_payment as string, '_blank')}
        >
          <div className="flex items-center justify-center">
            <ViewFile className="text-[#374957] mr-2" />
            <span className="text-sm font-medium text-[#374957] font-medium">Ver comprobante</span>
          </div>
        </Button>
      ) : (
        <UploadFile
          onUploadFile={(file) => onUploadFile(file)}
          buttonMessage="Adjuntar comprobante"
          successMessage="Comprobante subido correctamente"
          failureMessage="Error al subir el comprobante"
          disabled={disabled}
        />
      )}
    </div>
  );
}
