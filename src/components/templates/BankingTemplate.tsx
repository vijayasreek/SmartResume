import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';

export const BankingTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Professional Experience';

  return (
    <div className="bg-white w-full h-full p-10 text-black font-serif text-[10pt] leading-snug">
      {/* Compact Header */}
      <div className="text-center border-b border-black pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">{resume.personalInfo.fullName}</h1>
        <div className="flex justify-center gap-3 text-sm">
          {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
          {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
          {resume.personalInfo.email && <span>• {resume.personalInfo.email}</span>}
        </div>
      </div>

      {/* Education - Often first in Banking/Finance */}
      {resume.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Education</h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <span className="font-bold">{edu.institution}</span>
                  <div className="italic">{edu.degree}</div>
                </div>
                <div className="text-right">
                   <div className="font-bold">{edu.startDate} – {edu.endDate}</div>
                   <div className="italic">{edu.fieldOfStudy}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">{experienceTitle}</h2>
          <div className="space-y-3">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between mb-0.5">
                  <span className="font-bold">{exp.company}</span>
                  <span className="font-bold">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="italic mb-1">{exp.position}</div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-justify">
                  {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Interests */}
      {(resume.skills.length > 0 || resume.languages.length > 0) && (
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2">Skills & Additional Information</h2>
          <div className="space-y-1">
             {resume.skills.length > 0 && (
               <div className="flex">
                 <span className="font-bold w-24 shrink-0">Skills:</span>
                 <span>{resume.skills.join(', ')}</span>
               </div>
             )}
             {resume.languages.length > 0 && (
               <div className="flex">
                 <span className="font-bold w-24 shrink-0">Languages:</span>
                 <span>{resume.languages.join(', ')}</span>
               </div>
             )}
          </div>
        </section>
      )}
    </div>
  );
};
