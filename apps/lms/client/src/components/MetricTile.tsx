import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";

interface MetricTileProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  progress?: number;
  progressLabel?: string;
  bgColor?: string;
  footer?: ReactNode;
  testId?: string;
}

export default function MetricTile({
  title,
  value,
  subtitle,
  icon,
  progress,
  progressLabel,
  bgColor = "bg-gray-50 dark:bg-gray-800",
  footer,
  testId
}: MetricTileProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      data-testid={testId}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`${testId}-value`}>
              {value}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{subtitle}</p>
          </div>
          <div className={`${bgColor} p-3 rounded-full`}>
            <div className="h-6 w-6 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>
        
        {(progress !== undefined || progressLabel) && (
          <div>
            {progress !== undefined && (
              <Progress value={progress} className="mb-1" />
            )}
            {progressLabel && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{progressLabel}</p>
            )}
          </div>
        )}
        
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}