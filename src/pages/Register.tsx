import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Wrench, User, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const registerSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  firstName: z.string().min(2, "Vorname ist erforderlich"),
  lastName: z.string().min(2, "Nachname ist erforderlich"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Sie müssen die AGB und Datenschutzerklärung akzeptieren",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<"customer" | "contractor" | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState<RegisterForm | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "customer" || roleParam === "contractor") {
      setRole(roleParam);
    }
  }, [searchParams]);
  
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors } 
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!role) return;
    
    setLoading(true);
    setFormData(data);
    setRegisteredEmail(data.email);
    
    try {
      // Send verification code instead of creating account directly
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: data.email,
          firstName: data.firstName,
          projectData: {
            // No project data - just registration
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role: role,
            isDirectRegistration: true, // Flag to indicate no project
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Bestätigungscode gesendet!",
        description: `Wir haben einen 6-stelligen Code an ${data.email} gesendet.`,
      });

      setVerificationStep('otp');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Fehler bei der Registrierung",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6 || !formData || !role) return;
    
    setVerifyingOtp(true);
    
    try {
      const { data: verifyResult, error } = await supabase.functions.invoke('verify-email-code', {
        body: {
          email: registeredEmail,
          code: otpCode,
        }
      });

      if (error) throw error;
      
      if (verifyResult?.error) {
        throw new Error(verifyResult.error);
      }

      // Sign in the user after successful verification
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registeredEmail,
        password: formData.password,
      });

      if (signInError) {
        console.error('Sign-in after verification failed:', signInError);
        // Don't throw - user was created, they can sign in manually
      }

      toast({
        title: "Registrierung erfolgreich!",
        description: role === 'contractor' 
          ? "Willkommen! Sie werden zum Onboarding weitergeleitet."
          : "Willkommen bei BauConnect24!",
      });

      // Redirect based on role
      if (role === 'contractor') {
        navigate('/handwerker/onboarding');
      } else {
        navigate('/kunde/dashboard');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verifizierungsfehler",
        description: error.message || "Ungültiger Code. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData || !role) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: registeredEmail,
          firstName: formData.firstName,
          projectData: {
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: role,
            isDirectRegistration: true,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Neuer Code gesendet!",
        description: `Ein neuer 6-stelliger Code wurde an ${registeredEmail} gesendet.`,
      });
      setOtpCode("");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Code konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Step
  if (verificationStep === 'otp') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>E-Mail bestätigen</CardTitle>
                <CardDescription>
                  Wir haben einen 6-stelligen Code an<br />
                  <span className="font-medium text-foreground">{registeredEmail}</span><br />
                  gesendet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length !== 6 || verifyingOtp}
                  className="w-full"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird überprüft...
                    </>
                  ) : (
                    "E-Mail bestätigen"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Keinen Code erhalten?
                  </p>
                  <Button 
                    variant="link" 
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-primary"
                  >
                    {loading ? "Wird gesendet..." : "Neuen Code senden"}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setVerificationStep('form');
                    setOtpCode("");
                  }}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zur Registrierung
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {!role ? (
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold">Wie möchten Sie BauConnect24 nutzen?</h1>
              <p className="text-muted-foreground">Wählen Sie Ihre Rolle aus</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setRole("customer")}
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Ich suche Handwerker</CardTitle>
                  <CardDescription>
                    Erstellen Sie Aufträge und erhalten Sie Angebote von qualifizierten Handwerkern
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => setRole("contractor")}
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10">
                    <Wrench className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle>Ich bin Handwerker</CardTitle>
                  <CardDescription>
                    Finden Sie neue Aufträge und bauen Sie Ihr Geschäft aus
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Konto erstellen</CardTitle>
                <CardDescription>
                  Registrieren Sie sich als {role === "customer" ? "Auftraggeber" : "Handwerker"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Vorname</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="Max"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nachname</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Mustermann"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="max@beispiel.at"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                        <Label
                          htmlFor="acceptTerms"
                          className="text-sm font-normal leading-relaxed cursor-pointer"
                        >
                          Ich akzeptiere die{" "}
                          <Link
                            to="/agb"
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            AGB
                          </Link>{" "}
                          und{" "}
                          <Link
                            to="/datenschutz"
                            target="_blank"
                            className="text-primary hover:underline font-medium"
                          >
                            Datenschutzerklärung
                          </Link>
                        </Label>
                      </div>
                    )}
                  />
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRole(null)}
                      className="flex-1"
                    >
                      Zurück
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        "Code senden"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
