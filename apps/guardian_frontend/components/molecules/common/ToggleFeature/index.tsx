import React, { ReactElement } from 'react';
import useFeatures from '~/hooks/useFeatures';

interface ToggleFeatureProps {
  featureName: string;
  allowComponent: ReactElement;
  lockComponent?: ReactElement;
  condition?(features: unknown[]): boolean;
}

const ToggleFeature = ({ featureName, allowComponent, lockComponent, condition }: ToggleFeatureProps) => {
  const { features, loading } = useFeatures();

  const isAllow = features.length
    ? condition
      ? condition(features)
      : !!features.find(({ name }) => name === featureName)
    : false;

  if (loading) return null;
  return (
    <div className="w-full h-fit" data-feature={featureName} data-allow={isAllow}>
      {isAllow ? allowComponent : lockComponent}
    </div>
  );
};

export default ToggleFeature;
