import { useContext } from 'react';
import FeaturesContext from '~/contexts/FeaturesContext';

const useFeatures = () => useContext(FeaturesContext);

export default useFeatures;
