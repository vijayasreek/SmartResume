import React from 'react';
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
  // Select the correct component based on templateId
  const renderTemplate = () => {
    switch (resume.templateId) {
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
    <div ref={ref} className="w-[210mm] min-h-[297mm] shadow-2xl mx-auto flex overflow-hidden bg-white print:shadow-none" id="resume-preview">
      {renderTemplate()}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
