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

    if (file.size > 2 * 1024 * 1024) {
      setError('Max 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Images only');
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
        setError('Upload failed');
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
      <div 
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group hover:border-indigo-400 transition-colors cursor-pointer"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        ) : value ? (
          <>
            <img src={value} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </>
        ) : (
          <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-indigo-400 transition-colors" />
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-[140px]">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full sm:w-auto"
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {value && (
          <button 
            type="button" 
            onClick={() => { onChange(''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
            className="text-xs text-red-600 hover:text-red-700 font-medium text-left"
          >
            Remove photo
          </button>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
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
