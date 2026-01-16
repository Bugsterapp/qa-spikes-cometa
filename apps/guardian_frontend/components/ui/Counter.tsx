interface CounterProps {
  counter?: number;
  subtractionIsDisabled?: boolean;
  additionIsDisabled?: boolean;
  onClickCounter: (updatedCounter: number) => void;
}

export const Counter = ({ counter = 1, subtractionIsDisabled, additionIsDisabled, onClickCounter }: CounterProps) => (
  <div className="flex flow-row justify-between items-center w-[95px] h-[32px] bg-[#4D5FFE] rounded-xl">
    <button
      className="w-[30px] bg-[#4D5FFE] hover:opacity-90 text-center font-light text-[19px] pl-2 rounded-xl text-[#FFFFFF]"
      disabled={subtractionIsDisabled}
      onClick={() => onClickCounter(counter - 1)}
    >
      -
    </button>
    <span className="block font-medium text-[16px] py-1 text-[#FFFFFF]">{counter}</span>
    <button
      className="w-[30px] bg-[#4D5FFE] hover:opacity-90 text-center font-light text-[19px] pr-2 rounded-xl text-[#FFFFFF]"
      disabled={additionIsDisabled}
      onClick={() => onClickCounter(counter + 1)}
    >
      +
    </button>
  </div>
);
