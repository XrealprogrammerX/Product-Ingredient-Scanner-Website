import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useRegister, useSendOtp, useVerifyOtp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Halal", "No preference"];
const COMMON_ALLERGIES = ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Shellfish", "Soy", "Wheat", "Sesame", "Fish"];
const COMMON_AVOID = ["Sulfates", "Parabens", "Artificial Flavoring", "Fragrance/Parfum"];
const COMMON_ALLOW = ["Organic", "Cruelty-Free"];

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const [displayName, setDisplayName] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [allow, setAllow] = useState<string[]>([]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const register = useRegister();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) return toast.error("Please enter a name");
    if (step === 2 && dietary.length === 0) return toast.error("Please select at least one option");
    setStep((s) => Math.min(s + 1, 7));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleArray = (arr: string[], setArr: (val: string[]) => void, item: string, exclusiveVal?: string) => {
    if (exclusiveVal && item === exclusiveVal) {
      setArr([exclusiveVal]);
      return;
    }
    if (exclusiveVal && arr.includes(exclusiveVal)) {
      setArr([item]);
      return;
    }
    
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) {
      return toast.error("Please enter a valid email and password (min 8 characters)");
    }

    try {
      await register.mutateAsync({
        data: {
          email,
          password,
          displayName,
          dietaryPreferences: dietary.includes("No preference") ? [] : dietary,
          allergies,
          ingredientsToAvoid: avoid,
          ingredientsToAllow: allow
        }
      });
      
      await sendOtp.mutateAsync({ data: { email } });
      toast.success("Verification code sent!");
      setStep(7);
    } catch (err: any) {
      toast.error(err.data?.error || "Registration failed");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter the 6-digit code");

    try {
      await verifyOtp.mutateAsync({ data: { email, code: otp } });
      toast.success("Account created successfully!");
      setLocation("/login");
    } catch (err: any) {
      toast.error(err.data?.error || "Invalid verification code");
    }
  };

  const resendOtp = () => {
    sendOtp.mutate({ data: { email } }, {
      onSuccess: () => toast.success("Code resent!"),
      onError: (err) => toast.error(err.data?.error || "Failed to resend code")
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center py-12 px-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary font-bold text-xl">
        Ethos Scan
      </Link>

      <div className="w-full max-w-lg mt-12">
        <div className="flex items-center justify-between mb-8">
          {step > 1 && step < 7 ? (
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : <div className="w-10" />}
          
          <div className="text-sm font-medium text-muted-foreground">
            Step {step} of 7
          </div>
          <div className="w-10" />
        </div>
        
        <div className="w-full h-1 bg-secondary rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${((step - 1) / 7) * 100}%` }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-border relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">What should we call you?</h2>
                  <p className="text-muted-foreground">This helps us personalize your experience.</p>
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    className="text-lg py-6 rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                  <Button onClick={handleNext} className="w-full py-6 rounded-xl text-lg font-semibold mt-4">Continue</Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Any dietary preferences?</h2>
                  <p className="text-muted-foreground">Select all that apply.</p>
                  <div className="flex flex-wrap gap-3">
                    {DIETARY_OPTIONS.map((opt) => (
                      <Chip 
                        key={opt} 
                        label={opt} 
                        selected={dietary.includes(opt)} 
                        onClick={() => toggleArray(dietary, setDietary, opt, "No preference")} 
                      />
                    ))}
                  </div>
                  <Button onClick={handleNext} className="w-full py-6 rounded-xl text-lg font-semibold mt-8">Continue</Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Do you have allergies?</h2>
                  <p className="text-muted-foreground">We'll strictly flag any product containing these.</p>
                  <div className="flex flex-wrap gap-3">
                    {COMMON_ALLERGIES.map((opt) => (
                      <Chip key={opt} label={opt} selected={allergies.includes(opt)} onClick={() => toggleArray(allergies, setAllergies, opt)} />
                    ))}
                    {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(a => (
                      <Chip key={a} label={a} selected={true} onClick={() => toggleArray(allergies, setAllergies, a)} />
                    ))}
                    <AddCustomChip onAdd={(val) => { if(!allergies.includes(val)) setAllergies([...allergies, val]) }} />
                  </div>
                  <Button onClick={handleNext} className="w-full py-6 rounded-xl text-lg font-semibold mt-8">Continue</Button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Ingredients to avoid</h2>
                  <p className="text-muted-foreground">Chemicals or additives you prefer not to use.</p>
                  <div className="flex flex-wrap gap-3">
                    {COMMON_AVOID.map((opt) => (
                      <Chip key={opt} label={opt} selected={avoid.includes(opt)} onClick={() => toggleArray(avoid, setAvoid, opt)} />
                    ))}
                    {avoid.filter(a => !COMMON_AVOID.includes(a)).map(a => (
                      <Chip key={a} label={a} selected={true} onClick={() => toggleArray(avoid, setAvoid, a)} />
                    ))}
                    <AddCustomChip onAdd={(val) => { if(!avoid.includes(val)) setAvoid([...avoid, val]) }} />
                  </div>
                  <Button onClick={handleNext} className="w-full py-6 rounded-xl text-lg font-semibold mt-8">Continue</Button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Ingredients to look for</h2>
                  <p className="text-muted-foreground">Things you actively want in your products.</p>
                  <div className="flex flex-wrap gap-3">
                    {COMMON_ALLOW.map((opt) => (
                      <Chip key={opt} label={opt} selected={allow.includes(opt)} onClick={() => toggleArray(allow, setAllow, opt)} />
                    ))}
                    {allow.filter(a => !COMMON_ALLOW.includes(a)).map(a => (
                      <Chip key={a} label={a} selected={true} onClick={() => toggleArray(allow, setAllow, a)} />
                    ))}
                    <AddCustomChip onAdd={(val) => { if(!allow.includes(val)) setAllow([...allow, val]) }} />
                  </div>
                  <Button onClick={handleNext} className="w-full py-6 rounded-xl text-lg font-semibold mt-8">Continue</Button>
                </div>
              )}

              {step === 6 && (
                <form onSubmit={handleRegister} className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Secure your profile</h2>
                  <p className="text-muted-foreground">You'll use this to access your preferences anywhere.</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="py-6 rounded-xl" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="py-6 rounded-xl" placeholder="Min 8 characters" minLength={8} />
                    </div>
                  </div>
                  <Button type="submit" disabled={register.isPending} className="w-full py-6 rounded-xl text-lg font-semibold mt-4">
                    {register.isPending ? "Creating profile..." : "Create profile"}
                  </Button>
                </form>
              )}

              {step === 7 && (
                <form onSubmit={handleVerify} className="space-y-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Check your email</h2>
                  <p className="text-muted-foreground">We sent a 6-digit code to {email}.<br/>(In development, check the server logs)</p>
                  
                  <div className="flex justify-center py-6">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-2">
                        {[0,1,2,3,4,5].map(i => (
                          <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl rounded-xl border-border" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button type="submit" disabled={verifyOtp.isPending} className="w-full py-6 rounded-xl text-lg font-semibold mt-4">
                    {verifyOtp.isPending ? "Verifying..." : "Verify and sign in"}
                  </Button>
                  
                  <Button type="button" variant="ghost" onClick={resendOtp} disabled={sendOtp.isPending} className="mt-4">
                    Resend code
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ${
        selected 
          ? "bg-primary text-white border-primary shadow-md scale-105" 
          : "bg-white text-foreground border-border hover:border-primary/50"
      }`}
    >
      {label}
      {selected && <X className="w-4 h-4 ml-1" />}
    </button>
  );
}

function AddCustomChip({ onAdd }: { onAdd: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (isOpen) {
    return (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (val.trim()) {
            onAdd(val.trim());
            setVal("");
          }
          setIsOpen(false);
        }}
        className="flex items-center"
      >
        <Input
          ref={inputRef}
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => setIsOpen(false)}
          placeholder="Type and enter..."
          className="w-40 rounded-xl h-[46px]"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="px-4 py-3 rounded-xl border border-dashed border-muted-foreground/50 text-muted-foreground font-medium text-sm hover:border-primary hover:text-primary transition-all flex items-center gap-2"
    >
      <Plus className="w-4 h-4" /> Add another
    </button>
  );
}
