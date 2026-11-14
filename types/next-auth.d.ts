import type { DefaultSession } from "next-auth";
import type { RoleValue } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleValue;
    } & DefaultSession["user"];
  }

  interface User {
    role: RoleValue;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleValue;
  }
}
