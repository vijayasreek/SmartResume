import React from 'react';
import { User, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProfilePhotoProps {
  url?: string;
  className?: string;
  initials?: string;
  iconColor?: string;
  bgColor?: string;
}

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ 
  url, 
  className, 
  initials = 'U',
  iconColor = 'text-gray-400',
  bgColor = 'bg-gray-100'
}) => {
  return (
    <div className={cn("overflow-hidden flex items-center justify-center shrink-0 border border-gray-200 print:visible print:opacity-100", bgColor, className)}>
      {url ? (
        <img 
          src={url} 
          alt="Profile" 
          className="w-full h-full object-cover block"
          crossOrigin="anonymous"
        />
      ) : (
        <div className={cn("w-full h-full flex flex-col items-center justify-center", iconColor)}>
          <span className="text-xl font-bold uppercase">{initials}</span>
        </div>
      )}
    </div>
  );
};
