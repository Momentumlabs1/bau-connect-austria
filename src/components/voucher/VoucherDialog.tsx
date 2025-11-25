import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useContractor } from '@/stores/contractorStore';
import { Ticket } from 'lucide-react';

export const VoucherDialog = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateWalletBalance, refreshProfile } = useContractor();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast({
        title: 'Code erforderlich',
        description: 'Bitte gib einen Gutschein-Code ein',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-voucher', {
        body: { code: code.toUpperCase() }
      });

      if (error) throw error;

      toast({
        title: 'Gutschein eingelöst!',
        description: data.message || `€${data.amount} wurden deinem Guthaben hinzugefügt`
      });

      // Update wallet balance in store
      updateWalletBalance(data.newBalance);
      await refreshProfile();

      setCode('');
      setOpen(false);
    } catch (error: any) {
      console.error('❌ Error redeeming voucher:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Gutschein konnte nicht eingelöst werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Ticket className="w-4 h-4" />
          Gutschein einlösen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gutschein einlösen</DialogTitle>
          <DialogDescription>
            Gib deinen Gutschein-Code ein, um Guthaben zu erhalten
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRedeem}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Gutschein-Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="uppercase"
                maxLength={20}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !code.trim()}>
              {loading ? 'Wird eingelöst...' : 'Einlösen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
