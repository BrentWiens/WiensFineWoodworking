import { redirect } from 'next/navigation';

// The business tools are listed on /tools alongside the public ones; there's no
// separate hub page yet.
export default function BusinessToolsIndex() {
  redirect('/tools#business-tools');
}
