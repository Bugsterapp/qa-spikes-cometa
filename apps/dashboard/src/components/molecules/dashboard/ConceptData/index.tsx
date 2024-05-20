import ConceptInfo from '../ConceptInfo';
import { Divider, Stack } from '@mui/material';
import ConceptScholarshipsAccordion from '../ConceptScholarshipsAccordion';
import ConceptSelectOrdersAccordion from '../ConceptSelectOrdersAccordion';
import ConceptInfoSkeleton from '../ConceptInfo/ConceptInfoSkeleton';
import { ConceptAssignment } from '/types/paid-orders';
import { Dispatch, SetStateAction } from 'react';

interface ConceptDataProps {
  concept: ConceptAssignment | undefined;
  selectedOrders: any[];
  setSelectedOrders: Dispatch<SetStateAction<any[]>>;
  changeOrders?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const ConceptData = ({
  concept,
  selectedOrders,
  setSelectedOrders,
  isLoading = true,
  isEdit = false,
  changeOrders,
}: ConceptDataProps) => {
  const scholarships = concept?.scholarships;
  if (isLoading || !concept) return <ConceptInfoSkeleton />;
  return (
    <div>
      <ConceptInfo conceptData={concept} isOptional={concept.orders.every((order) => order.dueDate === null)} />
      <Stack divider={<Divider />} spacing={4.5} className="mt-6">
        {scholarships && !!scholarships.length && (
          <div>
            <ConceptScholarshipsAccordion scholarships={scholarships} price={concept.price} />
          </div>
        )}
        {concept?.orders.length && selectedOrders?.length && (
          <div id="concept-select-orders">
            <ConceptSelectOrdersAccordion
              orders={concept.orders}
              selectedOrders={selectedOrders}
              setSelectedOrders={setSelectedOrders}
              changeOrders={changeOrders}
              isEdit={isEdit}
              onEditState
              isOptional={concept.orders.every((order) => order.dueDate === null)}
            />
          </div>
        )}
      </Stack>
    </div>
  );
};

export default ConceptData;
