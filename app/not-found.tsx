import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Title */}
        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          Page Not Found
        </h2>

        {/* Error Description */}
        <p className="mb-8 text-lg text-slate-400">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 font-semibold text-white hover:from-blue-700 hover:to-cyan-700 sm:w-auto"
            >
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              className="w-full border border-slate-600 px-8 py-3 font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-700/50 sm:w-auto"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 space-y-2 text-sm text-slate-500">
          <p>Need help? Contact us at support@capitalfargo.com</p>
        </div>
      </div>
    </div>
  );
}
