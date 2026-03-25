"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export const ClerkAuth = () => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <SignInButton mode="redirect">
        <button className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
          Sign in
        </button>
      </SignInButton>
    );
  }

  return <UserButton />;
};