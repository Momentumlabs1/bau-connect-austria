import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Euro, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  gewerk_id: string;
  postalCode: string;
  city: string;
  budgetMin?: number;
  budgetMax?: number;
  createdAt: Date;
  thumbnailUrl?: string;
  urgency: 'low' | 'medium' | 'high';
  description?: string;
}

interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'compact' | 'detailed';
  onLeadClick?: () => void;
  showLeadPrice?: boolean;
  leadPrice?: number;
  className?: string;
}

export const ProjectCard = ({ 
  project, 
  variant = 'default',
  onLeadClick,
  showLeadPrice = false,
  leadPrice,
  className
}: ProjectCardProps) => {
  
  // Urgency color mapping using semantic tokens
  const urgencyConfig = {
    low: { 
      label: 'Nicht eilig', 
      color: 'bg-success/10 text-success border-success/20' 
    },
    medium: { 
      label: 'Normal', 
      color: 'bg-warning/10 text-warning border-warning/20' 
    },
    high: { 
      label: 'Dringend', 
      color: 'bg-destructive/10 text-destructive border-destructive/20' 
    }
  };

  const { label: urgencyLabel, color: urgencyColor } = urgencyConfig[project.urgency];

  // Format budget display
  const formatBudget = () => {
    if (!project.budgetMin && !project.budgetMax) {
      return 'Nach Vereinbarung';
    }
    if (project.budgetMin === project.budgetMax) {
      return `€${project.budgetMin?.toLocaleString()}`;
    }
    const min = project.budgetMin ? `€${project.budgetMin.toLocaleString()}` : '?';
    const max = project.budgetMax ? `€${project.budgetMax.toLocaleString()}` : '?';
    return `${min}-${max}`;
  };

  // Time ago formatting
  const timeAgo = formatDistanceToNow(new Date(project.createdAt), { 
    addSuffix: true, 
    locale: de 
  });

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn("p-4 hover:shadow-md transition-shadow cursor-pointer", className)}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg flex-1 pr-2">{project.title}</h3>
          <Badge className={cn("text-xs", urgencyColor)}>
            {urgencyLabel}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {project.postalCode} {project.city}
          </span>
          <span className="flex items-center gap-1">
            <Euro className="h-4 w-4" />
            {formatBudget()}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </p>
      </Card>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
        <div className="flex flex-col">
          {/* Thumbnail */}
          {project.thumbnailUrl && (
            <div className="w-full h-48 bg-muted overflow-hidden">
              <img 
                src={project.thumbnailUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-xl flex-1 pr-2">{project.title}</h3>
              <Badge className={cn("text-xs shrink-0", urgencyColor)}>
                {urgencyLabel}
              </Badge>
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Trade Badge */}
            <Badge variant="outline" className="mb-4">
              {project.gewerk_id}
            </Badge>

            {/* Info Grid */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{project.postalCode} {project.city}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Euro className="h-4 w-4 shrink-0" />
                <span>{formatBudget()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{timeAgo}</span>
              </div>
            </div>

            {/* CTA */}
            {showLeadPrice && leadPrice !== undefined && onLeadClick && (
              <Button 
                onClick={onLeadClick}
                className="w-full"
                variant="secondary"
              >
                Lead für €{leadPrice} kaufen
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
          {project.thumbnailUrl ? (
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              📷
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg flex-1 pr-2 truncate">
              {project.title}
            </h3>
            <Badge className={cn("text-xs shrink-0", urgencyColor)}>
              {urgencyLabel}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              {project.postalCode} {project.city}
            </p>
            <p className="flex items-center gap-1">
              <Euro className="h-4 w-4 shrink-0" />
              {formatBudget()}
            </p>
            <p className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {timeAgo}
            </p>
          </div>

          {/* CTA */}
          {showLeadPrice && leadPrice !== undefined && onLeadClick && (
            <Button 
              onClick={onLeadClick}
              size="sm"
              className="w-full"
              variant="secondary"
            >
              Lead für €{leadPrice} kaufen
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
