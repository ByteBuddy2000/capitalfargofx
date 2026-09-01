import { NextResponse } from 'next/server';

export type RouteErrorResponse = {
  message: string;
  status: number;
};

export function errorResponse(message: string, status = 500): NextResponse<RouteErrorResponse> {
  return NextResponse.json({ message, status }, { status });
}

export function handleRouteError(error: unknown): NextResponse<RouteErrorResponse> {
  console.error(error);

  if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
    return errorResponse('Invalid request data.', 400);
  }

  if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
    return errorResponse('A record with that value already exists.', 409);
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number((error as { status?: number }).status ?? 500);
    const message = (error as { message?: string }).message ?? 'Internal server error.';
    return errorResponse(message, Number.isFinite(status) ? status : 500);
  }

  return errorResponse('Internal server error.', 500);
}
