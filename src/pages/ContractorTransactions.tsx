import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingDown, TrendingUp, Wallet, Receipt } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
  lead_id: string | null;
}

export default function ContractorTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Get current balance
      const { data: contractor } = await supabase
        .from("contractors")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (contractor) {
        setCurrentBalance(contractor.wallet_balance);
      }

      // Get transactions
      const { data: transactionsData, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("handwerker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'LEAD_PURCHASE':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'WALLET_RECHARGE':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'REFUND':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'LEAD_PURCHASE':
        return 'Lead-Kauf';
      case 'WALLET_RECHARGE':
        return 'Wallet-Aufladung';
      case 'REFUND':
        return 'Rückerstattung';
      case 'ADJUSTMENT':
        return 'Anpassung';
      default:
        return type;
    }
  };

  const getTransactionVariant = (type: string) => {
    switch (type) {
      case 'LEAD_PURCHASE':
        return 'destructive';
      case 'WALLET_RECHARGE':
      case 'REFUND':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaktionsverlauf</h1>
          <p className="text-muted-foreground">
            Übersicht aller Wallet-Transaktionen und Lead-Käufe
          </p>
        </div>

        {/* Current Balance Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-background">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Aktuelles Guthaben</p>
              <p className="text-4xl font-bold">€{currentBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-12 w-12 text-primary" />
          </div>
        </Card>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Keine Transaktionen</h3>
            <p className="text-muted-foreground">
              Ihre Transaktionshistorie wird hier angezeigt, sobald Sie Leads kaufen oder Ihr Wallet aufladen.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <Badge variant={getTransactionVariant(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'Keine Beschreibung'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.created_at), "dd. MMM yyyy, HH:mm 'Uhr'", { locale: de })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.type === 'LEAD_PURCHASE' 
                          ? 'text-destructive' 
                          : 'text-primary'
                      }`}>
                        {transaction.type === 'LEAD_PURCHASE' ? '-' : '+'}
                        €{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saldo: €{transaction.balance_after.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
