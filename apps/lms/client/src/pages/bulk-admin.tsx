import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-boundary';
import { Upload, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkResult {
  success: boolean;
  summary: {
    total: number;
    processed: number;
    failed: number;
  };
  results: Array<{
    email: string;
    success: boolean;
    userId?: string;
    enrollmentId?: string;
    error?: string;
  }>;
  errors: string[];
}

export default function BulkAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvContent, setCsvContent] = useState('');
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (csvData: string) => {
      return await apiRequest('/api/admin/bulk-import', {
        method: 'POST',
        body: { csvContent: csvData }
      });
    },
    onSuccess: (data) => {
      setBulkResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/compliance-status'] });
      toast({
        title: "Bulk Import Completed",
        description: `Processed ${data.summary.processed} users successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk Import Failed",
        description: error instanceof Error ? error.message : "Import operation failed",
        variant: "destructive",
      });
    },
  });

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImport = () => {
    if (!csvContent.trim()) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file or paste CSV data",
        variant: "destructive",
      });
      return;
    }
    bulkImportMutation.mutate(csvContent);
  };

  if (authLoading) return <LoadingScreen message="Loading admin panel..." />;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Admin access required" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="bulk-admin-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Bulk User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Import multiple users and enroll them in WIOA programs
        </p>
      </div>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-6 h-6 text-blue-600" />
            <span>CSV Data Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CSV Format Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your CSV file should include the following headers:
            </p>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
              email,firstname,lastname,courseid,wioafunding,caseworkername,programcode
            </code>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Required:</strong> email, firstname, lastname, courseid</p>
              <p><strong>Optional:</strong> wioafunding (defaults to 8500), caseworkername, programcode (defaults to WIOA-CT-2024)</p>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              data-testid="input-csv-file"
            />
          </div>

          {/* Or Manual Entry */}
          <div className="space-y-4">
            <Label htmlFor="csv-content">Or Paste CSV Content</Label>
            <Textarea
              id="csv-content"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="email,firstname,lastname,courseid,wioafunding,caseworkername,programcode
student1@example.com,John,Doe,comptia-tech-plus,8500,Sarah Johnson,WIOA-CT-2024
student2@example.com,Jane,Smith,comptia-tech-plus,8500,Sarah Johnson,WIOA-CT-2024"
              rows={8}
              className="font-mono text-sm"
              data-testid="textarea-csv-content"
            />
          </div>

          <Button
            onClick={handleBulkImport}
            disabled={bulkImportMutation.isPending || !csvContent.trim()}
            className="w-full"
            data-testid="button-bulk-import"
          >
            {bulkImportMutation.isPending ? (
              'Processing Import...'
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Import Users & Enroll
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {bulkResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-green-600" />
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{bulkResult.summary.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{bulkResult.summary.processed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{bulkResult.summary.failed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Detailed Results</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {bulkResult.results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                    data-testid={`result-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.email}</div>
                        {result.error && (
                          <div className="text-sm text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {result.success ? 'Enrolled' : 'Failed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors Summary */}
            {bulkResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Errors</h4>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {bulkResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}