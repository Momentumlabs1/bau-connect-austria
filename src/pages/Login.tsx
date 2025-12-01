import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail ein"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Get user roles from user_roles table
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id);

      toast({
        title: "Anmeldung erfolgreich!",
        description: "Sie werden weitergeleitet...",
      });

      setTimeout(() => {
        // Check roles in priority order: admin > contractor > customer
        const roles = userRoles?.map(r => r.role) || [];
        
        if (roles.includes("admin")) {
          navigate("/admin/dashboard");
        } else if (roles.includes("contractor")) {
          navigate("/handwerker/dashboard");
        } else if (roles.includes("customer")) {
          navigate("/kunde/dashboard");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error: any) {
      // Check for email not confirmed error
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        setEmailNotConfirmed(true);
        setEmailForResend(data.email);
        toast({
          title: "E-Mail nicht bestätigt",
          description: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Anmeldefehler",
          description: error.message === "Invalid login credentials"
            ? "E-Mail oder Passwort ist falsch"
            : error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!emailForResend) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForResend,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Bestätigungsmail gesendet!",
        description: "Bitte überprüfen Sie Ihren Posteingang.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Anmelden</CardTitle>
              <CardDescription>
                Melden Sie sich bei Ihrem BauConnect24-Konto an
              </CardDescription>
            </CardHeader>
            <CardContent>
              {justRegistered && (
                <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Bitte bestätigen Sie Ihre E-Mail-Adresse bevor Sie sich anmelden.
                    Überprüfen Sie Ihren Posteingang.
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>

                {emailNotConfirmed && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="w-full"
                  >
                    {resending ? "Wird gesendet..." : "Bestätigungsmail erneut senden"}
                  </Button>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary">
                    Passwort vergessen?
                  </a>
                </div>

                <div className="text-center text-sm">
                  Noch kein Konto?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate("/register")}
                    className="p-0"
                  >
                    Jetzt registrieren
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
