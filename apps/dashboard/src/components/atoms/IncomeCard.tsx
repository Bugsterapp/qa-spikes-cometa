import { Tooltip } from './Tooltip';
import { formatPrice } from '/src/utils/general';

export function StatsCard({
  title,
  number,
  subtitle,
  tooltipText,
}: {
  title: string;
  number: number;
  subtitle: string;
  tooltipText: string;
}) {
  const numberSplit = formatPrice(number || 0, 'MXN').split('.');
  const numberWithoutDecimals = numberSplit[0];
  const decimals = numberSplit[1];
  return (
    <div className="shadow-card py-5 px-6 space-y-2.5 rounded-2xl">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
        <Tooltip message={tooltipText}>
          <div className="cursor-pointer">
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 9.34784 21.4464 6.8043 19.5711 4.92893C17.6957 3.05357 15.1522 2 12.5 2ZM13.5 16C13.5 16.5523 13.0523 17 12.5 17C11.9477 17 11.5 16.5523 11.5 16V11C11.5 10.4477 11.9477 10 12.5 10C13.0523 10 13.5 10.4477 13.5 11V16ZM11.5 8C11.5 8.55228 11.9477 9 12.5 9C13.0523 9 13.5 8.55228 13.5 8C13.5 7.44772 13.0523 7 12.5 7C11.9477 7 11.5 7.44772 11.5 8Z"
                fill="#C4CDD5"
              />
            </svg>
          </div>
        </Tooltip>
      </div>
      <h4 className="text-green font-bold text-xl">
        {numberWithoutDecimals}.<span className="text-sm">{decimals}</span>
      </h4>
    </div>
  );
}
