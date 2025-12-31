import React, { useEffect, useState, useRef } from 'react';
import { Resume } from '../types';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { TechTemplate } from './templates/TechTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { AcademicTemplate } from './templates/AcademicTemplate';
import { HealthcareTemplate } from './templates/HealthcareTemplate';
import { BankingTemplate } from './templates/BankingTemplate';

interface ResumePreviewProps {
  resume: Resume;
  ref?: React.Ref<HTMLDivElement>;
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ resume }, ref) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Robust scaling logic for A4 preview
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          const parentWidth = parent.clientWidth;
          const resumeWidth = 210 * 3.78; // 210mm in pixels approx (794px)
          const padding = 32; // 2rem padding
          
          // Calculate scale to fit parent width minus padding
          // Max scale 1 (don't zoom in on huge screens), min scale 0.3 (phones)
          const availableWidth = parentWidth - padding;
          const newScale = Math.min(1, Math.max(0.3, availableWidth / resumeWidth));
          setScale(newScale);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Handle Colorful Templates logic
  const getTemplateColor = (id: string) => {
    if (id.includes('teal')) return '#0f766e'; // teal-700
    if (id.includes('rose')) return '#be123c'; // rose-700
    if (id.includes('blue')) return '#1d4ed8'; // blue-700
    if (id.includes('orange')) return '#c2410c'; // orange-700
    return undefined; // Default
  };

  const color = getTemplateColor(resume.templateId);
  const baseTemplateId = resume.templateId.split('-')[0];

  const renderTemplate = () => {
    switch (baseTemplateId) {
      case 'minimalist': return <MinimalistTemplate resume={resume} />;
      case 'executive': return <ExecutiveTemplate resume={resume} />;
      case 'creative': return <CreativeTemplate resume={resume} />;
      case 'tech': return <TechTemplate resume={resume} />;
      case 'professional': return <ProfessionalTemplate resume={resume} />;
      case 'academic': return <AcademicTemplate resume={resume} />;
      case 'healthcare': return <HealthcareTemplate resume={resume} />;
      case 'banking': return <BankingTemplate resume={resume} />;
      case 'modern':
      default: return <ModernTemplate resume={resume} />;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="origin-top transition-transform duration-200 ease-out" 
      style={{ 
        transform: `scale(${scale})`,
        width: '210mm', // Fixed A4 width
        height: '297mm', // Fixed A4 height
        marginBottom: `-${(297 * 3.78) * (1 - scale)}px` // Negative margin to fix layout gap after scaling
      }}
    >
      <div 
        ref={ref} 
        className="w-full h-full shadow-2xl bg-white print:shadow-none overflow-hidden relative" 
        id="resume-preview"
        style={color ? { '--primary-color': color } as React.CSSProperties : {}}
      >
        {/* Inject dynamic color styles */}
        <style>
          {color ? `
            .text-indigo-600, .text-blue-600, .text-pink-600, .text-green-800, .text-cyan-600, .text-cyan-700, .text-cyan-800 { color: ${color} !important; }
            .bg-indigo-600, .bg-blue-600, .bg-pink-600, .bg-cyan-600, .bg-cyan-500 { background-color: ${color} !important; }
            .bg-indigo-50, .bg-indigo-100, .bg-cyan-50 { background-color: ${color}15 !important; }
            .border-indigo-100, .border-indigo-200, .border-cyan-100 { border-color: ${color}30 !important; }
            .border-green-700 { border-color: ${color} !important; }
            .text-green-700 { color: ${color} !important; }
          ` : ''}
        </style>
        {renderTemplate()}
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
