export default function LoadingSpinner() {
  return (
    <div
      className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent text-white"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
