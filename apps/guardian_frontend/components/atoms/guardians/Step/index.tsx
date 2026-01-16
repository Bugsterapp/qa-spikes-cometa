interface StepProps {
  number: number | string;
  description: string;
}

export default function Step({ number, description }: StepProps) {
  return (
    <div className="flex">
      <div className="bg-[#D6E4FF] rounded-full flex justify-center items-center w-10 h-10 p-0.5 mr-2">
        <span className="text-[#3366FF] text-base">{number}</span>
      </div>
      <p className="text-[#637381] text-sm font-medium mb-4">{description}</p>
    </div>
  );
}
