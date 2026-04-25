import { CreditCard, Clock } from "lucide-react";

export function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
          <CreditCard className="w-8 h-8 text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Track and manage all your payment records in one place. This feature
          is currently under development and will be available soon.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}