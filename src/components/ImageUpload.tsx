import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  bucket: string;
  folder: string;
  maxImages?: number;
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
}

export function ImageUpload({ 
  bucket, 
  folder, 
  maxImages = 5, 
  onImagesChange,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Zu viele Bilder",
        description: `Maximal ${maxImages} Bilder erlaubt`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);

      toast({
        title: "Bilder hochgeladen",
        description: `${uploadedUrls.length} Bild(er) erfolgreich hochgeladen`,
      });
    } catch (error: any) {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    const newImages = images.filter(img => img !== url);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img 
              src={url} 
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {uploading ? "Wird hochgeladen..." : "Bild hochladen"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {images.length} von {maxImages} Bildern hochgeladen
      </p>
    </div>
  );
}
