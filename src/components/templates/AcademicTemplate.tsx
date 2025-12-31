import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { ProfilePhoto } from './ProfilePhoto';

export const AcademicTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Professional Experience';

  return (
    <div className="bg-white w-full h-full p-12 text-gray-900 font-serif leading-relaxed">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-6">
        <div className="flex-1 pr-6">
          <h1 className="text-3xl font-bold mb-2">{resume.personalInfo.fullName}</h1>
          <div className="flex flex-col text-sm text-gray-700">
            {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
            {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
            {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
            {resume.personalInfo.website && <span>{resume.personalInfo.website}</span>}
          </div>
        </div>
        <ProfilePhoto 
          url={resume.personalInfo.photoUrl} 
          initials={resume.personalInfo.fullName?.charAt(0)}
          className="w-24 h-24 border border-gray-200 shrink-0"
        />
      </div>

      {/* Education First for Academic */}
      {resume.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Education</h2>
          <div className="space-y-3">
            {resume.education.map((edu, i) => (
              <div key={edu.id || i}>
                <div className="flex justify-between font-bold">
                  <span>{edu.institution}</span>
                  <span>{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="flex justify-between italic">
                  <span>{edu.degree}, {edu.fieldOfStudy}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      {resume.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Research Interests & Summary</h2>
          <p className="text-sm text-justify">{resume.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">{experienceTitle}</h2>
          <div className="space-y-5">
            {resume.experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className="flex justify-between font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="italic mb-1">{exp.position}</div>
                <ul className="list-disc list-outside ml-5 text-sm space-y-1">
                  {exp.description.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects / Publications */}
      {resume.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Projects & Publications</h2>
          <div className="space-y-3">
            {resume.projects.map((proj, i) => (
              <div key={proj.id || i}>
                <div className="font-bold">{proj.name}</div>
                <p className="text-sm">{proj.description}</p>
                {proj.link && <a href={proj.link} className="text-xs text-blue-800 underline block mt-1">{proj.link}</a>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section>
          <h2 className="text-base font-bold uppercase border-b border-gray-300 mb-3 pb-1">Skills</h2>
          <p className="text-sm">{resume.skills.join(', ')}</p>
        </section>
      )}
    </div>
  );
};
