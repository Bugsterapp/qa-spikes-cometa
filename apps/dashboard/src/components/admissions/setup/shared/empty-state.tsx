type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-full px-7 ${className}`}>
      {icon ? <div className="w-6 h-6 mb-6">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">{title}</h3>
      <p className="text-sm text-neutral-700 text-center px-1">{description}</p>
    </div>
  );
}

export function EmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_300_8268)">
        <path
          d="M23.811 11.989L22.143 3.981C21.755 2.121 20.335 0.689 18.566 0.198C18.403 0.083 17.425 0 17.247 0H6.752C6.574 0 5.597 0.082 5.434 0.197C3.665 0.688 2.245 2.119 1.857 3.98L0.189 11.989C0.064 12.591 0 13.209 0 13.825V19C0 21.757 2.243 24 5 24H19C21.757 24 24 21.757 24 19V13.825C24 13.211 23.937 12.594 23.811 11.989ZM20.185 4.388L21.771 12H19.835L19.001 7.41V2.581C19.59 3.009 20.03 3.639 20.186 4.388H20.185ZM17 6H7V2H17V6ZM6.925 8H17.075L17.802 12H6.198L6.925 8ZM3.815 4.388C3.971 3.639 4.41 3.008 5 2.581V7.41L4.165 12H2.229L3.815 4.388ZM19 22H5C3.346 22 2 20.654 2 19V14H22V19C22 20.654 20.654 22 19 22ZM15 18C15 18.552 14.553 19 14 19H10C9.448 19 9 18.552 9 18C9 17.448 9.448 17 10 17H14C14.553 17 15 17.448 15 18Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_300_8268">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
