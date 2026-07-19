import { Link, useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { data: user, error } = useGetMe({ query: { retry: false } });
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAuthed = user && !error;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Ethos Scan
            </span>
          </Link>

          <AnimatePresence>
            {scrolled && location === "/" && (
              <motion.form
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSearch}
                className="hidden md:flex relative items-center"
              >
                <div className="relative overflow-hidden rounded-full bg-white border border-border shadow-sm flex items-center px-4 py-2 w-64">
                  <Search className="w-4 h-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a product..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Auth actions */}
        <nav className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <span className="text-sm font-medium text-foreground hidden sm:inline-block bg-secondary px-4 py-1.5 rounded-full">
                👋 {user.displayName}
              </span>
              <Button variant="outline" onClick={handleLogout} className="text-sm rounded-full px-5 border-border">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="text-sm rounded-full px-5 border-border font-medium">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="text-sm rounded-full px-5 font-medium shadow-sm">
                <Link href="/onboarding">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
