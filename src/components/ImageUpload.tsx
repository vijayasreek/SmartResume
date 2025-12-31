import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError('');
    
    if (onUpload) {
      try {
        setIsUploading(true);
        const url = await onUpload(file);
        onChange(url);
      } catch (err) {
        console.error(err);
        setError('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Fallback to base64 if no upload function provided (local mode)
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
      
      <div className="flex items-center gap-6">
        {/* Preview Circle */}
        <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          ) : value ? (
            <img src={value} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            {value && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
                className="text-red-600 hover:bg-red-50"
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">Max 2MB. JPG, PNG, or GIF.</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
