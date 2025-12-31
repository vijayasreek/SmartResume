import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export const ModernTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full flex flex-row">
      {/* LEFT COLUMN (Sidebar) */}
      <div className="w-[35%] bg-[#F3F0FF] p-8 flex flex-col gap-8 text-gray-800">
        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative">
            {resume.personalInfo.photoUrl ? (
              <img src={resume.personalInfo.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold bg-indigo-100 text-indigo-300">
                {resume.personalInfo.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Contact</h3>
          <div className="space-y-3 text-sm">
            {resume.personalInfo.phone && <div className="flex items-center gap-3"><Phone size={14} /><span>{resume.personalInfo.phone}</span></div>}
            {resume.personalInfo.email && <div className="flex items-center gap-3"><Mail size={14} /><span className="break-all">{resume.personalInfo.email}</span></div>}
            {resume.personalInfo.location && <div className="flex items-center gap-3"><MapPin size={14} /><span>{resume.personalInfo.location}</span></div>}
            {resume.personalInfo.website && <div className="flex items-center gap-3"><Globe size={14} /><span className="break-all">{resume.personalInfo.website}</span></div>}
          </div>
        </div>

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-xs font-semibold text-indigo-600">{edu.startDate} - {edu.endDate}</p>
                  <p className="font-bold text-sm text-gray-900 mt-0.5">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Skills</h3>
            <ul className="space-y-2 text-sm">
              {resume.skills.map((skill, i) => (
                <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[65%] p-10 bg-white text-gray-800">
        <div className="mb-10 mt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{resume.personalInfo.fullName}</h1>
          <p className="text-xl text-gray-500 font-medium uppercase tracking-wide">{resume.field}</p>
        </div>

        {resume.personalInfo.summary && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
            <p className="text-sm leading-relaxed text-gray-600 text-justify">{resume.personalInfo.summary}</p>
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{experienceTitle}</h2>
            <div className="space-y-8 border-l-2 border-indigo-100 ml-1 pl-6 relative">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white ring-1 ring-indigo-100"></span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-sm font-medium text-indigo-500 mb-3">{exp.company}</p>
                  <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-gray-600">
                    {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
