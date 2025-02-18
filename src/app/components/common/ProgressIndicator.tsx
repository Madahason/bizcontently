import { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  progress: number;
  total: number;
  startTime?: number;
  label?: string;
  showEstimatedTime?: boolean;
}

export default function ProgressIndicator({
  progress,
  total,
  startTime,
  label = "Processing...",
  showEstimatedTime = true,
}: ProgressIndicatorProps) {
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!startTime || !showEstimatedTime || progress === 0) {
      setEstimatedTimeRemaining(null);
      return;
    }

    const elapsed = Date.now() - startTime;
    const progressPercent = progress / total;
    if (progressPercent === 0) return;

    const estimatedTotal = elapsed / progressPercent;
    const remaining = estimatedTotal - elapsed;
    setEstimatedTimeRemaining(remaining);
  }, [progress, total, startTime, showEstimatedTime]);

  const progressPercent = Math.min(100, (progress / total) * 100);

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">{Math.round(progressPercent)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Estimated Time */}
      {showEstimatedTime && estimatedTimeRemaining !== null && (
        <div className="text-right text-sm text-gray-500">
          Estimated time remaining: {formatTime(estimatedTimeRemaining)}
        </div>
      )}
    </div>
  );
}
