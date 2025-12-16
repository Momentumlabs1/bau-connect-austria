import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; user?: any }>;
  onRegister: (email: string, password: string, firstName: string, lastName: string, phone: string, acceptTerms: boolean) => Promise<{ success: boolean; user?: any }>;
  projectData?: any;
  onVerificationSuccess?: (userId: string, projectId: string) => void;
}

export function AuthDialog({ open, onOpenChange, onLogin, onRegister, projectData, onVerificationSuccess }: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [verificationStep, setVerificationStep] = useState<'form' | 'otp'>('form');
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    acceptTerms: false
  });
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleLoginSubmit = async () => {
    if (!loginData.email || !loginData.password) return;
    
    setLoading(true);
    const result = await onLogin(loginData.email, loginData.password);
    setLoading(false);
    
    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      toast({
        title: "Pflichtfelder fehlen",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }
    
    if (!registerData.acceptTerms) {
      toast({
        title: "AGB nicht akzeptiert",
        description: "Bitte akzeptieren Sie die AGB und Datenschutzerklärung",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: registerData.email,
          firstName: registerData.firstName,
          projectData: {
            ...projectData,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            phone: registerData.phone,
            role: 'customer'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "📧 Bestätigungscode gesendet!",
        description: `Prüfen Sie Ihr Postfach: ${registerData.email}`,
      });

      setVerificationStep('otp');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Fehler",
        description: error.message || "Code konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: registerData.email,
          firstName: registerData.firstName,
          projectData: {
            ...projectData,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            phone: registerData.phone,
            role: 'customer'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Neuer Code gesendet!",
        description: "Prüfen Sie Ihr Postfach",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Code konnte nicht erneut gesendet werden",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Code unvollständig",
        description: "Bitte geben Sie den 6-stelligen Code ein",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: {
          email: registerData.email,
          code: otpCode
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Ungültiger Code",
          description: data.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "🎉 E-Mail bestätigt!",
        description: "Ihr Projekt wurde veröffentlicht",
      });

      // Sign in the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: registerData.password
      });

      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
      }

      // Call the success callback
      if (onVerificationSuccess && data.userId && data.projectId) {
        onVerificationSuccess(data.userId, data.projectId);
      }

      onOpenChange(false);

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Fehler",
        description: error.message || "Verifizierung fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setVerificationStep('form');
    setOtpCode("");
  };

  const resetForm = () => {
    setVerificationStep('form');
    setOtpCode("");
    setAuthMode('login');
    setLoginData({ email: "", password: "" });
    setRegisterData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      acceptTerms: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        {verificationStep === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Anmelden oder registrieren</DialogTitle>
              <DialogDescription>
                Um Ihr Projekt zu veröffentlichen, müssen Sie angemeldet sein
              </DialogDescription>
            </DialogHeader>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail-Adresse</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="max@beispiel.at"
                    onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Ihr Passwort"
                    onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                  />
                </div>
                <Button 
                  onClick={handleLoginSubmit} 
                  disabled={loading || !loginData.email || !loginData.password}
                  className="w-full"
                >
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-firstName">Vorname *</Label>
                    <Input
                      id="reg-firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-lastName">Nachname *</Label>
                    <Input
                      id="reg-lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-Mail-Adresse *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="max@beispiel.at"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Telefonnummer (optional)</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+43 660 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Passwort *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mindestens 6 Zeichen"
                  />
                  <p className="text-xs text-muted-foreground">Mindestens 6 Zeichen</p>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="reg-terms"
                    checked={registerData.acceptTerms}
                    onCheckedChange={(checked) => setRegisterData(prev => ({ ...prev, acceptTerms: checked as boolean }))}
                    className="mt-1"
                  />
                  <Label htmlFor="reg-terms" className="text-sm cursor-pointer leading-relaxed">
                    Ich akzeptiere die{" "}
                    <a href="/agb" target="_blank" className="text-blue-600 hover:underline font-medium">
                      AGB
                    </a>
                    {" "}und{" "}
                    <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline font-medium">
                      Datenschutzerklärung
                    </a>
                  </Label>
                </div>

                <Button 
                  onClick={handleSendVerificationCode} 
                  disabled={loading || !registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName || !registerData.acceptTerms}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    "Bestätigungscode senden"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // OTP Verification Step
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>E-Mail bestätigen</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Wir haben einen 6-stelligen Code an <strong>{registerData.email}</strong> gesendet
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-6 py-6">
              <div className="bg-blue-50 p-4 rounded-full">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Geben Sie den Code aus der E-Mail ein:
                </p>
              </div>

              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
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

              <Button 
                onClick={handleVerifyCode}
                disabled={loading || otpCode.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird verifiziert...
                  </>
                ) : (
                  "Code bestätigen & Projekt veröffentlichen"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Keinen Code erhalten?
                </p>
                <Button
                  variant="link"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-blue-600"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Code erneut senden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
