import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';

export const TechTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full flex flex-row font-mono text-sm">
      {/* Main Content Left */}
      <div className="w-[70%] p-10 pr-6">
        <header className="mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{resume.personalInfo.fullName}</h1>
          <p className="text-lg text-blue-600 font-medium">{resume.field}</p>
        </header>

        {resume.personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-800 uppercase mb-3 flex items-center">
              <span className="text-blue-600 mr-2">{'>'}</span> Summary
            </h2>
            <p className="text-slate-600 leading-relaxed">{resume.personalInfo.summary}</p>
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-800 uppercase mb-4 flex items-center">
              <span className="text-blue-600 mr-2">{'>'}</span> {experienceTitle}
            </h2>
            <div className="space-y-6">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{exp.position} @ {exp.company}</h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{exp.startDate} - {exp.current ? 'Now' : exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-800 uppercase mb-4 flex items-center">
              <span className="text-blue-600 mr-2">{'>'}</span> Projects
            </h2>
            <div className="grid gap-4">
              {resume.projects.map((proj) => (
                <div key={proj.id} className="border border-slate-200 p-3 rounded bg-slate-50">
                   <div className="flex justify-between">
                     <h3 className="font-bold text-slate-900">{proj.name}</h3>
                     {proj.link && <a href={proj.link} className="text-blue-600 hover:underline text-xs">Link</a>}
                   </div>
                   <p className="text-xs text-blue-500 font-medium mb-1">{proj.technologies}</p>
                   <p className="text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar Right */}
      <div className="w-[30%] bg-slate-900 text-slate-300 p-8">
        <div className="mb-8">
          <h3 className="text-white font-bold uppercase mb-4 border-b border-slate-700 pb-2">Contact</h3>
          <div className="space-y-2 text-xs">
            <p>{resume.personalInfo.email}</p>
            <p>{resume.personalInfo.phone}</p>
            <p>{resume.personalInfo.location}</p>
            <p className="text-blue-400">{resume.personalInfo.github}</p>
            <p className="text-blue-400">{resume.personalInfo.linkedin}</p>
          </div>
        </div>

        {resume.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold uppercase mb-4 border-b border-slate-700 pb-2">Stack</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-slate-800 text-blue-300 text-xs rounded border border-slate-700">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div>
            <h3 className="text-white font-bold uppercase mb-4 border-b border-slate-700 pb-2">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-white font-bold">{edu.degree}</p>
                  <p className="text-xs text-slate-400">{edu.institution}</p>
                  <p className="text-xs text-slate-500">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
