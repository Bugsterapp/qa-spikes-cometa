import type { StudentConceptDetailSerializerV2 } from '@cometa/trpc/src/types';
import type { Dispatch, SetStateAction } from 'react';
import ConceptInfo from '../ConceptInfo';
import ConceptInfoSkeleton from '../ConceptInfo/ConceptInfoSkeleton';
import ConceptScholarshipsAccordion from '../ConceptScholarshipsAccordion';
import ConceptSelectOrdersAccordion from '../ConceptSelectOrdersAccordion';
import type { ISelectedOrders } from '/src/components/organisms/dashboard/ConceptAssignmentEdit';

interface ConceptDataProps {
  concept: StudentConceptDetailSerializerV2 | undefined;
  selectedOrders: ISelectedOrders[];
  setSelectedOrders: Dispatch<SetStateAction<ISelectedOrders[]>>;
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
    <div className="pb-8">
      <ConceptInfo conceptData={concept} isOptional={concept.orders.some((order) => order.optional)} />
      <div className="flex flex-col gap-9 mt-6 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-300 [&>*:not(:last-child)]:pb-9">
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
              isOptional={concept.orders.some((order) => order.optional)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptData;
