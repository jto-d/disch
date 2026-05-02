type Props = { onClick: () => void };

export function BackButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="bg-transparent border-0 cursor-pointer p-1 text-fg2 inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-[10px]"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12 15L7 10L12 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
