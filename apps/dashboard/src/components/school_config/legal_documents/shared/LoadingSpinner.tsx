import { FORM_STYLES } from '../../../../constants/legalDocuments';

export function LoadingSpinner() {
  return (
    <div className={FORM_STYLES.loadingContainer}>
      <img src="/assets/loading.svg" alt="loading" data-state="show" className={FORM_STYLES.loadingImage} />
    </div>
  );
}
