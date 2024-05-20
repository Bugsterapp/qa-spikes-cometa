import type { ButtonHTMLAttributes } from 'react';
import { cn } from '/src/utils/cn';

type GlobalSearchProps = {
  search: string;
  setSearch: (value: string) => void;
  placeholder: string;
  typeButton?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
};

export function GlobalSearch({ search, setSearch, placeholder, typeButton, className }: GlobalSearchProps) {
  return (
    <div className="relative flex items-center h-10">
      <div className="flex items-center pl-2">
        <svg
          className="absolute ml-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.31 15.9L20.71 19.29C20.8993 19.4778 21.0058 19.7334 21.0058 20C21.0058 20.2666 20.8993 20.5222 20.71 20.71C20.5222 20.8993 20.2666 21.0058 20 21.0058C19.7334 21.0058 19.4778 20.8993 19.29 20.71L15.9 17.31C14.5025 18.407 12.7767 19.0022 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19.0022 12.7767 18.407 14.5025 17.31 15.9ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5Z"
            fill="#919EAB"
          />
        </svg>
      </div>
      <input
        type="text"
        className={cn(
          'pl-10 border border-gray-300 text-[#1D2939] text-base rounded-md focus:ring-[#01AB55] hover:border-black focus:outline-none focus:border-[#01AB55] focus:shadow-green block w-full pr-3.5 py-3.5 min-w-[470px] outline-none placeholder:text-[#93A0AD]',
          className
        )}
        placeholder={placeholder}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <button
        className={cn('absolute flex justify-end right-0 mr-2 bg-white', {
          hidden: search.length === 0,
        })}
        type={typeButton}
        onClick={() => setSearch('')}
      >
        <svg className="" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.4086 11.9991L17.7045 7.71268C18.0962 7.32088 18.0962 6.68565 17.7045 6.29385C17.3127 5.90205 16.6776 5.90205 16.2859 6.29385L12 10.5903L7.71414 6.29385C7.3224 5.90205 6.68726 5.90205 6.29551 6.29385C5.90377 6.68565 5.90377 7.32088 6.29551 7.71268L10.5914 11.9991L6.29551 16.2856C6.10638 16.4732 6 16.7286 6 16.995C6 17.2614 6.10638 17.5168 6.29551 17.7044C6.4831 17.8936 6.73845 18 7.00483 18C7.27121 18 7.52656 17.8936 7.71414 17.7044L12 13.408L16.2859 17.7044C16.4734 17.8936 16.7288 18 16.9952 18C17.2616 18 17.5169 17.8936 17.7045 17.7044C17.8936 17.5168 18 17.2614 18 16.995C18 16.7286 17.8936 16.4732 17.7045 16.2856L13.4086 11.9991Z"
            fill="#212B36"
          />
        </svg>
      </button>
    </div>
  );
}
