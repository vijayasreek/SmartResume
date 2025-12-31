import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';

export const ProfessionalTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full p-10 text-gray-800">
      {/* Header with Border Accent */}
      <div className="flex justify-between items-start border-b-4 border-green-700 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 uppercase">{resume.personalInfo.fullName}</h1>
          <p className="text-xl text-green-700 font-medium mt-1">{resume.field}</p>
        </div>
        <div className="text-right text-sm text-gray-600 space-y-1">
          <p>{resume.personalInfo.email}</p>
          <p>{resume.personalInfo.phone}</p>
          <p>{resume.personalInfo.location}</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Column */}
        <div className="w-2/3">
           {resume.personalInfo.summary && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-green-800 uppercase mb-3">Professional Profile</h2>
              <p className="text-gray-700 leading-relaxed">{resume.personalInfo.summary}</p>
            </section>
          )}

          {resume.experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-green-800 uppercase mb-4">{experienceTitle}</h2>
              <div className="space-y-6">
                {resume.experience.map((exp) => (
                  <div key={exp.id}>
                    <h3 className="font-bold text-gray-900 text-lg">{exp.position}</h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                       <span className="font-semibold text-green-700">{exp.company}</span>
                       <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                       {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Right */}
        <div className="w-1/3 bg-gray-50 p-6 rounded-lg h-fit">
           {resume.skills.length > 0 && (
             <div className="mb-8">
               <h2 className="text-lg font-bold text-green-800 uppercase mb-3">Skills</h2>
               <div className="flex flex-wrap gap-2">
                 {resume.skills.map((skill, i) => (
                   <span key={i} className="text-sm bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">{skill}</span>
                 ))}
               </div>
             </div>
           )}

           {resume.education.length > 0 && (
             <div className="mb-8">
               <h2 className="text-lg font-bold text-green-800 uppercase mb-3">Education</h2>
               <div className="space-y-4">
                 {resume.education.map((edu) => (
                   <div key={edu.id}>
                     <p className="font-bold text-gray-900">{edu.degree}</p>
                     <p className="text-sm text-gray-600">{edu.institution}</p>
                     <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
           
           {resume.languages && resume.languages.length > 0 && (
             <div>
               <h2 className="text-lg font-bold text-green-800 uppercase mb-3">Languages</h2>
               <ul className="list-disc ml-4 text-sm text-gray-700">
                 {resume.languages.map((lang, i) => <li key={i}>{lang}</li>)}
               </ul>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
