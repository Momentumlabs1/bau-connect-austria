import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; user?: any }>;
  onRegister: (email: string, password: string, firstName: string, lastName: string, phone: string, acceptTerms: boolean) => Promise<{ success: boolean; user?: any }>;
}

export function AuthDialog({ open, onOpenChange, onLogin, onRegister }: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async () => {
    if (!loginData.email || !loginData.password) return;
    
    setLoading(true);
    const result = await onLogin(loginData.email, loginData.password);
    setLoading(false);
    
    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      return;
    }
    
    if (!registerData.acceptTerms) {
      return;
    }
    
    setLoading(true);
    const result = await onRegister(
      registerData.email,
      registerData.password,
      registerData.firstName,
      registerData.lastName,
      registerData.phone,
      registerData.acceptTerms
    );
    setLoading(false);
    
    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              onClick={handleRegisterSubmit} 
              disabled={loading || !registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName || !registerData.acceptTerms}
              className="w-full"
            >
              {loading ? "Wird registriert..." : "Konto erstellen und Projekt veröffentlichen"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
