import { redirect } from 'next/navigation';

// Redirect legacy /api/user calls to /api/auth/me
export async function GET() {
  redirect('/api/auth/me');
}

export async function POST() {
  redirect('/api/auth/me');
}
