import { useCredential } from '../../../credential-context';
import '../credential-free-text.css';

export function CredentialBackSide() {
  const { config, signatureFile, digitalSealFile } = useCredential();

  const textColor = config.color_scheme.text_color;
  const primaryColor = config.color_scheme.background.primary;

  const signatureUrl = signatureFile ? URL.createObjectURL(signatureFile) : null;
  const digitalSealUrl = digitalSealFile ? URL.createObjectURL(digitalSealFile) : null;

  const showSignature = config.back_fields.signature.show && signatureUrl;
  const showDigitalSeal = config.back_fields.digital_seal.show && digitalSealUrl;
  const visibleImagesCount = [showSignature, showDigitalSeal].filter(Boolean).length;

  return (
    <>
      {/* Background layer */}
      <div className="absolute h-[307px] left-0 top-[205px] w-full" style={{ backgroundColor: primaryColor }} />

      {/* Images section */}
      <div className="absolute top-0 left-0 right-0 bottom-[307px] p-[20px]">
        <div
          className={
            visibleImagesCount === 2
              ? 'h-full flex flex-col gap-[10px] items-center justify-center'
              : 'h-full flex items-center justify-center'
          }
        >
          {showSignature ? (
            <div className="w-full flex items-center justify-center" style={{ height: '62px' }}>
              <img src={signatureUrl} alt="Firma" className="max-w-full max-h-full object-contain" />
            </div>
          ) : null}

          {showDigitalSeal ? (
            <div className="w-full flex items-center justify-center" style={{ height: '62px' }}>
              <img src={digitalSealUrl} alt="Sello Digital" className="max-w-full max-h-full object-contain" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Free text section */}
      <div className="absolute left-0 right-0 p-[20px]" style={{ top: '205px', height: '307px' }}>
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
