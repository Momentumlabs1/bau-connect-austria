import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OfferCardProps {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  createdAt: string;
  validUntil: string;
  contractorName?: string;
  contractorId?: string;
  contractorImageUrl?: string | null;
  projectId?: string;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  showActions?: boolean;
}

export const OfferCard = ({
  id,
  amount,
  message,
  status,
  createdAt,
  validUntil,
  contractorName,
  contractorId,
  contractorImageUrl,
  projectId,
  onAccept,
  onReject,
  showActions = false
}: OfferCardProps) => {
  const navigate = useNavigate();
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Ausstehend',
      color: 'text-yellow-600 bg-yellow-50'
    },
    accepted: {
      icon: CheckCircle,
      label: 'Akzeptiert',
      color: 'text-green-600 bg-green-50'
    },
    rejected: {
      icon: XCircle,
      label: 'Abgelehnt',
      color: 'text-red-600 bg-red-50'
    },
    expired: {
      icon: XCircle,
      label: 'Abgelaufen',
      color: 'text-gray-600 bg-gray-50'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  const isExpired = new Date(validUntil) < new Date();
  const isPending = status === 'pending' && !isExpired;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        {contractorId && (
          <Avatar 
            className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => navigate(`/handwerker/${contractorId}`)}
          >
            <AvatarImage src={contractorImageUrl || undefined} />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          {contractorName && (
            <p className="font-medium text-sm mb-1">{contractorName}</p>
          )}
          <p className="text-2xl font-bold text-primary">€{amount.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            Erstellt {formatDistanceToNow(new Date(createdAt), { 
              addSuffix: true,
              locale: de 
            })}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.color}`}>
          <Icon className="w-4 h-4" />
          <span>{config.label}</span>
        </div>
      </div>

      {message && (
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm text-foreground">{message}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Gültig bis: {new Date(validUntil).toLocaleDateString('de-DE')}
      </div>

      {contractorId && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/handwerker/${contractorId}`)}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profil ansehen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/nachrichten?contractor=${contractorId}&project=${projectId}`)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Nachricht senden
          </Button>
        </div>
      )}

      {showActions && isPending && (
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onAccept?.(id)}
            className="flex-1"
          >
            Angebot annehmen
          </Button>
          <Button 
            variant="outline"
            onClick={() => onReject?.(id)}
          >
            Ablehnen
          </Button>
        </div>
      )}
    </div>
  );
};
