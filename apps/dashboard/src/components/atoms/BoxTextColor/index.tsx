interface BoxTextColorProps {
  text: string | number;
  status?: 'success' | 'error';
}

const BoxTextColor = ({ text, status = 'success' }: BoxTextColorProps) => {
  const colors = {
    success: {
      bgcolor: 'bg-[#54D62C1F]',
      textcolor: 'text-[#229A16]',
    },
    error: {
      bgcolor: 'bg-[#FF48421F]',
      textcolor: 'text-[#FF4842]',
    },
  };
  const colorSelected = colors[status];
  return (
    <div
      className={`${colorSelected.bgcolor} ${colorSelected.textcolor} font-bold text-xs px-2 h-6 rounded-md flex items-center w-fit whitespace-nowrap`}
    >
      {text}
    </div>
  );
};

export default BoxTextColor;
