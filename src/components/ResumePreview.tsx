import React from 'react';
import { Resume, FIELD_SECTIONS } from '../types';
import { Phone, Mail, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
  resume: Resume;
  ref?: React.Ref<HTMLDivElement>;
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ resume }, ref) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] shadow-2xl mx-auto flex overflow-hidden" id="resume-preview">
      
      {/* LEFT COLUMN (Sidebar) */}
      <div className="w-[35%] bg-[#F3F0FF] p-8 flex flex-col gap-8 text-gray-800">
        
        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative">
            {resume.personalInfo.photoUrl ? (
              <img 
                src={resume.personalInfo.photoUrl} 
                alt={resume.personalInfo.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold bg-indigo-100 text-indigo-300">
                {resume.personalInfo.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Contact</h3>
          <div className="space-y-3 text-sm">
            {resume.personalInfo.phone && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-full text-indigo-600 shadow-sm">
                  <Phone size={14} />
                </div>
                <span>{resume.personalInfo.phone}</span>
              </div>
            )}
            {resume.personalInfo.email && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-full text-indigo-600 shadow-sm">
                  <Mail size={14} />
                </div>
                <span className="break-all">{resume.personalInfo.email}</span>
              </div>
            )}
            {resume.personalInfo.location && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-full text-indigo-600 shadow-sm">
                  <MapPin size={14} />
                </div>
                <span>{resume.personalInfo.location}</span>
              </div>
            )}
            {resume.personalInfo.website && (
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-full text-indigo-600 shadow-sm">
                  <Globe size={14} />
                </div>
                <span className="break-all">{resume.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Skills</h3>
            <ul className="space-y-2 text-sm">
              {resume.skills.map((skill, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Education (Moved to Sidebar per reference) */}
        {resume.education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <p className="text-xs font-semibold text-indigo-600">
                    {edu.startDate} - {edu.endDate}
                  </p>
                  <p className="font-bold text-sm text-gray-900 mt-0.5">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">Languages</h3>
            <ul className="space-y-2 text-sm">
              {resume.languages.map((lang, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{lang}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN (Main Content) */}
      <div className="w-[65%] p-10 bg-white text-gray-800">
        
        {/* Header */}
        <div className="mb-10 mt-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {resume.personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-500 font-medium uppercase tracking-wide">
            {resume.field === 'General' ? 'Professional Role' : resume.field}
          </p>
        </div>

        {/* About Me */}
        {resume.personalInfo.summary && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
            <p className="text-sm leading-relaxed text-gray-600 text-justify">
              {resume.personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{experienceTitle}</h2>
            <div className="space-y-8 border-l-2 border-indigo-100 ml-1 pl-6 relative">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white ring-1 ring-indigo-100"></span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-indigo-500 mb-3">{exp.company}</p>
                  
                  <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-gray-600 leading-relaxed">
                    {exp.description.split('\n').map((line, i) => (
                      line.trim() && <li key={i}>{line.trim().replace(/^•\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (If any, rendered at bottom) */}
        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio & Projects</h2>
            <div className="grid gap-4">
              {resume.projects.map((proj) => (
                <div key={proj.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                        View Project <Globe size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 italic mt-1 mb-2">{proj.technologies}</p>
                  <p className="text-sm text-gray-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
