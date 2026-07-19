import { useParams } from "wouter";
import { useGetProduct, useAnalyzeProduct, useGetMe } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { ShieldAlert, CheckCircle2, AlertTriangle, Leaf, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: user } = useGetMe({ query: { retry: false } });
  
  const { data: product, isLoading: loadingProduct } = useGetProduct(
    id as string, 
    { query: { enabled: !!id } }
  );

  const { data: analysis, isLoading: loadingAnalysis } = useAnalyzeProduct(
    id as string,
    { query: { enabled: !!id && !!user } } // Only run analysis if logged in
  );

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
           <div className="w-full h-64 bg-white rounded-3xl mb-8 border border-border" />
           <div className="w-1/3 h-10 bg-white rounded-xl mb-4" />
           <div className="w-1/4 h-6 bg-white rounded-xl mb-12" />
           <div className="w-full h-32 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex flex-col items-center justify-center text-center px-6">
        <Navbar />
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">This product might not be in our database yet.</p>
        <Button asChild rounded-full><Link href="/">Go home</Link></Button>
      </div>
    );
  }

  const hasWarnings = analysis && analysis.warnings.length > 0;
  const isSafe = analysis ? analysis.isSafe : true;

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      <Navbar />
      
      <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-border mb-8 flex flex-col md:flex-row gap-8 items-start">
           {product.imageUrl ? (
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-secondary/30 flex-shrink-0 border border-border overflow-hidden p-2">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
             </div>
           ) : (
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-secondary/30 flex-shrink-0 border border-border flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-10 h-2 rounded-sm bg-muted-foreground/30 mb-2" />
                <div className="w-8 h-12 rounded-sm bg-muted-foreground/20" />
             </div>
           )}
           
           <div className="flex-1">
              <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">{product.name}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                 {product.category && (
                   <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg">
                     {product.category}
                   </span>
                 )}
                 {product.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 border border-border text-foreground text-sm font-medium rounded-lg">
                     {tag}
                   </span>
                 ))}
              </div>
           </div>
        </div>

        {/* Analysis Section */}
        {user ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Personalized Report</h2>
            
            {loadingAnalysis ? (
               <div className="h-32 bg-white rounded-3xl border border-border animate-pulse" />
            ) : analysis ? (
               <div className="space-y-6">
                  {/* Warning Banner */}
                  <AnimatePresence>
                    {hasWarnings && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-destructive/10 border-2 border-destructive p-6 rounded-3xl"
                      >
                         <div className="flex items-start gap-4 text-destructive mb-4">
                           <ShieldAlert className="w-8 h-8 shrink-0" />
                           <div>
                             <h3 className="text-xl font-bold">Not recommended</h3>
                             <p className="opacity-90">This product contains ingredients that conflict with your profile.</p>
                           </div>
                         </div>
                         
                         <div className="space-y-3 pl-12">
                            {analysis.warnings.map((warning, i) => (
                               <div key={i} className="bg-white/50 p-4 rounded-xl border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-destructive">{warning.ingredient}</p>
                                    <p className="text-sm text-destructive/80">{warning.reason}</p>
                                  </div>
                                  <span className="px-3 py-1 bg-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider rounded-full self-start sm:self-auto">
                                     {warning.severity} SEVERITY
                                  </span>
                               </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Safe Banner */}
                  <AnimatePresence>
                    {!hasWarnings && isSafe && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/10 border-2 border-primary p-6 rounded-3xl flex items-start gap-4 text-primary"
                      >
                         <CheckCircle2 className="w-8 h-8 shrink-0" />
                         <div>
                           <h3 className="text-xl font-bold">Looks good for you</h3>
                           <p className="opacity-90">We didn't find any of your listed allergens or avoided ingredients.</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tag Analysis */}
                  {analysis.tags && analysis.tags.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm">
                       <h3 className="text-lg font-semibold mb-4">Matched profile values</h3>
                       <div className="flex flex-wrap gap-3">
                          {analysis.tags.map((tag, i) => {
                            let icon = <Info className="w-4 h-4" />;
                            let colorClass = "bg-secondary text-secondary-foreground";
                            
                            if (tag.type === "positive") {
                               icon = <Leaf className="w-4 h-4" />;
                               colorClass = "bg-primary/15 text-primary border-primary/30";
                            } else if (tag.type === "warning") {
                               icon = <AlertTriangle className="w-4 h-4" />;
                               colorClass = "bg-accent/15 text-accent border-accent/30";
                            }
                            
                            return (
                              <span key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-transparent ${colorClass}`}>
                                 {icon} {tag.label}
                              </span>
                            );
                          })}
                       </div>
                    </div>
                  )}
               </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-lg mb-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
             <div className="relative z-10 max-w-xl">
               <h2 className="text-2xl font-bold mb-2">Want a personalized safety report?</h2>
               <p className="text-primary-foreground/80">Sign in to check this product against your specific allergies and dietary preferences.</p>
             </div>
             <div className="relative z-10 flex gap-3 w-full md:w-auto">
               <Button variant="secondary" asChild className="text-primary font-semibold rounded-xl flex-1 md:flex-none">
                 <Link href="/login">Sign in</Link>
               </Button>
               <Button variant="outline" asChild className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl flex-1 md:flex-none">
                 <Link href="/onboarding">Create profile</Link>
               </Button>
             </div>
          </div>
        )}

        {/* Raw Ingredients */}
        <div>
           <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Full Ingredient List
           </h2>
           <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm">
              <p className="font-mono text-sm leading-loose text-muted-foreground">
                {product.ingredients.map((ing, i) => {
                   // Highlight if it's a warning ingredient (only if analyzed)
                   const isWarning = analysis?.warnings.some(w => 
                     w.ingredient.toLowerCase() === ing.toLowerCase() || 
                     ing.toLowerCase().includes(w.ingredient.toLowerCase())
                   );
                   
                   if (isWarning) {
                      return (
                        <span key={i}>
                           <span className="font-bold text-destructive bg-destructive/10 px-1 rounded mx-0.5">{ing}</span>
                           {i < product.ingredients.length - 1 ? ", " : ""}
                        </span>
                      );
                   }
                   
                   return (
                     <span key={i}>
                        {ing}{i < product.ingredients.length - 1 ? ", " : ""}
                     </span>
                   );
                })}
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
