import { useCredential } from '../../../credential-context';
import type { CredentialConfig } from '../../../types';
import '../credential-free-text.css';

type CredentialBackSideProps = {
  config: CredentialConfig;
};

export function CredentialBackSide({ config }: CredentialBackSideProps) {
  const { signatureFile, digitalSealFile } = useCredential();

  const primaryColor = config.color_scheme.background.primary;
  const textColor = config.color_scheme.text_color;

  const signatureUrl = signatureFile ? URL.createObjectURL(signatureFile) : null;
  const digitalSealUrl = digitalSealFile ? URL.createObjectURL(digitalSealFile) : null;

  const showSignature = config.back_fields.signature.show && signatureUrl;
  const showDigitalSeal = config.back_fields.digital_seal.show && digitalSealUrl;

  return (
    <>
      {/* White area at top */}
      <div className="absolute left-0 top-0 right-0 h-[133px] bg-white">
        <div
          className={`flex gap-[36px] items-center justify-center h-full px-[20px] ${
            showSignature && showDigitalSeal ? 'justify-center' : 'justify-center'
          }`}
        >
          {showSignature ? (
            <div className="h-[93px] w-[147px] overflow-hidden rounded-[8px] flex items-center justify-center">
              <img src={signatureUrl!} alt="Firma" className="w-full h-full object-contain" />
            </div>
          ) : null}

          {showDigitalSeal ? (
            <div className="h-[93px] w-[147px] overflow-hidden rounded-[8px] flex items-center justify-center">
              <img src={digitalSealUrl!} alt="Sello digital" className="w-full h-full object-contain" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Free text section - Green area at bottom */}
      <div className="absolute left-0 top-[133px] right-0 bottom-0 p-[20px]" style={{ backgroundColor: primaryColor }}>
        {config.back_fields.free_text.show && config.back_fields.free_text.value ? (
          <div
            className="credential-free-text-content w-full h-full overflow-hidden"
            style={{ color: textColor }}
            dangerouslySetInnerHTML={{ __html: config.back_fields.free_text.value }}
          />
        ) : null}
      </div>
    </>
  );
}
