import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../types';
import { Button } from '../components/ui/Button';
import { ArrowRight, Check } from 'lucide-react';

export const TemplatesGallery = () => {
  const navigate = useNavigate();

  const handleSelect = (templateId: string) => {
    // Navigate to create new with this template pre-selected
    // We'll pass it via state or query param
    navigate(`/create?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Choose Your Resume Template</h1>
          <p className="mt-4 text-xl text-gray-500">Professional, ATS-friendly designs for every career path.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="h-64 bg-gray-100 relative overflow-hidden group">
                 {/* Placeholder for real preview - using color blocks to simulate */}
                 <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => handleSelect(template.id)} className="bg-white text-gray-900 hover:bg-gray-100">
                      Use This Template
                    </Button>
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                <p className="mt-2 text-gray-500 text-sm flex-1">{template.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button variant="outline" className="w-full group" onClick={() => handleSelect(template.id)}>
                    Select Template <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
