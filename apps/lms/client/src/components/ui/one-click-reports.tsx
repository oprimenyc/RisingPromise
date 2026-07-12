import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Download, Send, CheckCircle, Mail, FileText, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OneClickReportsProps {
  reports: any[];
}

export function OneClickReports({ reports }: OneClickReportsProps) {
  const [submitEmail, setSubmitEmail] = useState('fl.wioa.reports@yourdomain.com');
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      setGeneratingReport(true);
      return apiRequest('/api/admin/generate-wioa-report', { method: 'POST' });
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "WIOA compliance report has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wioa-reports'] });
      setGeneratingReport(false);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate WIOA report. Please try again.",
        variant: "destructive",
      });
      setGeneratingReport(false);
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async ({ reportId, emailAddress }: { reportId: string, emailAddress: string }) => {
      return apiRequest('/api/admin/submit-wioa-report', { 
        method: 'POST',
        body: { reportId, emailAddress }
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "WIOA report has been sent successfully via email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wioa-reports'] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit WIOA report via email. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">One-Click WIOA Reports</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate and submit compliance reports instantly
            </p>
          </div>
          <button
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending || generatingReport}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            data-testid="button-generate-report"
          >
            {generateReportMutation.isPending || generatingReport ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{generateReportMutation.isPending || generatingReport ? 'Generating...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Email Configuration */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Default Report Submission Email:
          </label>
          <input
            type="email"
            value={submitEmail}
            onChange={(e) => setSubmitEmail(e.target.value)}
            placeholder="Enter email for report submissions"
            className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            data-testid="input-default-email"
          />
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Reports will be automatically sent to this email address for compliance submissions.
          </p>
        </div>

        {/* Recent Reports */}
        {reports && Array.isArray(reports) && reports.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Reports</h3>
            {reports.map((report: any) => (
              <div 
                key={report.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                data-testid={`report-${report.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Report {report.reportPeriod}
                    </h4>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>Total Students: <strong>{report.totalStudents}</strong></span>
                        <span>Active: <strong>{report.activeStudents}</strong></span>
                        <span>Completed: <strong>{report.completedStudents}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Generated: {new Date(report.reportDate).toLocaleDateString()}</span>
                        {report.submittedAt && (
                          <>
                            <span>•</span>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Download Button */}
                    <a
                      href={`/api/admin/download-report/${report.id}`}
                      download
                      className="inline-flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      data-testid={`button-download-${report.id}`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>

                    {/* One-Click Submit Button */}
                    {!report.submittedAt ? (
                      <button
                        onClick={() => submitReportMutation.mutate({ reportId: report.id, emailAddress: submitEmail })}
                        disabled={submitReportMutation.isPending || !submitEmail}
                        className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded text-sm transition-colors"
                        data-testid={`button-submit-${report.id}`}
                      >
                        {submitReportMutation.isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>One-Click Submit</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-green-600 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded">
                        <CheckCircle className="w-4 h-4" />
                        <span>Submitted</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Compliance Summary */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completion Rate:</span>
                      <div className="font-medium text-blue-600">
                        {Math.round((report.completedStudents / report.totalStudents) * 100 || 0)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Active Rate:</span>
                      <div className="font-medium text-green-600">
                        {Math.round((report.activeStudents / report.totalStudents) * 100 || 0)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Report ID:</span>
                      <div className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {report.reportId.slice(-8)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <div className={`font-medium ${report.submittedAt ? 'text-green-600' : 'text-yellow-600'}`}>
                        {report.submittedAt ? 'Submitted' : 'Ready'}
                      </div>
                    </div>
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
  );
}