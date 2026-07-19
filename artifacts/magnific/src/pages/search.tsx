import { useLocation } from "wouter";
import { useState } from "react";
import { useSearchProducts } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export function SearchPage({ query }: { query?: string }) {
  const [location, setLocation] = useLocation();
  const [q, setQ] = useState(query || "");

  const { data: products, isLoading } = useSearchProducts(
    { q: query || "" },
    { query: { enabled: !!query } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      setLocation(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 px-6 pb-20 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSearch} className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a product or brand..."
            className="w-full pl-12 pr-6 py-6 rounded-2xl text-lg bg-white shadow-sm border-border"
          />
          <Button type="submit" className="absolute right-2 top-2 bottom-2 rounded-xl px-6">
            Search
          </Button>
        </form>

        {query && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Results for "{query}"
            </h1>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-24 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid gap-4">
                {products.map(product => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a className="block bg-white p-4 md:p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <div className="w-16 h-16 rounded-xl bg-secondary/50 flex-shrink-0 overflow-hidden border border-border">
                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-secondary/50 flex flex-col justify-center items-center flex-shrink-0 text-muted-foreground border border-border">
                             <div className="w-6 h-1 rounded-sm bg-muted-foreground/30 mb-1" />
                             <div className="w-4 h-6 rounded-sm bg-muted-foreground/20" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground mb-1">{product.brand}</p>
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{product.name}</h3>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {product.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-border">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">We couldn't find anything matching "{query}".</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
