import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { ProfilePhoto } from './ProfilePhoto';

export const MinimalistTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full p-12 text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-between items-start">
        <div className="flex-1 pr-6">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{resume.personalInfo.fullName}</h1>
          <p className="text-lg text-gray-600 uppercase tracking-widest mb-4">{resume.field}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
             {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
             {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
             {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
             {resume.personalInfo.website && <span>• {resume.personalInfo.website}</span>}
          </div>
        </div>
        
        {/* Photo Support - Always Visible */}
        <ProfilePhoto 
          url={resume.personalInfo.photoUrl} 
          initials={resume.personalInfo.fullName?.charAt(0)}
          className="w-28 h-28 shrink-0 border border-gray-200"
          bgColor="bg-gray-50"
        />
      </header>

      {/* Summary */}
      {resume.personalInfo.summary && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-1 mb-3 text-gray-500">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{resume.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-1 mb-4 text-gray-500">{experienceTitle}</h2>
          <div className="space-y-6">
            {resume.experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <span className="text-sm text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-2">{exp.company}</p>
                <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-600">
                  {exp.description.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Bottom: Education & Skills */}
      <div className="grid grid-cols-2 gap-8">
        {resume.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-1 mb-4 text-gray-500">Education</h2>
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div key={edu.id || i}>
                  <h3 className="font-bold text-sm">{edu.institution}</h3>
                  <p className="text-sm">{edu.degree}</p>
                  <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 pb-1 mb-4 text-gray-500">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-sm text-gray-700 border border-gray-200">{skill}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
