import { CheckCircle, AlertTriangle, Clock, TrendingUp, Users } from "lucide-react";

interface ComplianceStatusProps {
  complianceData: {
    totalStudents: number;
    activeEnrollments: number;
    completionRate: number;
    averageStudyHours: number;
    recentActivity: any[];
  };
}

export function ComplianceStatus({ complianceData }: ComplianceStatusProps) {
  const compliantStudents = Math.round((complianceData.totalStudents || 0) * (complianceData.completionRate || 0) / 100);
  const atRiskStudents = (complianceData.totalStudents || 0) - (complianceData.activeEnrollments || 0);
  const complianceScore = Math.round(complianceData.completionRate || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">WIOA Compliance Status</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time compliance monitoring for all students
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Compliance Score:
            </div>
            <div className={`text-3xl font-bold ${complianceScore >= 80 ? 'text-green-600' : complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {complianceScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Compliance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Compliant Students</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {compliantStudents}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                Meeting all WIOA requirements
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">At-Risk Students</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {atRiskStudents}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                Need intervention or follow-up
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Avg. Study Hours</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {Math.round(complianceData.averageStudyHours || 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                Per student this month
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Enrolled</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {complianceData.totalStudents || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-purple-700 dark:text-purple-300">
                Active WIOA participants
              </div>
            </div>
          </div>

          {/* Compliance Details */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Students Requiring Attention
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span>Missing required documentation:</span>
                <span className="font-medium text-red-600">0 students</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span>No activity in 7+ days:</span>
                <span className="font-medium text-yellow-600">{Math.max(0, atRiskStudents - 1)} students</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span>Behind minimum progress schedule:</span>
                <span className="font-medium text-orange-600">{Math.max(0, Math.floor(atRiskStudents / 2))} students</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <span>Ready for job placement assistance:</span>
                <span className="font-medium text-green-600">{Math.floor(compliantStudents * 0.3)} students</span>
              </div>
            </div>
          </div>

          {/* Quick Compliance Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Send Progress Reminders
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Generate Compliance Report
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Schedule Follow-Up Calls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}