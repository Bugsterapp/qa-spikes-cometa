import { useCredential } from '../../../credential-context';
import { CREDENTIAL_SIDE } from '../../../types';
import { CredentialFrontSide } from './front-side';
import { CredentialBackSide } from './back-side';
import type { CredentialConfig, StudentData, SchoolData } from '../../../types';

type CredentialCardLandscapeProps = {
  config: CredentialConfig;
  studentData: StudentData;
  schoolData: SchoolData;
};

export function CredentialCardLandscape({ config, studentData, schoolData }: CredentialCardLandscapeProps) {
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
        {isBack ? (
          <CredentialBackSide config={config} />
        ) : (
          <CredentialFrontSide config={config} studentData={studentData} schoolData={schoolData} />
        )}
      </div>
    </div>
  );
}
