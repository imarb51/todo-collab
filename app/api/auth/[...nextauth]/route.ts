import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"

// Initialization checks happen silently now

// Create the adapter with a try-catch to handle potential errors
let adapter;
try {
  if (prisma) {
    adapter = PrismaAdapter(prisma);
  } else {
    console.error("Prisma client is undefined");
  }
} catch (error) {
  console.error("Error initializing PrismaAdapter:", error);
}

export const authOptions: NextAuthOptions = {
  adapter,
  session: {
    strategy: "jwt", // Use JWT as a fallback even if adapter is available
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            // User not found
            return null;
          }
          
          // Use type assertion to tell TypeScript that user has hashedPassword
          const userWithPassword = user as typeof user & { hashedPassword?: string };
          
          if (!userWithPassword.hashedPassword) {
            // No password set for this user
            return null;
          }

          const passwordMatch = await compare(
            credentials.password,
            userWithPassword.hashedPassword
          );

          if (!passwordMatch) {
            // Password doesn't match
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          };
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      }
    }),
  ],
  debug: false, // Disabled debug mode to reduce console output
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // If the user has just signed in, add their ID to the token
      if (user && user.id) {
        token.sub = user.id.toString(); // Ensure it's a string
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        // Add the user ID from the token sub field or user.id if available
        session.user.id = token.sub || user?.id || 'unknown-id';
        
        // You can also add other user properties if needed
        session.user.email = token.email || user?.email || session.user.email;
        session.user.name = token.name || user?.name || session.user.name;
        session.user.image = token.picture || user?.image || session.user.image;
      }
      
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
  // Always allow Google sign-in
  if (account?.provider === 'google') {
    return true;
  }
  
  // For any other provider (which we don't use currently)
  if (!user.email) {
    return false;
  }

      return true;
    },
    async redirect({ url, baseUrl }) {
  // If the URL is a relative URL (starts with /)
  if (url.startsWith("/")) {
    // For dashboard routes, ensure we go to the dashboard
    if (url.includes("/dashboard")) {
      return `${baseUrl}/dashboard`;
    }

      return `${baseUrl}${url}`;
      } 
      // If the URL is from the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Default fallback to baseUrl
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }