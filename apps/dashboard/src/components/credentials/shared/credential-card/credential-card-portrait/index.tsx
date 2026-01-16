import { useCredential } from '../../../credential-context';
import { CREDENTIAL_SIDE } from '../../../types';
import { CredentialFrontSide } from './front-side';
import { CredentialBackSide } from './back-side';

export function CredentialCardPortrait() {
  const { side } = useCredential();
  const isBack = side === CREDENTIAL_SIDE.BACK;

  return (
    <div className="w-full h-full relative bg-white">
      <div
        className="w-full h-full"
        style={{
          transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
          backfaceVisibility: 'visible',
        }}
      >
        {isBack ? <CredentialBackSide /> : <CredentialFrontSide />}
      </div>
    </div>
  );
}
