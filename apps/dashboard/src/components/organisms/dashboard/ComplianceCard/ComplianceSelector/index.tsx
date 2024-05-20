import { Listbox } from '@headlessui/react';
import ExpandMoreOutlined from 'dashboard/public/assets/icons/ic_expand_more_md.svg';

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: Option;
  onchange: (value: Option) => void;
  options: Option[];
};

const ComplianceSelector = ({ value, onchange, options }: Props) => (
  <Listbox value={value} onChange={onchange}>
    <Listbox.Button className="flex justify-between min-w-[200px] border-b-2 font-bold border-white text-xl text-white relative bg-transparent whitespace-nowrap outline-none text-ellipsis max-w-[240px] overflow-hidden">
      {value.label}
      <ExpandMoreOutlined className="mt-2" />
    </Listbox.Button>
    <div className="relative transition-all duration-500 ease-in-out outline-none">
      <Listbox.Options className="absolute top-full min-w-[200px] w-full bg-white border border-solid border-primary shadow-lg z-40 outline-none overflow-auto rounded-lg py-2">
        {options.map((option: Option) => (
          <Listbox.Option key={option.label} value={option}>
            <span className="block truncate cursor-pointer px-3 py-2 hover:bg-gray-200">{option.label}</span>
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </div>
  </Listbox>
);

export default ComplianceSelector;
