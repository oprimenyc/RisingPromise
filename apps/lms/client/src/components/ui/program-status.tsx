import { CheckCircle, ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface ProgramStatusProps {
  user: {
    fundingType?: 'WIOA' | 'Private';
    email?: string;
    firstName?: string;
  } | null;
  isLoading?: boolean;
}

export function ProgramStatus({ user, isLoading }: ProgramStatusProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-program-status">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-program-status">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Authentication Required
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please log in to view your program status
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isWIOAFunded = user.fundingType === 'WIOA';
  const isPrivatePay = user.fundingType === 'Private';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-program-status">
      <div className="flex items-center space-x-3">
        {isWIOAFunded ? (
          <>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enrollment Verified
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your program is active and fully funded.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    WIOA Approved
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • Government Funded Training
                </div>
              </div>
            </div>
          </>
        ) : isPrivatePay ? (
          <>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enrollment Active
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You have full access to the program.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Premium Access
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • All Features Available
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enrollment Pending
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your enrollment is being processed.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                    Processing
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • Please contact support if this persists
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Additional Program Information */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Student ID:</span>
            <div className="font-mono text-xs text-gray-700 dark:text-gray-300 mt-1">
              {user.email?.split('@')[0] || 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Program:</span>
            <div className="font-medium text-gray-900 dark:text-white mt-1">
              CompTIA Tech+ Foundation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}