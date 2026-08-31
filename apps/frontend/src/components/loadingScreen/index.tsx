type LoadingScreenProps = {
  className?: string;
};

export function LoadingScreen({
  className = "fixed inset-0 z-50",
}: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span className="text-md text-gray-600">Loading...</span>
      </div>
    </div>
  );
}
