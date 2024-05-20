import ReactPhoneInput, { PhoneInputProps } from 'react-phone-input-material-ui';

function PhoneField(props: PhoneInputProps) {
  return (
    <ReactPhoneInput {...props} placeholder={'+' + process.env.NEXT_PUBLIC_WHATSAPP_NUM} onlyCountries={['mx', 'us']} />
  );
}

export default PhoneField;
