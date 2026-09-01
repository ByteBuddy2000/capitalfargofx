// /app/api/auth/[...nextauth]/route.ts
// NextAuth v5: use handlers from root auth.ts

import { handlers } from "@/auth";

export const { GET, POST } = handlers;