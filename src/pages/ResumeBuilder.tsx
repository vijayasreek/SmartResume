import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { Resume, ResumeField, FIELD_SECTIONS } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/gemini';
import { ResumePreview } from '../components/ResumePreview';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkillsSelector } from '../components/SkillsSelector';
import { ImageUpload } from '../components/ImageUpload';
import { 
  Save, Download, Wand2, ChevronRight, ChevronLeft, 
  Layout, Briefcase, GraduationCap, User, Code, Globe, 
  Plus, Trash2, ArrowLeft 
} from 'lucide-react';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills', icon: Layout },
  { id: 'languages', label: 'Languages', icon: Globe },
];

export const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [selectedField, setSelectedField] = useState<ResumeField>('General');
  
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resumeTitle,
  });

  const { register, control, handleSubmit, watch, setValue, reset, getValues } = useForm<Resume>({
    defaultValues: {
      personalInfo: { fullName: '', email: '', phone: '', location: '', website: '', summary: '' },
      experience: [],
      education: [],
      projects: [],
      skills: [],
      languages: [],
      field: 'General'
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control, name: 'languages' as any }); // Cast for string array handling

  // Watch for preview
  const formValues = watch();

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = storage.getResume(id);
      if (existing) {
        reset(existing);
        setResumeTitle(existing.title);
        setSelectedField(existing.field);
      }
    } else if (user) {
      setValue('personalInfo.fullName', user.name);
      setValue('personalInfo.email', user.email);
    }
  }, [id, user, reset, setValue]);

  const onSubmit = (data: Resume) => {
    if (!user) return;
    
    const resumeToSave = {
      ...data,
      id: id === 'new' ? Math.random().toString(36).substr(2, 9) : id!,
      userId: user.id,
      title: resumeTitle,
      field: selectedField,
      languages: data.languages || [] // Ensure languages array exists
    };

    storage.saveResume(resumeToSave);
    alert('Resume saved successfully!');
    if (id === 'new') {
      navigate(`/edit/${resumeToSave.id}`);
    }
  };

  // --- AI Handlers ---

  const handleAiSummary = async () => {
    const { personalInfo, skills, experience } = getValues();
    if (!personalInfo.fullName) return alert('Please enter your name first');
    
    setIsAiLoading(true);
    try {
      const expText = experience.map(e => `${e.position} at ${e.company}`).join(', ');
      const summary = await aiService.generateSummary(
        selectedField, 
        skills, 
        expText, 
        selectedField
      );
      setValue('personalInfo.summary', summary);
    } catch (e) {
      console.error(e);
      alert('AI Generation failed. Please check Settings.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiImprove = async (index: number, field: 'experience' | 'projects') => {
    const item = getValues()[field][index];
    if (!item.description) return;

    setIsAiLoading(true);
    try {
      const improved = await aiService.improveBullets(
        item.description, 
        field === 'experience' ? (item as any).position : (item as any).name, 
        selectedField
      );
      setValue(`${field}.${index}.description`, improved);
    } catch (e) {
      console.error(e);
      alert('AI Improvement failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFullGeneration = async () => {
    if (!confirm(`This will overwrite your current Experience, Education, and Skills with a sample ${selectedField} resume. Continue?`)) return;
    
    setIsAiLoading(true);
    try {
      const generated = await aiService.generateFromField(selectedField);
      
      // Merge generated data but keep personal info (except summary)
      const currentPersonal = getValues('personalInfo');
      
      const newValues = {
        ...getValues(),
        personalInfo: {
          ...currentPersonal,
          summary: generated.personalInfo.summary
        },
        experience: generated.experience,
        education: generated.education,
        projects: generated.projects,
        skills: generated.skills
      };
      
      reset(newValues);
    } catch (e) {
      console.error(e);
      alert('Generation failed. Please check API Key in Settings.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">Target Profession</h3>
              <div className="flex gap-2">
                <select 
                  className="flex-1 rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  value={selectedField}
                  onChange={(e) => {
                    setSelectedField(e.target.value as ResumeField);
                    setValue('field', e.target.value as ResumeField);
                  }}
                >
                  {Object.keys(FIELD_SECTIONS).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  onClick={handleFullGeneration} 
                  isLoading={isAiLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Fill
                </Button>
              </div>
              <p className="text-xs text-indigo-700 mt-2">
                Select a profession to enable tailored AI suggestions and templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <ImageUpload 
                  value={watch('personalInfo.photoUrl')} 
                  onChange={(val) => setValue('personalInfo.photoUrl', val)} 
                />
              </div>

              <Input label="Full Name" {...register('personalInfo.fullName')} placeholder="e.g. Jane Doe" />
              <Input label="Job Title" placeholder={selectedField} disabled value={selectedField} />
              <Input label="Email" {...register('personalInfo.email')} placeholder="jane@example.com" />
              <Input label="Phone" {...register('personalInfo.phone')} placeholder="+1 234 567 890" />
              <Input label="Location" {...register('personalInfo.location')} placeholder="New York, NY" />
              <Input label="Website" {...register('personalInfo.website')} placeholder="janedoe.com" />
              <Input label="LinkedIn" {...register('personalInfo.linkedin')} placeholder="linkedin.com/in/jane" />
              <Input label="GitHub" {...register('personalInfo.github')} placeholder="github.com/jane" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                <Button type="button" size="sm" variant="ghost" onClick={handleAiSummary} isLoading={isAiLoading} className="text-indigo-600">
                  <Wand2 className="h-3 w-3 mr-1" /> AI Write
                </Button>
              </div>
              <textarea 
                {...register('personalInfo.summary')}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={`Experienced ${selectedField} with a proven track record in...`}
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {FIELD_SECTIONS[selectedField]?.experience || 'Work Experience'}
              </h3>
              <Button type="button" size="sm" onClick={() => appendExp({ company: '', position: '', startDate: '', endDate: '', current: false, description: '', id: '' })}>
                <Plus className="h-4 w-4 mr-2" /> Add Position
              </Button>
            </div>

            {expFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => removeExp(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Company / Organization" {...register(`experience.${index}.company`)} />
                  <Input label="Position / Role" {...register(`experience.${index}.position`)} />
                  <Input label="Start Date" type="month" {...register(`experience.${index}.startDate`)} />
                  <div className="flex gap-2 items-end">
                    <Input label="End Date" type="month" {...register(`experience.${index}.endDate`)} disabled={watch(`experience.${index}.current`)} />
                    <div className="pb-3 flex items-center">
                      <input type="checkbox" {...register(`experience.${index}.current`)} className="mr-2" />
                      <span className="text-sm text-gray-600">Current</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Description (Bullet Points)</label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => handleAiImprove(index, 'experience')} isLoading={isAiLoading} className="text-indigo-600">
                      <Wand2 className="h-3 w-3 mr-1" /> AI Improve
                    </Button>
                  </div>
                  <textarea 
                    {...register(`experience.${index}.description`)}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="• Led a team of..."
                  />
                </div>
              </div>
            ))}
            {expFields.length === 0 && <p className="text-center text-gray-500 py-8">No experience added yet.</p>}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Education</h3>
              <Button type="button" size="sm" onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', id: '' })}>
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </div>

            {eduFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 relative group">
                <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Institution / University" {...register(`education.${index}.institution`)} />
                  <Input label="Degree" {...register(`education.${index}.degree`)} placeholder="e.g. Bachelor of Science" />
                  <Input label="Field of Study" {...register(`education.${index}.fieldOfStudy`)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Start Year" {...register(`education.${index}.startDate`)} placeholder="2018" />
                    <Input label="End Year" {...register(`education.${index}.endDate`)} placeholder="2022" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Projects & Certifications</h3>
              <Button type="button" size="sm" onClick={() => appendProj({ name: '', description: '', link: '', technologies: '', id: '' })}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            {projFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 relative group">
                <button type="button" onClick={() => removeProj(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Input label="Project / Certificate Name" {...register(`projects.${index}.name`)} />
                <Input label="Link (Optional)" {...register(`projects.${index}.link`)} placeholder="https://..." />
                <Input label="Tools / Technologies Used" {...register(`projects.${index}.technologies`)} placeholder="e.g. React, Python, Figma" />
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => handleAiImprove(index, 'projects')} isLoading={isAiLoading} className="text-indigo-600">
                      <Wand2 className="h-3 w-3 mr-1" /> AI Improve
                    </Button>
                  </div>
                  <textarea 
                    {...register(`projects.${index}.description`)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-medium text-gray-900">Skills</h3>
            <p className="text-sm text-gray-500">Select skills relevant to <strong>{selectedField}</strong> or add your own.</p>
            
            <SkillsSelector 
              field={selectedField}
              selectedSkills={watch('skills')}
              onChange={(newSkills) => setValue('skills', newSkills)}
            />
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              <Button type="button" size="sm" onClick={() => appendLang('English')}>
                <Plus className="h-4 w-4 mr-2" /> Add Language
              </Button>
            </div>
            
            <div className="space-y-3">
              {/* Note: React Hook Form Field Array with primitive strings is tricky, 
                  so we map over the watch value or controlled fields carefully */}
              {watch('languages')?.map((lang, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    {...register(`languages.${index}` as const)} 
                    placeholder="e.g. English (Native)" 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                        const current = getValues('languages');
                        setValue('languages', current.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!watch('languages') || watch('languages').length === 0) && (
                 <p className="text-center text-gray-500 py-4">No languages added.</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-100">
      
      {/* LEFT SIDEBAR: Navigation & Form */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-white border-r border-gray-200 flex flex-col h-full shadow-xl z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <input 
              type="text" 
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0 w-48 truncate"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSubmit(onSubmit)}>
              <Save className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Save</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 min-w-[4.5rem] border-b-2 transition-colors ${
                  isActive ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-[10px] font-medium uppercase tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {renderTabContent()}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <Button 
            variant="ghost" 
            disabled={activeTab === 'personal'}
            onClick={() => {
              const idx = TABS.findIndex(t => t.id === activeTab);
              if (idx > 0) setActiveTab(TABS[idx - 1].id);
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button 
            disabled={activeTab === 'languages'}
            onClick={() => {
              const idx = TABS.findIndex(t => t.id === activeTab);
              if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
            }}
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* RIGHT AREA: Live Preview */}
      <div className="flex-1 bg-gray-500/10 overflow-hidden flex flex-col relative">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
           <Button onClick={handlePrint} className="shadow-lg bg-gray-900 text-white hover:bg-black">
             <Download className="h-4 w-4 mr-2" /> Download PDF
           </Button>
        </div>

        {/* Zoomable Preview Container */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
          <div className="transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] origin-top transition-transform duration-200">
            <ResumePreview resume={{ ...formValues, field: selectedField } as Resume} ref={printRef} />
          </div>
        </div>
      </div>

    </div>
  );
};
