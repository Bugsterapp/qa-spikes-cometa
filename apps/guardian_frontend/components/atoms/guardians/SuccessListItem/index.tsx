interface SuccessListItemProps {
  title: string;
  price: string;
}

const SuccessListItem = ({ title, price }: SuccessListItemProps) => (
  <div className="flex flex-row justify-between">
    <span className="text-left text-sm text-gray-700">{title}</span>
    <span className="text-right text-sm text-gray-700">{price}</span>
  </div>
);

export default SuccessListItem;
