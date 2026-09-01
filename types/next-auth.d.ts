import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      _id?: string;
      name?: string | null;
      email: string;
      role: "USER" | "ADMIN";
      username?: string;
      fullName?: string;
      status?: "ACTIVE" | "SUSPENDED" | "BANNED";
      btcWallet?: string;
      ethWallet?: string;
      usdtWallet?: string;
      uplineUsername?: string | null;
    };
  }

  interface User {
    id: string;
    _id?: string;
    email: string;
    role: "USER" | "ADMIN";
    username?: string;
    fullName?: string;
    status?: "ACTIVE" | "SUSPENDED" | "BANNED";
    btcWallet?: string;
    ethWallet?: string;
    usdtWallet?: string;
    uplineUsername?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: "USER" | "ADMIN";
    username?: string;
    status?: "ACTIVE" | "SUSPENDED" | "BANNED";
  }
}