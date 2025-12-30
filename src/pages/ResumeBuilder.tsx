import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { aiService } from '../services/gemini';
import { Resume, ResumeField, ExperienceItem, EducationItem, ProjectItem, FIELD_SECTIONS } from '../types';
import { ResumePreview } from '../components/ResumePreview';
import { SkillsSelector } from '../components/SkillsSelector';
import { ImageUpload } from '../components/ImageUpload';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Save, Download, ArrowLeft, Sparkles, Plus, Trash2, 
  ChevronRight, ChevronLeft, Layout, User, Briefcase, 
  GraduationCap, Code, Globe, Loader2, Wand2 
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { v4 as uuidv4 } from 'uuid';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'experience', label: 'Experience', icon: Layout },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'projects', label: 'Projects', icon: Globe },
];

const INITIAL_RESUME: Resume = {
  id: '',
  userId: '',
  title: 'My Resume',
  field: 'General',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
    photoUrl: ''
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume>(INITIAL_RESUME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resume.personalInfo.fullName || 'Resume',
  });

  // Load Resume
  useEffect(() => {
    const loadResume = async () => {
      if (!user) return;
      
      if (id && id !== 'new') {
        try {
          const data = await storage.getResume(id);
          if (data) {
            setResume(data);
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Error loading resume:", error);
        }
      } else {
        // New Resume
        setResume(prev => ({
          ...prev,
          userId: user.id,
          id: `temp-${uuidv4()}`,
          personalInfo: { ...prev.personalInfo, fullName: user.name, email: user.email }
        }));
      }
      setLoading(false);
    };

    loadResume();
  }, [id, user, navigate]);

  // Save Resume
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const saved = await storage.saveResume(resume, user.id);
      // If it was a new resume, update URL without reload
      if (id === 'new' || resume.id.startsWith('temp-')) {
        window.history.replaceState(null, '', `/edit/${saved.id}`);
        setResume(saved);
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Field Updates
  const updatePersonalInfo = (field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateField = (field: ResumeField) => {
    setResume(prev => ({ ...prev, field }));
  };

  // Array Updates (Exp, Edu, Proj)
  const addItem = (section: 'experience' | 'education' | 'projects') => {
    const newId = uuidv4();
    const newItem = section === 'experience' 
      ? { id: newId, company: '', position: '', startDate: '', endDate: '', current: false, description: '' }
      : section === 'education'
      ? { id: newId, institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }
      : { id: newId, name: '', description: '', link: '', technologies: '' };

    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const updateItem = (section: 'experience' | 'education' | 'projects', id: string, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (section: 'experience' | 'education' | 'projects', id: string) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].filter((item: any) => item.id !== id)
    }));
  };

  // AI Actions
  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const summary = await aiService.generateSummary(
        resume.personalInfo.fullName || 'Professional',
        resume.skills,
        resume.experience.map(e => e.position).join(', '),
        resume.field
      );
      updatePersonalInfo('summary', summary);
    } catch (error) {
      alert("AI Generation failed. Please check your settings.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveBullet = async (expId: string, text: string) => {
    if (!text) return;
    setAiLoading(true);
    try {
      const improved = await aiService.improveBullets(text, 'Professional', resume.field);
      updateItem('experience', expId, 'description', improved);
    } catch (error) {
      alert("AI Improvement failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoFill = async () => {
    if (!confirm("This will overwrite your current sections with AI generated sample data. Continue?")) return;
    setAiLoading(true);
    try {
      const generated = await aiService.generateFromField(resume.field);
      setResume(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, summary: generated.personalInfo.summary },
        experience: generated.experience.map((e: any) => ({ ...e, id: uuidv4() })),
        education: generated.education.map((e: any) => ({ ...e, id: uuidv4() })),
        projects: generated.projects.map((e: any) => ({ ...e, id: uuidv4() })),
        skills: generated.skills
      }));
    } catch (error) {
      console.error(error);
      alert("Auto-fill failed.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  const CurrentStepIcon = STEPS[activeStep].icon;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR - EDITOR */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white h-full">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="font-semibold text-gray-900">Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button size="sm" onClick={() => handlePrint()}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-2 py-4 bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0">
          <div className="flex justify-center space-x-2 min-w-max px-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isCompleted = activeStep > idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isCompleted 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-white' : ''}`} />
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-2xl mx-auto space-y-6 pb-20">
            
            {/* STEP 1: PERSONAL */}
            {activeStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
                  <User className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-indigo-900">Personal Details</h3>
                    <p className="text-sm text-indigo-700">Start with your basic contact information and a professional photo.</p>
                  </div>
                </div>

                <ImageUpload 
                  value={resume.personalInfo.photoUrl} 
                  onChange={(url) => updatePersonalInfo('photoUrl', url)} 
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" value={resume.personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} placeholder="e.g. Jane Doe" />
                  <Input label="Job Title" value={resume.title} onChange={e => setResume(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Senior Developer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" value={resume.personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} />
                  <Input label="Phone" value={resume.personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} placeholder="+1 234 567 890" />
                </div>
                <Input label="Location" value={resume.personalInfo.location} onChange={e => updatePersonalInfo('location', e.target.value)} placeholder="City, Country" />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="LinkedIn URL" value={resume.personalInfo.linkedin} onChange={e => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
                  <Input label="Portfolio / Website" value={resume.personalInfo.website} onChange={e => updatePersonalInfo('website', e.target.value)} placeholder="mysite.com" />
                </div>

                {/* Languages Section - Added here for convenience */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Languages</h3>
                  <SkillsSelector 
                    field="General" // Generic for languages
                    selectedSkills={resume.languages || []} 
                    onChange={(langs) => setResume(prev => ({ ...prev, languages: langs }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Type a language and press Enter (e.g. "English", "Spanish")</p>
                </div>
              </div>
            )}

            {/* STEP 2: PROFESSIONAL */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Target Profession
                  </h3>
                  <p className="text-sm text-purple-700 mb-3">Select your field to get tailored AI suggestions and structure.</p>
                  
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-purple-500"
                      value={resume.field}
                      onChange={(e) => updateField(e.target.value as ResumeField)}
                    >
                      {Object.keys(FIELD_SECTIONS).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <Button variant="secondary" onClick={handleAutoFill} isLoading={aiLoading} title="Auto-fill sample content">
                      <Wand2 className="h-4 w-4 mr-2" /> Auto-Fill
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Professional Summary</label>
                    <Button variant="ghost" size="sm" onClick={handleGenerateSummary} isLoading={aiLoading} className="text-indigo-600">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Write
                    </Button>
                  </div>
                  <textarea 
                    className="w-full h-32 rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                    value={resume.personalInfo.summary}
                    onChange={e => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Briefly describe your professional background and goals..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {FIELD_SECTIONS[resume.field]?.experience || 'Experience'}
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => addItem('experience')}>
                      <Plus className="h-4 w-4 mr-2" /> Add Position
                    </Button>
                 </div>

                 {resume.experience.map((exp, index) => (
                   <div key={exp.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                     <button 
                        onClick={() => removeItem('experience', exp.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                     
                     <div className="grid grid-cols-2 gap-4 mb-3">
                       <Input label="Position / Role" value={exp.position} onChange={e => updateItem('experience', exp.id, 'position', e.target.value)} />
                       <Input label="Company / Organization" value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-3">
                       <Input label="Start Date" type="month" value={exp.startDate} onChange={e => updateItem('experience', exp.id, 'startDate', e.target.value)} />
                       <div className="flex items-end gap-2">
                         {!exp.current && (
                           <Input label="End Date" type="month" value={exp.endDate} onChange={e => updateItem('experience', exp.id, 'endDate', e.target.value)} />
                         )}
                         <label className="flex items-center mb-3 text-sm text-gray-600 cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={exp.current} 
                              onChange={e => updateItem('experience', exp.id, 'current', e.target.checked)}
                              className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" 
                            />
                           Current
                         </label>
                       </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-medium text-gray-500">Description (Bullet points)</label>
                          <button 
                            onClick={() => handleImproveBullet(exp.id, exp.description)}
                            className="text-xs text-indigo-600 flex items-center hover:underline"
                            disabled={aiLoading}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Improve with AI
                          </button>
                        </div>
                        <textarea 
                          className="w-full h-24 rounded-md border border-gray-300 p-2 text-sm"
                          value={exp.description}
                          onChange={e => updateItem('experience', exp.id, 'description', e.target.value)}
                          placeholder="• Achieved X by doing Y..."
                        />
                     </div>
                   </div>
                 ))}
                 
                 {resume.experience.length === 0 && (
                   <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                     No experience added yet.
                   </div>
                 )}
              </div>
            )}

            {/* STEP 4: EDUCATION */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Education</h3>
                    <Button size="sm" variant="outline" onClick={() => addItem('education')}>
                      <Plus className="h-4 w-4 mr-2" /> Add Education
                    </Button>
                 </div>

                 {resume.education.map((edu) => (
                   <div key={edu.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                     <button 
                        onClick={() => removeItem('education', edu.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                     
                     <div className="grid grid-cols-2 gap-4 mb-3">
                       <Input label="School / University" value={edu.institution} onChange={e => updateItem('education', edu.id, 'institution', e.target.value)} />
                       <Input label="Degree" value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <Input label="Field of Study" value={edu.fieldOfStudy} onChange={e => updateItem('education', edu.id, 'fieldOfStudy', e.target.value)} />
                       <div className="grid grid-cols-2 gap-2">
                          <Input label="Start Year" value={edu.startDate} onChange={e => updateItem('education', edu.id, 'startDate', e.target.value)} placeholder="2018" />
                          <Input label="End Year" value={edu.endDate} onChange={e => updateItem('education', edu.id, 'endDate', e.target.value)} placeholder="2022" />
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {/* STEP 5: SKILLS */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="font-medium text-indigo-900">Skills & Expertise</h3>
                  <p className="text-sm text-indigo-700">Add skills relevant to <strong>{resume.field}</strong>. We've suggested some for you below.</p>
                </div>

                <SkillsSelector 
                  field={resume.field} 
                  selectedSkills={resume.skills} 
                  onChange={(skills) => setResume(prev => ({ ...prev, skills }))} 
                />
              </div>
            )}

            {/* STEP 6: PROJECTS */}
            {activeStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Projects & Certifications</h3>
                    <Button size="sm" variant="outline" onClick={() => addItem('projects')}>
                      <Plus className="h-4 w-4 mr-2" /> Add Project
                    </Button>
                 </div>

                 {resume.projects.map((proj) => (
                   <div key={proj.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                     <button 
                        onClick={() => removeItem('projects', proj.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                     
                     <Input label="Project Name" value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} className="mb-3" />
                     <Input label="Link (Optional)" value={proj.link} onChange={e => updateItem('projects', proj.id, 'link', e.target.value)} className="mb-3" />
                     <Input label="Technologies / Tools" value={proj.technologies} onChange={e => updateItem('projects', proj.id, 'technologies', e.target.value)} className="mb-3" />
                     
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                          className="w-full h-20 rounded-md border border-gray-300 p-2 text-sm"
                          value={proj.description}
                          onChange={e => updateItem('projects', proj.id, 'description', e.target.value)}
                        />
                     </div>
                   </div>
                 ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="h-16 border-t border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {activeStep + 1} of {STEPS.length}
          </div>

          <Button 
            onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
            disabled={activeStep === STEPS.length - 1}
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="w-1/2 bg-gray-500 overflow-y-auto p-8 flex justify-center items-start shadow-inner">
        <div className="transform scale-[0.85] origin-top shadow-2xl">
          <ResumePreview resume={resume} ref={printRef} />
        </div>
      </div>
    </div>
  );
};
