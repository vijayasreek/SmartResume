import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { Resume, ResumeField, TEMPLATES, FIELD_SKILLS } from '../types';
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
  ChevronRight, ChevronLeft, LayoutTemplate, Check, Loader2 
} from 'lucide-react';
import { cn } from '../lib/utils';

const STEPS = ['Personal', 'Experience', 'Education', 'Projects', 'Skills', 'Languages'];

export const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Resume',
  });

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

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });

  // Watch for live preview
  const formData = watch();

  useEffect(() => {
    const loadResume = async () => {
      if (!user) return;
      
      if (id === 'new') {
        // If template query param exists, use it
        const templateParam = searchParams.get('template');
        if (templateParam) {
            setValue('templateId', templateParam);
        }
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
  }, [id, user, navigate, reset, searchParams, setValue]);

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
          photoUrl: currentPersonal.photoUrl
        },
        experience: generatedData.experience,
        education: generatedData.education,
        projects: generatedData.projects,
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

  const handleAiImprove = async (index: number, type: 'experience' | 'projects') => {
    const fieldName = type === 'experience' ? `experience.${index}.description` : `projects.${index}.description`;
    const currentText = getValues(fieldName as any);
    const role = type === 'experience' ? getValues(`experience.${index}.position`) : 'Project';
    
    if (!currentText) return;

    setIsAiLoading(true);
    try {
      const improved = await aiService.improveBullets(currentText, role, getValues('field'));
      setValue(fieldName as any, improved);
    } catch (e) {
      console.error(e);
      alert('Failed to improve text.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setValue('templateId', templateId);
    setShowTemplates(false);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR - EDITOR */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white h-full z-10 shadow-xl">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <ArrowLeft size={20} />
            </button>
            <Input 
              {...register('title')} 
              className="border-none shadow-none text-lg font-semibold focus:ring-0 px-0 w-48" 
              placeholder="Resume Title"
            />
          </div>
          <div className="flex items-center gap-2">
             <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn("hidden md:flex", showTemplates && "bg-indigo-50 border-indigo-200 text-indigo-700")}
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              {showTemplates ? 'Close Templates' : 'Templates'}
            </Button>
            <Button onClick={handleSubmit(onSave)} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Template Selector Overlay */}
        {showTemplates && (
          <div className="border-b border-gray-200 bg-gray-50 p-4 overflow-x-auto shrink-0 animate-in slide-in-from-top-4">
            <div className="flex gap-4 min-w-max">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all w-32",
                    formData.templateId === t.id 
                      ? "border-indigo-600 bg-indigo-50" 
                      : "border-transparent hover:bg-gray-200"
                  )}
                >
                  <div className="w-full aspect-[3/4] bg-white shadow-sm rounded border border-gray-200 overflow-hidden relative">
                    <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                    {formData.templateId === t.id && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <div className="bg-indigo-600 text-white rounded-full p-1">
                          <Check size={12} />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
          {STEPS.map((step, idx) => (
            <button
              key={step}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeStep === idx 
                  ? "border-indigo-600 text-indigo-600 bg-white" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step 1: Personal */}
          {activeStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start gap-6">
                <div className="w-1/3">
                   <ImageUpload 
                      value={formData.personalInfo.photoUrl} 
                      onChange={(url) => setValue('personalInfo.photoUrl', url)}
                      onUpload={(file) => storage.uploadImage(file, user!.id)}
                   />
                </div>
                <div className="w-2/3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" {...register('personalInfo.fullName')} placeholder="John Doe" />
                    <Input label="Email" {...register('personalInfo.email')} placeholder="john@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone" {...register('personalInfo.phone')} placeholder="+1 234 567 890" />
                    <Input label="Location" {...register('personalInfo.location')} placeholder="New York, NY" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Website" {...register('personalInfo.website')} placeholder="www.johndoe.com" />
                 <Input label="LinkedIn" {...register('personalInfo.linkedin')} placeholder="linkedin.com/in/johndoe" />
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <label className="block text-sm font-medium text-indigo-900 mb-2">Target Profession</label>
                <div className="flex gap-2">
                  <select 
                    {...register('field')}
                    className="flex-1 rounded-md border border-indigo-200 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.keys(FIELD_SKILLS).map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                  <Button type="button" onClick={handleAiAutoFill} disabled={isAiLoading} className="shrink-0">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isAiLoading ? 'Generating...' : 'Auto-Fill'}
                  </Button>
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  Select your field and click Auto-Fill to generate a sample resume instantly.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                  <button 
                    type="button"
                    onClick={async () => {
                       setIsAiLoading(true);
                       try {
                         const summary = await aiService.generateSummary(
                           getValues('personalInfo.fullName') || 'Professional', 
                           getValues('skills'), 
                           '5 years', 
                           getValues('field')
                         );
                         setValue('personalInfo.summary', summary);
                       } catch(e) { alert('Failed to generate summary'); }
                       setIsAiLoading(false);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> AI Write
                  </button>
                </div>
                <textarea 
                  {...register('personalInfo.summary')}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Experienced professional with a proven track record..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeExp(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="Company" {...register(`experience.${index}.company`)} />
                    <Input label="Position" {...register(`experience.${index}.position`)} />
                    <Input label="Start Date" type="text" placeholder="Jan 2020" {...register(`experience.${index}.startDate`)} />
                    <div className="flex gap-2">
                       <Input label="End Date" type="text" placeholder="Present" {...register(`experience.${index}.endDate`)} />
                       <div className="flex items-center pt-6">
                         <input type="checkbox" {...register(`experience.${index}.current`)} className="mr-2" />
                         <span className="text-sm">Current</span>
                       </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                       <label className="text-sm font-medium text-gray-700">Description</label>
                       <button 
                        type="button"
                        onClick={() => handleAiImprove(index, 'experience')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                       >
                         <Sparkles className="h-3 w-3 mr-1" /> AI Improve
                       </button>
                    </div>
                    <textarea 
                      {...register(`experience.${index}.description`)}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      placeholder="• Achieved X..."
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ id: '', company: '', position: '', startDate: '', endDate: '', current: false, description: '' })} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>
            </div>
          )}

          {/* Step 3: Education */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                  <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Institution" {...register(`education.${index}.institution`)} />
                    <Input label="Degree" {...register(`education.${index}.degree`)} />
                    <Input label="Field of Study" {...register(`education.${index}.fieldOfStudy`)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Start Year" {...register(`education.${index}.startDate`)} />
                      <Input label="End Year" {...register(`education.${index}.endDate`)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendEdu({ id: '', institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' })} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </div>
          )}

          {/* Step 4: Projects */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {projFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                  <button type="button" onClick={() => removeProj(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="Project Name" {...register(`projects.${index}.name`)} />
                    <Input label="Link" {...register(`projects.${index}.link`)} />
                    <div className="col-span-2">
                       <Input label="Technologies Used" {...register(`projects.${index}.technologies`)} placeholder="React, Node.js, etc." />
                    </div>
                  </div>
                  <textarea 
                    {...register(`projects.${index}.description`)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    placeholder="Project description..."
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendProj({ id: '', name: '', description: '', link: '', technologies: '' })} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Project
              </Button>
            </div>
          )}

          {/* Step 5: Skills */}
          {activeStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white p-6 rounded-lg border border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                 <SkillsSelector 
                    field={formData.field}
                    selectedSkills={formData.skills}
                    onChange={(newSkills) => setValue('skills', newSkills)}
                 />
               </div>
            </div>
          )}

          {/* Step 6: Languages */}
          {activeStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white p-6 rounded-lg border border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                 <div className="space-y-3">
                    {formData.languages.map((lang, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input 
                                value={lang} 
                                onChange={(e) => {
                                    const newLangs = [...formData.languages];
                                    newLangs[i] = e.target.value;
                                    setValue('languages', newLangs);
                                }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => {
                                const newLangs = formData.languages.filter((_, idx) => idx !== i);
                                setValue('languages', newLangs);
                            }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setValue('languages', [...formData.languages, ''])}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Language
                    </Button>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button 
            onClick={() => {
                if (activeStep < STEPS.length - 1) {
                    setActiveStep(activeStep + 1);
                } else {
                    handleSubmit(onSave)();
                }
            }}
          >
            {activeStep === STEPS.length - 1 ? 'Finish & Save' : 'Next'} <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* RIGHT SIDEBAR - PREVIEW */}
      <div className="w-1/2 bg-gray-200 h-full overflow-y-auto p-8 flex flex-col items-center">
        <div className="mb-4 flex items-center justify-between w-[210mm]">
          <h2 className="text-gray-700 font-medium">Live Preview</h2>
          <Button onClick={handlePrint} variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
        
        <div className="shadow-2xl print:shadow-none transition-all duration-300 ease-in-out transform origin-top scale-[0.85] md:scale-100">
          <ResumePreview ref={componentRef} resume={formData} />
        </div>
      </div>
    </div>
  );
};
