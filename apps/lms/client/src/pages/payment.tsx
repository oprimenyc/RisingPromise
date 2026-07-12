import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-boundary';
import { CreditCard, Shield, CheckCircle, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

interface PaymentFormData {
  courseId: string;
  amount: number;
  paymentMethod: 'card' | 'wioa';
  caseWorkerName?: string;
  programCode?: string;
}

export default function Payment() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PaymentFormData>({
    courseId: 'comptia-tech-plus',
    amount: 8500,
    paymentMethod: 'wioa'
  });

  // Payment processing mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (data.paymentMethod === 'wioa') {
        return await apiRequest('/api/payments/wioa-enrollment', {
          method: 'POST',
          body: {
            courseId: data.courseId,
            caseWorkerName: data.caseWorkerName,
            programCode: data.programCode || 'WIOA-CT-2024',
            fundingAmount: data.amount
          }
        });
      } else {
        return await apiRequest('/api/payments/process', {
          method: 'POST',
          body: {
            courseId: data.courseId,
            amount: data.amount,
            paymentMethod: data.paymentMethod
          }
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Success!",
        description: data.message || "Enrollment completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.paymentMethod === 'wioa' && !formData.caseWorkerName) {
      toast({
        title: "Missing Information",
        description: "Case worker name is required for WIOA funding",
        variant: "destructive",
      });
      return;
    }
    
    paymentMutation.mutate(formData);
  };

  if (authLoading) return <LoadingScreen message="Loading payment options..." />;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error="Please log in to access payment options" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl" data-testid="payment-page">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Course Enrollment & Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Complete your enrollment in the CompTIA Tech+ certification program
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>CompTIA Tech+ Training Program</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Program Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="ml-2 font-medium">6 months</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Certification:</span>
                  <span className="ml-2 font-medium">CompTIA Tech+</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Format:</span>
                  <span className="ml-2 font-medium">Online + Hands-on Labs</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Support:</span>
                  <span className="ml-2 font-medium">AI Tutor + Career Services</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Funding Method</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wioa"
                    checked={formData.paymentMethod === 'wioa'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'wioa' })}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'wioa' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">WIOA Funding</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Government funded</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'card' })}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">Credit Card</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay directly</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* WIOA Specific Fields */}
            {formData.paymentMethod === 'wioa' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">WIOA Information</h4>
                
                <div>
                  <Label htmlFor="caseWorkerName">Case Worker Name *</Label>
                  <Input
                    id="caseWorkerName"
                    value={formData.caseWorkerName || ''}
                    onChange={(e) => setFormData({ ...formData, caseWorkerName: e.target.value })}
                    placeholder="Enter your case worker's name"
                    required
                    data-testid="input-case-worker"
                  />
                </div>

                <div>
                  <Label htmlFor="programCode">Program Code</Label>
                  <Input
                    id="programCode"
                    value={formData.programCode || 'WIOA-CT-2024'}
                    onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                    placeholder="WIOA-CT-2024"
                    data-testid="input-program-code"
                  />
                </div>
              </div>
            )}

            {/* Pricing Information */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Total Investment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.paymentMethod === 'wioa' ? 'Government funded training' : 'Professional certification program'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {formData.amount.toLocaleString()}
                    </span>
                  </div>
                  {formData.paymentMethod === 'wioa' && (
                    <p className="text-sm text-green-700 dark:text-green-400">No cost to you</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={paymentMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                data-testid="button-submit-payment"
              >
                {paymentMutation.isPending ? (
                  'Processing...'
                ) : formData.paymentMethod === 'wioa' ? (
                  'Complete WIOA Enrollment'
                ) : (
                  'Process Payment & Enroll'
                )}
              </Button>

              <div className="text-center">
                <Link href="/">
                  <Button variant="outline" data-testid="button-back-home">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Secure enrollment process</span>
              </div>
              <p>Your information is protected and encrypted</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}