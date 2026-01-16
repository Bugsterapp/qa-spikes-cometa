import type { CredentialConfig, SchoolData, StudentData } from '../../types';
import { CredentialCardPortrait } from './credential-card-portrait';
import { CredentialCardLandscape } from './credential-card-landscape';
import { useCredential } from '../../credential-context';

type CredentialCardProps = {
  config?: CredentialConfig;
  studentData?: StudentData;
  schoolData?: SchoolData;
};

export function CredentialCard({
  config: configProp,
  studentData: studentDataProp,
  schoolData: schoolDataProp,
}: CredentialCardProps) {
  const contextData = useCredential();

  const config = configProp || contextData.config;
  const studentData = studentDataProp || contextData.studentData;
  const schoolData = schoolDataProp || contextData.schoolData;

  if (!config || !studentData || !schoolData) {
    throw new Error('CredentialCard requires config, studentData, and schoolData either via props or context');
  }

  if (config.orientation === 'landscape') {
    return <CredentialCardLandscape config={config} studentData={studentData} schoolData={schoolData} />;
  }

  return <CredentialCardPortrait />;
}
