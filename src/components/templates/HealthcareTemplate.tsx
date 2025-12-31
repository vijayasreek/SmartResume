import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { ProfilePhoto } from './ProfilePhoto';

export const HealthcareTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Clinical Experience';

  return (
    <div className="bg-white w-full h-full flex flex-col font-sans text-gray-800">
      {/* Header */}
      <div className="bg-cyan-600 text-white p-8 flex justify-between items-center">
        <div className="flex-1 pr-6">
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{resume.personalInfo.fullName}</h1>
          <p className="text-lg font-medium opacity-90">{resume.field}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm opacity-90">
            {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
            {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
            {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
          </div>
        </div>
        <ProfilePhoto 
          url={resume.personalInfo.photoUrl} 
          initials={resume.personalInfo.fullName?.charAt(0)}
          className="w-24 h-24 rounded-full border-2 border-white shrink-0"
          bgColor="bg-cyan-500"
          iconColor="text-cyan-200"
        />
      </div>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="w-2/3 p-8">
          {resume.personalInfo.summary && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-cyan-700 uppercase mb-3 border-b border-cyan-100 pb-1">Professional Profile</h2>
              <p className="text-sm leading-relaxed">{resume.personalInfo.summary}</p>
            </section>
          )}

          {resume.experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-cyan-700 uppercase mb-3 border-b border-cyan-100 pb-1">{experienceTitle}</h2>
              <div className="space-y-6">
                {resume.experience.map((exp, i) => (
                  <div key={exp.id || i}>
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <div className="flex justify-between text-sm text-cyan-600 mb-2 font-medium">
                      <span>{exp.company}</span>
                      <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                      {exp.description.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-cyan-700 uppercase mb-3 border-b border-cyan-100 pb-1">Education</h2>
              <div className="space-y-3">
                {resume.education.map((edu, i) => (
                  <div key={edu.id || i}>
                    <div className="font-bold text-sm">{edu.institution}</div>
                    <div className="text-sm">{edu.degree}</div>
                    <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-1/3 bg-cyan-50 p-6 border-l border-cyan-100">
           {/* Certifications / Skills */}
           {resume.skills.length > 0 && (
             <div className="mb-8">
               <h2 className="text-lg font-bold text-cyan-800 uppercase mb-3">Skills & Certs</h2>
               <div className="flex flex-col gap-2">
                 {resume.skills.map((skill, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                     <span className="text-sm text-gray-700">{skill}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {resume.languages && resume.languages.length > 0 && (
             <div className="mb-8">
               <h2 className="text-lg font-bold text-cyan-800 uppercase mb-3">Languages</h2>
               <ul className="space-y-1 text-sm text-gray-700">
                 {resume.languages.map((lang, i) => <li key={i}>{lang}</li>)}
               </ul>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
