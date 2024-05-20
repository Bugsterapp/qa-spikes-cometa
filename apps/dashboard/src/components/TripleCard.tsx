import Box from './organisms/dashboard/Box';
import Grid from '/src/components/atoms/Grid';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
interface IDelinquent {
  zero: number;
  low: number;
  mid: number;
  high: number;
  total: number;
}

interface StudentDueResumeProps {
  studentsHeader: { total: number; delinquents: IDelinquent };
  loading: boolean;
}

const TripleCard = ({ studentsHeader, loading }: StudentDueResumeProps) => {
  const cardsData = [
    {
      title: 'Total Estudiantes',
      value: studentsHeader?.total || 0,
      unit: 'estudiantes',
    },
    {
      title: 'Estudiantes sin deuda',
      value: studentsHeader?.delinquents?.zero || 0,
      unit: 'estudiantes',
    },
    {
      title: 'Estudiantes morosos',
      value: studentsHeader?.delinquents?.total || 0,
      unit: 'estudiantes',
    },
  ];

  return (
    <Box className="mt-2 p-5">
      <Grid as="section" columns={['grid-cols-3']}>
        {cardsData.map((card, index) => (
          <div
            className={`flex justify-center items-center ${
              index !== cardsData.length - 1 ? 'border-r border-[#C5C5C5]' : ''
            }`}
            key={index}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-secondary">{card.title}</span>
              <div className="flex flex-row gap-2 items-center text-gray-600">
                {loading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <span className="text-[32px] font-bold">{card.value}</span>
                )}
                {loading ? <Skeleton className="h-8" /> : <span className="text-sm font-semibold">{card.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </Box>
  );
};
export default TripleCard;
