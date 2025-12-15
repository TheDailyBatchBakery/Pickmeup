import { Suspense } from 'react';
import ConfirmationContent from './ConfirmationContent';

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading confirmation...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
