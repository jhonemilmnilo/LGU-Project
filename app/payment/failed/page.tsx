import { redirect } from 'next/navigation';

export default function PaymentFailedPage() {
  // Legacy callback URL — redirect users to their requests listing (show the failed state there).
  redirect('/user/services/requests');
}
