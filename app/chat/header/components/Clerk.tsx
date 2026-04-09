"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export const ClerkAuth = ({ collapsed }: { collapsed: boolean }) => {
  const { isSignedIn, user } = useUser();


  const name =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  if (!isSignedIn) {
    return (
      <SignInButton mode="redirect">
        <button
          className={`
            flex items-center rounded-xl py-2 transition
            hover:bg-black/5 dark:hover:bg-white/10

            ${collapsed ? "justify-center px-2" : "gap-2 px-3 w-full"}
          `}
        >
          👤
          {!collapsed && <span className="text-sm">Sign in</span>}
        </button>
      </SignInButton>
    );
  }

  return (
    <div
      className={`
        group relative flex items-center rounded-xl py-2
        hover:bg-black/5 dark:hover:bg-white/10 transition
        ${collapsed ? "justify-center px-2" : "gap-2 px-3 w-full"}
      `}
    >
   
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />

  
      {!collapsed && (
        <div className="flex flex-col ">
          <div className="text-xs font-semibold ">{name}</div>

          <div className="text-[11px] opacity-70 break-words">
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
        </div>
      )}

      {/* 🔥 TOOLTIP (collapsed үед) */}
      {collapsed && (
        <div
          className="
      pointer-events-none
      absolute left-full ml-3 top-1/2 -translate-y-1/2
      bg-black/90 text-white
      dark:bg-white dark:text-black
      px-3 py-2 rounded-lg
      opacity-0 translate-x-[-6px]
      group-hover:opacity-100 group-hover:translate-x-0
      transition-all duration-200
      z-[9999]
      w-max max-w-[220px]
    "
        >
          <div className="flex flex-col ">
            <div className="text-xs font-semibold">{name}</div>

            <div className="text-[11px] opacity-70 break-words">
              {user?.emailAddresses?.[0]?.emailAddress}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
