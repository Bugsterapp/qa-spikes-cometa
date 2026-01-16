import Status from '../Status';

const PlaceToPay = ({
  at_school,
  loading,
  sponsored,
  className,
}: {
  at_school: boolean;
  loading?: boolean;
  sponsored?: boolean;
  className?: string;
}) =>
  loading ? (
    <div role="status" className="max-w-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-28" />
    </div>
  ) : (
    <Status variant={at_school || sponsored ? 'success' : 'info'} className={className}>
      {sponsored ? 'Patrocinado' : at_school ? 'Directo al colegio' : 'Portal de Cometa'}
    </Status>
  );

export default PlaceToPay;
