export const HomeMain = () => {
  return (
    <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-accent-gold/20 blur-3xl rounded-full"></div>
        <div 
          className="relative bg-center bg-no-repeat aspect-square bg-cover border-2 border-black p-1 rounded-xl size-24 mb-6 shadow-2xl shadow-accent-gold/10"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDx6zchaQndLRrkFyaHI2jANxauyf6rVsQIuH3UMWTy3VIgHzspRvuJXA2i3vHB5Wb5oskOO6orHO5eY_MLcqnNi5MmzfqDyH8WKfxZVFyvOQBJm7liCpRR2JVIOB8IZ4XmHN6_a5NdOsP3jcbHus6rmoPnu5M0g5eFTSvtdI9Wn9VYtvijwKDEvS72IX_INMWuTVQ040FtIGasw-5C2ImNywFyRJqVkc2onuWzekAUAOuAplquNzEGfVbuw7ZU9WSBCHXQHX5rwfej")' }}
        ></div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight dark:text-white text-black leading-tight">
          Welcome to the pinnacle of <br/>
          <span className="gold-gradient-text font-medium">personalized shopping.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-light max-w-xl mx-auto tracking-wide">
          Your digital concierge is ready. Describe your desires, and we shall curate the exceptional for you.
        </p>
      </div>
    </div>
  );
};  