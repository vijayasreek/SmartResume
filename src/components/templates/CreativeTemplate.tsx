import React from 'react';
import { Resume, FIELD_SECTIONS } from '../../types';
import { ProfilePhoto } from './ProfilePhoto';

export const CreativeTemplate: React.FC<{ resume: Resume }> = ({ resume }) => {
  const experienceTitle = FIELD_SECTIONS[resume.field]?.experience || 'Experience';

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Header Banner */}
      <div className="bg-pink-600 text-white p-10 flex items-center justify-between">
        <div className="flex-1 pr-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">{resume.personalInfo.fullName}</h1>
          <p className="text-xl font-medium opacity-90">{resume.field}</p>
        </div>
        <ProfilePhoto 
          url={resume.personalInfo.photoUrl} 
          initials={resume.personalInfo.fullName?.charAt(0)}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg shrink-0"
          bgColor="bg-pink-500"
          iconColor="text-pink-200"
        />
      </div>

      <div className="flex flex-1">
        {/* Left Content */}
        <div className="w-[65%] p-10">
           {resume.personalInfo.summary && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-pink-600 mb-3">Profile</h2>
              <p className="text-gray-700 leading-relaxed">{resume.personalInfo.summary}</p>
            </section>
          )}

          {resume.experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-pink-600 mb-6">{experienceTitle}</h2>
              <div className="space-y-8">
                {resume.experience.map((exp, i) => (
                  <div key={exp.id || i} className="border-l-4 border-pink-200 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                    <p className="text-pink-600 font-medium mb-1">{exp.company}</p>
                    <p className="text-sm text-gray-500 mb-2">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[35%] bg-gray-50 p-10 border-l border-gray-100">
           <div className="mb-8">
             <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Contact</h3>
             <div className="space-y-2 text-sm text-gray-600">
               <p>{resume.personalInfo.email}</p>
               <p>{resume.personalInfo.phone}</p>
               <p>{resume.personalInfo.location}</p>
               <p className="text-pink-600">{resume.personalInfo.website}</p>
             </div>
           </div>

           {resume.skills.length > 0 && (
             <div className="mb-8">
               <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Skills</h3>
               <div className="flex flex-wrap gap-2">
                 {resume.skills.map((skill, i) => (
                   <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-pink-600 shadow-sm">{skill}</span>
                 ))}
               </div>
             </div>
           )}

           {resume.education.length > 0 && (
             <div>
               <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Education</h3>
               <div className="space-y-4">
                 {resume.education.map((edu, i) => (
                   <div key={edu.id || i}>
                     <p className="font-bold text-sm text-gray-900">{edu.degree}</p>
                     <p className="text-sm text-gray-600">{edu.institution}</p>
                     <p className="text-xs text-gray-400">{edu.startDate} - {edu.endDate}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
