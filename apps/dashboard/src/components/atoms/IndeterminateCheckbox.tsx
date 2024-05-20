import { HTMLProps, useEffect, useRef } from 'react';

function IndeterminateCheckbox({
  indeterminate,
  id,
  disabled,
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <div className="px-4 py-1 flex items-center justify-center m-auto">
      <label htmlFor={`table-check-${id}`}>
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`table-check-${id}`}
            className="opacity-0 absolute h-12 w-12 disabled:border-gray-500 peer/table-check disabled:cursor-not-allowed"
            ref={ref}
            disabled={disabled}
            {...rest}
          />
          <div
            className={`peer-checked/table-check:bg-[#00AB55] ${
              disabled ? 'border-gray-500 cursor-not-allowed' : 'border-[#212B36]'
            } peer-checked/table-check:border-white text-white border-2 rounded-md w-6 h-6 flex flex-shrink-0 justify-center items-center`}
          >
            <svg
              className="hidden w-2.5 h-2.5 pointer-events-none fill-current"
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 10 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.80117 1.64605L4.23117 7.64605C4.04238 7.8913 3.75067 8.0353 3.44117 8.03605C3.13339 8.03771 2.84199 7.89754 2.65117 7.65605L0.211172 4.54605C-0.00854665 4.26381 -0.0610016 3.88579 0.0735661 3.55439C0.208134 3.22299 0.50928 2.98855 0.863566 2.93939C1.21785 2.89023 1.57145 3.03381 1.79117 3.31605L3.42117 5.39605L7.20117 0.396049C7.4191 0.110236 7.77296 -0.0376002 8.12945 0.00822824C8.48593 0.0540567 8.79089 0.286587 8.92945 0.618228C9.068 0.949869 9.0191 1.33024 8.80117 1.61605V1.64605Z"
                className="fill-current"
              />
            </svg>
          </div>
        </div>
      </label>
    </div>
  );
}

export default IndeterminateCheckbox;
