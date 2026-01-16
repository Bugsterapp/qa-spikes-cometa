// ui components
import SuccessListItem from '~/components/atoms/guardians/SuccessListItem';

interface SuccessListItem {
  title: string;
  price: string;
}

interface SuccessListProps {
  total: string;
  items?: SuccessListItem[];
}

export const SuccessList = ({ total, items = [] }: SuccessListProps) => (
  <div className="w-[300px] max-h-[200px] overflow-auto">
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row justify-between">
        <span className="text-left text-base text-gray-700">Total pagado</span>
        <span className="text-right text-base text-gray-700">{total}</span>
      </div>
      {items.map((item, index) => (
        <SuccessListItem title={item.title} price={item.price} key={index} />
      ))}
    </div>
  </div>
);
