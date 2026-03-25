"use client";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-light tracking-[0.2em] uppercase dark:text-slate-100">
        <img className="w-10 h-10 rounded-lg" src="/title.png" alt="Logo" />
      </h2>
    </div>
  );
};