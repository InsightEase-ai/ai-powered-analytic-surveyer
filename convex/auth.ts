import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account", // 👈 This forces the Google account selection screen
          access_type: "offline",
        },
      },
    }),
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.fullName as string, // maps fullName from sign-up form → name field
          role: params.role as string, // maps role from sign-up form → role field
        };
      },
    }),
  ],
});
