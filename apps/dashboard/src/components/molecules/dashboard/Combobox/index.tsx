import { Combobox as HCombobox } from '@headlessui/react';

interface RootProps {
  children: JSX.Element;
  classNames: string;
  icon?: JSX.Element;
}

interface DefaultProps {
  children: JSX.Element;
  classNames: string;
}

interface InputProps {
  classNames: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface optionProps {
  children: JSX.Element;
  classNames?: string;
  value: any;
}

const Combobox = (props: DefaultProps) => <div>{props.children}</div>;

const Root = ({ classNames, icon, children }: RootProps) => (
  <HCombobox>
    <div className={classNames}>
      <>
        {icon && <span className="pr-2 pl-3 text-[#637381]">{icon}</span>}
        {children}
      </>
    </div>
  </HCombobox>
);

const Label = ({ classNames, children }: DefaultProps) => (
  <HCombobox.Label as="label" className={classNames}>
    {children}
  </HCombobox.Label>
);

const Input = ({ onChange, placeholder, classNames }: InputProps) => (
  <HCombobox.Input
    className={classNames}
    onChange={onChange}
    placeholder={placeholder ? placeholder : ''}
    autoComplete="off"
  />
);

const Options = ({ children, classNames }: DefaultProps) => (
  <HCombobox.Options as="div" className={classNames}>
    <ul className="overflow-y-auto">{children}</ul>
  </HCombobox.Options>
);

const Option = ({ children, classNames, value }: optionProps) => (
  <HCombobox.Option value={value} className={classNames}>
    <>{children}</>
  </HCombobox.Option>
);

Combobox.Root = Root;
Combobox.Label = Label;
Combobox.Input = Input;
Combobox.Options = Options;
Combobox.Option = Option;

export default Combobox;
