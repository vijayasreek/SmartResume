import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { Resume, ResumeField, TEMPLATES, FIELD_SKILLS, FIELD_SECTIONS } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/gemini';
import { ResumePreview } from '../components/ResumePreview';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkillsSelector } from '../components/SkillsSelector';
import { ImageUpload } from '../components/ImageUpload';
import { 
  Save, Download, ArrowLeft, Plus, Trash2, Sparkles, 
  ChevronRight, ChevronLeft, LayoutTemplate, Check, Eye, Edit2, Loader2 
} from 'lucide-react';
import { cn, generateId } from '../lib/utils';

const STEPS = ['Personal', 'Experience', 'Education', 'Projects', 'Skills', 'Languages'];

export const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  // Print Ref
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Resume',
  });

  // Form Setup
  const { register, control, handleSubmit, watch, reset, setValue, getValues } = useForm<Resume>({
    defaultValues: {
      title: 'My Resume',
      field: 'General',
      templateId: searchParams.get('template') || 'modern',
      personalInfo: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      languages: []
    }
  });

  // Field Arrays
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });

  // Watch data for live preview
  const formData = watch();

  // Load Resume Data
  useEffect(() => {
    const loadResume = async () => {
      if (!user) return;
      if (id === 'new') {
        setLoading(false);
        return;
      }
      try {
        const data = await storage.getResume(id!);
        if (data) {
          reset(data);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, [id, user, navigate, reset]);

  // Save Handler
  const onSave = async (data: Resume) => {
    if (!user) return;
    setSaving(true);
    try {
      const saved = await storage.saveResume(data, user.id);
      if (id === 'new') {
        navigate(`/edit/${saved.id}`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // AI Handlers
  const handleAiAutoFill = async () => {
    const field = getValues('field');
    if (!confirm(`Auto-fill resume for ${field}? This will overwrite current fields.`)) return;
    
    setIsAiLoading(true);
    try {
      const generatedData = await aiService.generateFromField(field);
      const currentPersonal = getValues('personalInfo');
      
      const newValues = {
        ...getValues(),
        personalInfo: {
          ...generatedData.personalInfo,
          fullName: currentPersonal.fullName || 'Your Name',
          email: currentPersonal.email || '',
          phone: currentPersonal.phone || '',
          location: currentPersonal.location || '',
          photoUrl: currentPersonal.photoUrl,
          website: currentPersonal.website || '',
          linkedin: currentPersonal.linkedin || '',
          github: currentPersonal.github || ''
        },
        experience: generatedData.experience.map((e: any) => ({ ...e, id: generateId() })),
        education: generatedData.education.map((e: any) => ({ ...e, id: generateId() })),
        projects: generatedData.projects.map((e: any) => ({ ...e, id: generateId() })),
        skills: generatedData.skills
      };
      
      reset(newValues);
    } catch (e) {
      console.error(e);
      alert('Failed to generate. Please check your API key settings.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImproveDescription = async (index: number, text: string) => {
    if (!text) return;
    setIsAiLoading(true);
    try {
      const field = getValues('field');
      const role = getValues(`experience.${index}.position`);
      const improved = await aiService.improveBullets(text, role, field);
      setValue(`experience.${index}.description`, improved);
    } catch (e) {
      console.error(e);
      alert('AI improvement failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* HEADER - Fixed Top */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <input
              {...register('title')}
              className="text-lg font-bold text-gray-900 border-none focus:ring-0 p-0 bg-transparent placeholder-gray-400"
              placeholder="Resume Title"
            />
            <span className="text-xs text-gray-500">{saving ? 'Saving...' : 'All changes saved'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Template Selector (Simple Dropdown) */}
          <div className="hidden sm:block relative group">
             <select 
               {...register('templateId')}
               className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
             >
               {TEMPLATES.map(t => (
                 <option key={t.id} value={t.id}>{t.name}</option>
               ))}
             </select>
             <LayoutTemplate className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          <Button variant="outline" onClick={() => handleSubmit(onSave)()} disabled={saving} className="hidden sm:flex">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT - Split Screen */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: EDITOR */}
        <div className={cn(
          "flex-1 bg-white flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden",
          showMobilePreview ? "hidden md:flex" : "flex"
        )}>
          {/* Stepper Navigation */}
          <div className="h-14 border-b border-gray-200 flex items-center px-4 overflow-x-auto scrollbar-hide shrink-0 bg-white">
            <div className="flex space-x-1">
              {STEPS.map((step, i) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeStep === i 
                      ? "bg-indigo-100 text-indigo-700" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              
              {/* STEP 0: PERSONAL */}
              {activeStep === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-indigo-900">Target Profession</h3>
                        <p className="text-sm text-indigo-700">Select a field to get AI-tailored suggestions.</p>
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleAiAutoFill} 
                        disabled={isAiLoading}
                        size="sm"
                        className="bg-indigo-600 text-white shrink-0"
                      >
                        {isAiLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Auto-Fill with AI
                      </Button>
                    </div>
                    <select
                      {...register('field')}
                      className="w-full rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Object.keys(FIELD_SKILLS).map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                     {/* Photo Upload - Takes 4 columns on desktop */}
                     <div className="md:col-span-4 flex flex-col gap-2">
                        <label className="block text-sm font-semibold text-gray-700">Profile Photo</label>
                        <ImageUpload 
                          value={watch('personalInfo.photoUrl')}
                          onChange={(url) => setValue('personalInfo.photoUrl', url)}
                          onUpload={async (file) => {
                             if (!user) throw new Error("Login required");
                             return await storage.uploadImage(file, user.id);
                          }}
                        />
                     </div>

                     {/* Basic Info - Takes 8 columns */}
                     <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Full Name" {...register('personalInfo.fullName')} placeholder="Jane Doe" />
                        <Input label="Email" {...register('personalInfo.email')} placeholder="jane@example.com" />
                        <Input label="Phone" {...register('personalInfo.phone')} placeholder="+1 234 567 890" />
                        <Input label="Location" {...register('personalInfo.location')} placeholder="New York, NY" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Website" {...register('personalInfo.website')} placeholder="janedoe.com" />
                    <Input label="LinkedIn" {...register('personalInfo.linkedin')} placeholder="linkedin.com/in/jane" />
                    <Input label="GitHub/Portfolio" {...register('personalInfo.github')} placeholder="github.com/jane" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Professional Summary</label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600 h-auto py-0 px-2"
                        onClick={async () => {
                           setIsAiLoading(true);
                           try {
                             const summary = await aiService.generateSummary(
                               getValues('title'), 
                               getValues('skills'), 
                               getValues('experience.0.description') || '',
                               getValues('field')
                             );
                             setValue('personalInfo.summary', summary);
                           } catch(e) { alert('AI Error'); }
                           setIsAiLoading(false);
                        }}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> AI Write
                      </Button>
                    </div>
                    <textarea
                      {...register('personalInfo.summary')}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Experienced professional with a proven track record..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 1: EXPERIENCE */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                    <Button type="button" onClick={() => appendExp({ id: generateId(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' })} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Job
                    </Button>
                  </div>

                  {expFields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative group">
                      <button
                        type="button"
                        onClick={() => removeExp(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <Input label="Job Title" {...register(`experience.${index}.position`)} placeholder="Senior Engineer" />
                        <Input label="Company" {...register(`experience.${index}.company`)} placeholder="Tech Corp" />
                        <Input label="Start Date" type="month" {...register(`experience.${index}.startDate`)} />
                        <div className="flex flex-col">
                           <Input 
                             label="End Date" 
                             type="month" 
                             {...register(`experience.${index}.endDate`)} 
                             disabled={watch(`experience.${index}.current`)} 
                           />
                           <div className="mt-2 flex items-center">
                             <input 
                               type="checkbox" 
                               id={`current-${index}`}
                               {...register(`experience.${index}.current`)}
                               className="rounded text-indigo-600 focus:ring-indigo-500"
                             />
                             <label htmlFor={`current-${index}`} className="ml-2 text-sm text-gray-600">I currently work here</label>
                           </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-gray-700">Description</label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 h-auto py-0 px-2"
                            onClick={() => handleImproveDescription(index, getValues(`experience.${index}.description`))}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Improve
                          </Button>
                        </div>
                        <textarea
                          {...register(`experience.${index}.description`)}
                          rows={4}
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                          placeholder="• Achieved X by doing Y..."
                        />
                      </div>
                    </div>
                  ))}
                  {expFields.length === 0 && <p className="text-center text-gray-500 py-8">No experience added yet.</p>}
                </div>
              )}

              {/* STEP 2: EDUCATION */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Education</h2>
                    <Button type="button" onClick={() => appendEdu({ id: generateId(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' })} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Education
                    </Button>
                  </div>

                  {eduFields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeEdu(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="School / University" {...register(`education.${index}.institution`)} />
                        <Input label="Degree" {...register(`education.${index}.degree`)} placeholder="Bachelor's" />
                        <Input label="Field of Study" {...register(`education.${index}.fieldOfStudy`)} placeholder="Computer Science" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input label="Start Year" {...register(`education.${index}.startDate`)} placeholder="2018" />
                          <Input label="End Year" {...register(`education.${index}.endDate`)} placeholder="2022" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: PROJECTS */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                    <Button type="button" onClick={() => appendProj({ id: generateId(), name: '', description: '', link: '', technologies: '' })} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Project
                    </Button>
                  </div>

                  {projFields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeProj(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input label="Project Name" {...register(`projects.${index}.name`)} />
                          <Input label="Link (Optional)" {...register(`projects.${index}.link`)} />
                        </div>
                        <Input label="Technologies Used" {...register(`projects.${index}.technologies`)} placeholder="React, Node.js, AWS" />
                        <textarea
                          {...register(`projects.${index}.description`)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                          placeholder="Brief description of the project..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 4: SKILLS */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <SkillsSelector
                      field={watch('field')}
                      selectedSkills={watch('skills')}
                      onChange={(skills) => setValue('skills', skills)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: LANGUAGES */}
              {activeStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-xl font-bold text-gray-900">Languages</h2>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <SkillsSelector
                      field="General" // Reuse selector for languages
                      selectedSkills={watch('languages') || []}
                      onChange={(langs) => setValue('languages', langs)}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="h-16 border-t border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            <div className="text-sm text-gray-500 font-medium">
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

        {/* RIGHT PANEL: PREVIEW */}
        <div className={cn(
          "flex-1 bg-gray-100 h-full overflow-y-auto flex justify-center p-8 transition-all duration-300",
          showMobilePreview ? "fixed inset-0 z-30 pt-20" : "hidden md:flex"
        )}>
          <div className="w-full max-w-[210mm]">
             <ResumePreview resume={formData} ref={componentRef} />
          </div>
        </div>

        {/* Mobile Preview Toggle */}
        <button
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="md:hidden fixed bottom-20 right-6 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-indigo-700 transition-colors"
        >
          {showMobilePreview ? <Edit2 className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        </button>

      </div>
    </div>
  );
};
