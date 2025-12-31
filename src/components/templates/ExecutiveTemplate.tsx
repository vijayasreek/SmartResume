import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { ProfilePhoto } from './ProfilePhoto';

export const ExecutiveTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full p-12 text-gray-900 font-serif">
      {/* Header - Flexbox to ensure photo never overlaps */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
        <div className="flex-1 pr-8">
          <h1 className="text-4xl font-bold mb-2 uppercase">{resume.personalInfo.fullName}</h1>
          <p className="text-lg italic text-gray-600 mb-3">{resume.field}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-sans">
             {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
             {resume.personalInfo.phone && <span>| {resume.personalInfo.phone}</span>}
             {resume.personalInfo.location && <span>| {resume.personalInfo.location}</span>}
          </div>
        </div>
        
        {/* Photo - Always present */}
        <ProfilePhoto 
          url={resume.personalInfo.photoUrl} 
          initials={resume.personalInfo.fullName?.charAt(0)}
          className="w-28 h-28 shrink-0 border-2 border-gray-800"
        />
      </div>

      {/* Summary */}
      {resume.personalInfo.summary && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Executive Summary</h2>
          <p className="text-sm leading-relaxed text-justify">{resume.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4">{experienceTitle}</h2>
          <div className="space-y-6">
            {resume.experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-base">{exp.company}</h3>
                  <span className="text-sm italic">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-sm font-semibold italic mb-2">{exp.position}</p>
                <ul className="list-disc list-outside ml-5 text-sm space-y-1">
                  {exp.description.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4">Education</h2>
          <div className="space-y-3">
            {resume.education.map((edu, i) => (
              <div key={edu.id || i} className="flex justify-between">
                <div>
                  <h3 className="font-bold text-sm">{edu.institution}</h3>
                  <p className="text-sm italic">{edu.degree}, {edu.fieldOfStudy}</p>
                </div>
                <span className="text-sm">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Skills */}
      {resume.skills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Core Competencies</h2>
          <p className="text-sm leading-relaxed">
            {resume.skills.join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
};
