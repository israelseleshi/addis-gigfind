"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, DollarSign, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientPaymentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/client/payments');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'client') {
        router.push('/');
        return;
      }

      setCheckingAuth(false);
      fetchPayments(user.id);
    };

    checkAuth();
  }, [router, supabase]);

  const fetchPayments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          gig:gigs(title),
          freelancer:profiles!freelancer_id(full_name)
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPayments(data);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <p className="text-sm text-gray-500">Manage your payments to freelancers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold">{totalSpent.toLocaleString()} ETB</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{payments.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payments yet</p>
              <p className="text-sm">When you hire freelancers, payments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {payment.gig?.title || 'Gig Payment'}
                    </p>
                    <p className="text-sm text-gray-500">
                      To: {payment.freelancer?.full_name || 'Freelancer'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {Number(payment.amount).toLocaleString()} ETB
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How Payments Work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• When you hire a freelancer, you pay directly via Chapa</li>
          <li>• A 10% platform fee is added to the gig budget</li>
          <li>• Payments are processed securely through Chapa</li>
        </ul>
      </div>
    </div>
  );
}