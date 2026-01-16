export function CircleIcon({ fillColor, children }: { fillColor: string; children?: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22.2C17.6333 22.2 22.2 17.6333 22.2 12C22.2 6.3667 17.6333 1.8 12 1.8C6.3667 1.8 1.8 6.3667 1.8 12C1.8 17.6333 6.3667 22.2 12 22.2ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill={fillColor}
      />
      {children}
    </svg>
  );
}

export function PendingIcon() {
  return <CircleIcon fillColor="#E4EBF6" />;
}

export function CompletedIcon() {
  return (
    <CircleIcon fillColor="#28C441">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.643 8.60924C17.045 8.96756 17.0804 9.5839 16.7221 9.98588L11.1021 16.2907L7.7664 13.2737C7.36702 12.9125 7.3361 12.2959 7.69732 11.8966C8.05854 11.4972 8.67512 11.4663 9.07449 11.8275L10.9534 13.5269L15.2664 8.6883C15.6247 8.28632 16.2411 8.25092 16.643 8.60924Z"
        fill="#28C441"
      />
    </CircleIcon>
  );
}

export function PartialCompletedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 8.93848C8 8.93848 10 8.93848 14.8 8.93848C14.8 5.18294 11.7555 2.13848 8 2.13848C4.24446 2.13848 1.2 5.18294 1.2 8.93848C7 8.93848 8 8.93848 8 8.93848ZM8 16.9385C12.4183 16.9385 16 13.3568 16 8.93848C16 4.5202 12.4183 0.938477 8 0.938477C3.58172 0.938477 0 4.5202 0 8.93848C0 13.3568 3.58172 16.9385 8 16.9385Z"
        fill="#E8B006"
      />
    </svg>
  );
}
