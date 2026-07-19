import { AnimatePresence, motion } from "framer-motion";
import { Search, CheckCircle2, ShieldAlert, Leaf, Check, Upload, X } from "lucide-react";
import heroVideoPath from "@assets/magnific_image-input-node-loading-_KjHcNKOkqp_1784375583552.mp4";
import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { scanState } from "@/lib/scan-state";

export function HomePage() {
  const { data: user, error } = useGetMe({ query: { retry: false } });
  const isAuthed = user && !error;
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMode, setInputMode] = useState<"search" | "upload">("search");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === "upload") {
      if (uploadedFile) {
        scanState.file = uploadedFile;
        scanState.imageUrl = URL.createObjectURL(uploadedFile);
        scanState.result = null;
        setLocation("/scan-result");
      }
      return;
    }
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">

      {/* Welcome banner — shown only when signed in */}
      <AnimatePresence>
        {isAuthed && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="bg-primary/10 border-b border-primary/15 px-6 py-3 text-center"
          >
            <span className="text-sm font-medium text-primary">
              Welcome back, <strong>{user.displayName}</strong> 👋
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1 — Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-10 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-60" />
           <div className="absolute top-1/2 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-40" />
           <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-secondary/60 rounded-full blur-2xl opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left"
          >
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Visualizing trust, verifying truth
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Know what's <br/><span className="text-primary italic font-serif font-light">really</span> in it.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Personalized safety reports for your food, cosmetics, and household products. Match ingredients against your allergies and values instantly.
            </p>
            
            {/* Search / Upload input */}
            <div className="w-full max-w-md">
              {/* Mode toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-full p-1 w-fit mb-3">
                <button
                  onClick={() => setInputMode("search")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                    inputMode === "search"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="w-3 h-3" /> Search
                </button>
                <button
                  onClick={() => setInputMode("upload")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                    inputMode === "upload"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative group">
                {inputMode === "search" ? (
                  <>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search a product…" 
                      className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-border shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    />
                    <Button type="submit" className="absolute right-2 top-2 bottom-2 rounded-full px-6" size="sm">
                      Search
                    </Button>
                  </>
                ) : (
                  <div
                    onClick={() => !uploadedFile && fileInputRef.current?.click()}
                    className={`w-full flex items-center gap-3 pl-4 pr-2 py-4 rounded-full bg-white border-2 border-dashed shadow-sm cursor-pointer transition-all duration-300 ${
                      uploadedFile
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <Upload className={`w-5 h-5 shrink-0 ${uploadedFile ? "text-primary" : "text-muted-foreground"}`} />
                    {uploadedFile ? (
                      <>
                        <span className="text-sm font-medium text-foreground flex-1 truncate">{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); clearFile(); }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <Button type="submit" className="rounded-full px-5 shrink-0" size="sm">
                          Analyze
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Drop a product photo or label image…
                      </span>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </form>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-accent" />
               Over 50,000+ products indexed
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="order-1 md:order-2 relative"
          >
             <div className="absolute inset-0 bg-primary/8 rounded-3xl transform rotate-3 scale-105 -z-10" />
             <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white p-2">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-auto rounded-2xl object-cover aspect-[4/3]"
                >
                  <source src={heroVideoPath} type="video/mp4" />
                </video>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — How it works */}
      <section className="py-24 px-6 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Clarity in three steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We cut through the marketing jargon and tell you exactly what you're putting in or on your body.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-border z-0" />
            
            {[
              { title: "Search or upload", desc: "Find a product by name or upload a photo of the label.", icon: Search },
              { title: "We check the label", desc: "Our system analyzes the raw ingredient list behind the claims.", icon: Leaf },
              { title: "Get your report", desc: "See exactly how it matches your personal health profile.", icon: CheckCircle2 }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-sm border border-border"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Interactive Personalization Demo */}
      <InteractiveDemo />

      {/* Section 4 — Trust / transparency */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Based on science, not slogans</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Every flag on Ethos Scan is traceable back to the actual ingredient list. We don't invent claims. We translate complex chemical names into plain English so you can make informed decisions.
            </p>
            <div className="bg-secondary/50 p-6 rounded-2xl border border-secondary border-l-4 border-l-primary mt-8">
              <p className="text-sm font-medium text-foreground flex items-start gap-3">
                 <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <span>Results are based on the ingredient data on file and should be confirmed against the physical product label.</span>
              </p>
            </div>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="bg-white p-8 rounded-3xl shadow-lg border border-border"
          >
             <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono mb-2 uppercase tracking-wider">Ingredient List:</div>
                <div className="font-mono text-sm leading-loose bg-secondary/30 p-6 rounded-xl border border-border">
                  Water (Aqua), Glycerin, <span className="relative inline-block px-1">
                    <span className="relative z-10 font-bold text-accent">Cetearyl Alcohol</span>
                    <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: "100%" }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.8, delay: 0.5 }}
                       className="absolute bottom-0 left-0 h-2 bg-accent/20 -z-0"
                    />
                  </span>, <span className="relative inline-block px-1">
                    <span className="relative z-10 font-bold text-primary">Butyrospermum Parkii</span>
                    <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: "100%" }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.8, delay: 1.5 }}
                       className="absolute bottom-0 left-0 h-2 bg-primary/20 -z-0"
                    />
                  </span> (Shea) Butter, Dimethicone, Stearic Acid...
                </div>
                
                <div className="pt-6 space-y-3">
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.4, delay: 1.0 }}
                     className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20"
                   >
                     <div className="w-2 h-2 rounded-full bg-accent" />
                     <span className="text-sm font-medium">Cetearyl Alcohol</span>
                     <span className="text-sm text-muted-foreground ml-auto">Fatty Alcohol (Safe)</span>
                   </motion.div>
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.4, delay: 2.0 }}
                     className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20"
                   >
                     <div className="w-2 h-2 rounded-full bg-primary" />
                     <span className="text-sm font-medium">Butyrospermum Parkii</span>
                     <span className="text-sm text-muted-foreground ml-auto">Shea Butter (Plant-derived)</span>
                   </motion.div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5 — Coverage tags */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What we check for</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Set up your profile once, and we'll automatically flag these across every product you view.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {[
              { name: "Allergens", desc: "Top 9 allergens + custom triggers", icon: ShieldAlert },
              { name: "Vegan", desc: "Hidden animal byproducts", icon: Leaf },
              { name: "Organic", desc: "Certified organic ingredients", icon: CheckCircle2 },
              { name: "Halal", desc: "Alcohol and haram derivatives", icon: Check },
              { name: "Chemicals", desc: "Parabens, sulfates, fragrance", icon: ShieldAlert }
            ].map((tag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-border text-center hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <tag.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{tag.name}</h4>
                <p className="text-xs text-muted-foreground">{tag.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Final CTA */}
      <section className="py-32 px-6 bg-primary text-primary-foreground relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
         
         <div className="max-w-3xl mx-auto text-center relative z-10">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Ready to know for sure?</h2>
           <p className="text-primary-foreground/80 text-lg mb-10">
             Stop guessing at the grocery store. Create your personalized profile in 60 seconds.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             {!isAuthed ? (
                <>
                  <Button size="lg" variant="secondary" asChild className="rounded-full px-8 text-primary font-semibold hover:bg-white">
                    <Link href="/onboarding">Create your profile</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full px-8 bg-transparent border-white/30 text-white hover:bg-white/10">
                    <Link href="/login">Log in</Link>
                  </Button>
                </>
             ) : (
                <form onSubmit={handleSearch} className="w-full max-w-md relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a product…" 
                    className="w-full pl-12 pr-6 py-4 rounded-full bg-white text-foreground shadow-lg focus:outline-none ring-2 ring-transparent focus:ring-white/50 transition-all"
                  />
                  <Button type="submit" className="absolute right-2 top-2 bottom-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-white" size="sm">
                    Search
                  </Button>
                </form>
             )}
           </div>
         </div>
      </section>
    </div>
  );
}

function InteractiveDemo() {
  const [profile, setProfile] = useState<"none" | "peanut">("none");

  return (
    <section className="py-24 px-6 bg-white overflow-hidden relative">
       <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20" />
       
       <div className="max-w-7xl mx-auto relative z-10">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">It's personal.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">See how Ethos Scan adapts the same product's label to match different people.</p>
         </div>

         <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Controls */}
            <div className="flex flex-col items-center lg:items-start order-2 lg:order-1">
               <h3 className="text-xl font-semibold mb-6">Select a profile to view as:</h3>
               
               <div className="flex flex-col gap-4 w-full max-w-sm">
                  <button
                    onClick={() => setProfile("none")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                      profile === "none" 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">No allergies</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${profile === "none" ? "border-primary" : "border-muted"}`}>
                           {profile === "none" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </div>
                     <p className="text-sm text-muted-foreground">Looking for clean, organic ingredients.</p>
                  </button>

                  <button
                    onClick={() => setProfile("peanut")}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                      profile === "peanut" 
                        ? "border-destructive bg-destructive/5 shadow-md" 
                        : "border-border bg-white hover:border-destructive/30"
                    }`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">Peanut Allergy</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${profile === "peanut" ? "border-destructive" : "border-muted"}`}>
                           {profile === "peanut" && <div className="w-2.5 h-2.5 rounded-full bg-destructive" />}
                        </div>
                     </div>
                     <p className="text-sm text-muted-foreground">Severe reaction to peanuts and traces.</p>
                  </button>
               </div>
            </div>

            {/* Right: Product Card */}
            <div className="order-1 lg:order-2 flex justify-center perspective-[1000px]">
               <motion.div 
                 className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border overflow-hidden flex flex-col"
                 initial={false}
                 animate={{
                    borderColor: profile === "peanut" ? "hsl(var(--destructive)/0.3)" : "hsl(var(--border))",
                    boxShadow: profile === "peanut" ? "0 20px 40px -10px hsl(var(--destructive)/0.1)" : "0 20px 40px -10px hsl(var(--primary)/0.05)"
                 }}
                 transition={{ duration: 0.5 }}
               >
                  {/* Card Header / Image placeholder */}
                  <div className="h-48 bg-secondary/50 p-6 flex items-center justify-center border-b border-border relative">
                     <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center flex-col gap-2">
                        <div className="w-16 h-4 bg-muted/20 rounded-full" />
                        <div className="w-12 h-16 bg-primary/10 rounded-md" />
                     </div>
                     <div className="absolute bottom-4 left-6">
                        <h4 className="font-bold text-xl">Organic Snack Bar</h4>
                        <p className="text-sm text-muted-foreground">Nature's Best</p>
                     </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col relative">
                     {/* WARNING BANNER */}
                     <AnimatePresence>
                        {profile === "peanut" && (
                           <motion.div
                             initial={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
                             animate={{ opacity: 1, height: "auto", y: 0, marginBottom: 24 }}
                             exit={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
                             transition={{ type: "spring", stiffness: 300, damping: 25 }}
                             className="overflow-hidden"
                           >
                              <div className="bg-destructive/10 border border-destructive p-4 rounded-xl text-destructive">
                                 <div className="flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                       <h5 className="font-bold">Peanuts (arachis oil)</h5>
                                       <p className="text-sm opacity-90 mt-1">You are allergic to peanuts</p>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="space-y-4">
                        <div>
                           <h5 className="text-sm font-semibold mb-3">Tags matched to your profile</h5>
                           <div className="flex flex-wrap gap-2">
                              <motion.span layout className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full flex items-center gap-1">
                                 <CheckCircle2 className="w-3 h-3" /> Vegan
                              </motion.span>
                              <motion.span layout className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full flex items-center gap-1">
                                 <Leaf className="w-3 h-3" /> Organic
                              </motion.span>
                              
                              <AnimatePresence mode="popLayout">
                                 {profile === "none" && (
                                    <motion.span 
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full"
                                    >
                                       Contains Fragrance
                                    </motion.span>
                                 )}
                              </AnimatePresence>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                           <h5 className="text-sm font-semibold mb-2">Ingredients</h5>
                           <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                              Oats, Organic Brown Rice Syrup, <motion.span 
                                animate={{ 
                                   color: profile === "peanut" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
                                   fontWeight: profile === "peanut" ? 700 : 400,
                                   backgroundColor: profile === "peanut" ? "hsl(var(--destructive)/0.1)" : "transparent",
                                   padding: profile === "peanut" ? "0 4px" : "0",
                                   borderRadius: "4px"
                                }}
                                className="transition-all duration-300 inline-block"
                              >
                                 Arachis Oil (Peanut)
                              </motion.span>, Sea Salt, Natural Flavors, Mixed Tocopherols.
                           </p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
       </div>
    </section>
  );
}
