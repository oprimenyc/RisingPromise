import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen, LoadingCard } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-boundary';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Mail, 
  FileText,
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [submitEmail, setSubmitEmail] = useState('fl.wioa.reports@yourdomain.com');

  // Fetch compliance status
  const { data: complianceStatus, isLoading: statusLoading, error: statusError } = useQuery({
    queryKey: ['/api/admin/compliance-status'],
    enabled: !!user,
  });

  // Fetch WIOA reports
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['/api/wioa/reports'],
    enabled: !!user,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportPeriod: string) => {
      const response = await fetch('/api/wioa/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportPeriod }),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wioa/reports'] });
      toast({
        title: "Success",
        description: "WIOA report generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async ({ reportId, emailAddress }: { reportId: string; emailAddress: string }) => {
      const response = await fetch('/api/wioa/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, emailAddress }),
      });
      if (!response.ok) throw new Error('Failed to submit report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wioa/reports'] });
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
      setSelectedReportId('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  if (authLoading) return <LoadingScreen message="Loading admin dashboard..." />;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Access denied. Please log in to view the admin dashboard." />
      </div>
    );
  }

  const currentQuarter = `Q${Math.ceil(new Date().getMonth() / 3)}-${new Date().getFullYear()}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            WIOA compliance monitoring and reporting
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => generateReportMutation.mutate(currentQuarter)}
            disabled={generateReportMutation.isPending}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            data-testid="button-generate-report"
          >
            <FileText className="w-4 h-4" />
            <span>{generateReportMutation.isPending ? 'Generating...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      {/* Compliance Status Cards */}
      {statusLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <LoadingCard key={i} />)}
        </div>
      ) : statusError ? (
        <ErrorMessage error="Failed to load compliance status" />
      ) : complianceStatus ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-total-students">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(complianceStatus as any)?.totalStudents || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-active-students">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(complianceStatus as any)?.activeStudents || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-compliance-score">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(complianceStatus as any)?.complianceScore || 0}%
                </p>
              </div>
              {((complianceStatus as any)?.complianceScore || 0) >= 90 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" data-testid="card-completed-students">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(complianceStatus as any)?.completedStudents || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Reports Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">WIOA Reports</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate and submit compliance reports
          </p>
        </div>

        <div className="p-6">
          {reportsLoading ? (
            <LoadingCard />
          ) : reportsError ? (
            <ErrorMessage error="Failed to load reports" />
          ) : reports && Array.isArray(reports) && reports.length > 0 ? (
            <div className="space-y-4">
              {(reports as any[]).map((report: any) => (
                <div 
                  key={report.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  data-testid={`report-${report.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Report {report.reportPeriod}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>Total Students: {report.totalStudents}</span>
                          <span>Active: {report.activeStudents}</span>
                          <span>Completed: {report.completedStudents}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Generated: {new Date(report.reportDate).toLocaleDateString()}</span>
                          {report.submittedAt && (
                            <>
                              <span>•</span>
                              <span>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      {!report.submittedAt && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={submitEmail}
                            onChange={(e) => setSubmitEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                            data-testid="input-submit-email"
                          />
                          <button
                            onClick={() => submitReportMutation.mutate({ reportId: report.id, emailAddress: submitEmail })}
                            disabled={submitReportMutation.isPending || !submitEmail}
                            className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm transition-colors"
                            data-testid={`button-submit-${report.id}`}
                          >
                            <Mail className="w-4 h-4" />
                            <span>Submit</span>
                          </button>
                        </div>
                      )}
                      
                      {report.submittedAt && (
                        <span className="inline-flex items-center space-x-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No reports generated yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Click "Generate New Report" to create your first WIOA compliance report
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}