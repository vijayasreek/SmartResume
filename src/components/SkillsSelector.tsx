import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { ResumeField, FIELD_SKILLS } from '../types';
import { Button } from './ui/Button';

interface SkillsSelectorProps {
  field: ResumeField;
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export const SkillsSelector: React.FC<SkillsSelectorProps> = ({ field, selectedSkills, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Update suggestions based on field, filtering out already selected ones
    const fieldSuggestions = FIELD_SKILLS[field] || FIELD_SKILLS['General'];
    setSuggestions(fieldSuggestions.filter(s => !selectedSkills.includes(s)));
  }, [field, selectedSkills]);

  const addSkill = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill.trim())) {
      onChange([...selectedSkills, skill.trim()]);
    }
    setInputValue('');
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedSkills.map((skill, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-2 inline-flex items-center justify-center p-0.5 rounded-full hover:bg-indigo-200 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill and press Enter..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="button" onClick={() => addSkill(inputValue)} size="sm" variant="secondary">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-2">Suggested for {field}:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
