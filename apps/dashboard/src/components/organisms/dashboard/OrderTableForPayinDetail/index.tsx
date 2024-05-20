import { Table } from '/src/components/Table';
import Box from '/src/components/organisms/dashboard/Box';
import Header from '../../../molecules/dashboard/Header';

interface OrderTableForPayinDetailProps {
  rows: any[];
  columns: any[];
  loading: boolean;
  headerProps: {
    title: string;
    clickOnButton?: () => void;
  };
}

export const OrderTableForPayinDetail = ({ rows, columns, loading, headerProps }: OrderTableForPayinDetailProps) => {
  const { title, clickOnButton } = headerProps || { title: '', clickOnButton: () => void 0 };
  return (
    <Box className="w-full pb-1 mt-6">
      <div className="pl-4">
        <div className="flex items-center justify-between py-4">
          <Header title={title} clickOnButton={clickOnButton} />
        </div>
      </div>
      <div>
        <Table
          columns={columns}
          data={rows || []}
          totalCount={rows?.length || 0}
          isLoading={loading}
          hideFooter
          hideSum
        />
      </div>
    </Box>
  );
};
