import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID from the OAuth provider */
      id: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    externalId?: string
    hashedPassword?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's unique ID from the OAuth provider */
    sub: string
    email?: string
    name?: string
    picture?: string
  }
}