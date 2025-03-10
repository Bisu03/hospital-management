import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User.models"; // Your Mongoose User model
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: {
          label: "Username or Email:",
          type: "text",
          placeholder: "your-cool-username or your-email@example.com",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-awesome-password",
        },
      },
      async authorize(credentials) {
        // Ensure credentials are not missing
        if (!credentials.usernameOrEmail || !credentials.password) {
          throw new Error("Missing credentials");
        }

        // Connect to MongoDB
        await connectDB();

        // Check if the input is an email or a username
        const isEmail = credentials.usernameOrEmail.includes("@");

        // Query user by either email or username
        const user = await User.findOne(
          isEmail
            ? { email: credentials.usernameOrEmail } // Search by email
            : { username: credentials.usernameOrEmail } // Search by username
        );

        // Check if user exists
        if (!user) {
          throw new Error("No user found with that username or email");
        }

        // Validate password using bcrypt
        const isCorrectPass = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPass) {
          throw new Error("Invalid password");
        }

        // Return the user object
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role, // Include role
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add all required user properties to the token
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add all properties from token to session.user
      if (session.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin", // Custom sign-in page (optional)
  },
};
