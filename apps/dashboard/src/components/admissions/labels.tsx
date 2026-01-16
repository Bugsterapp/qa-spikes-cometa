import InfoIcon from '/public/assets/icons/ic_info_outline.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';

export function LeadLabel({ state }: { state?: string }) {
  if (state !== 'lead') {
    return null;
  }

  return (
    <Tooltip message="Prospecto aún en proceso de admisión">
      <InfoIcon />
    </Tooltip>
  );
}
