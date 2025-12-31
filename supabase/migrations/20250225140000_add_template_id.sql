-- Add template_id column to resumes table
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'modern';

-- Update existing rows to have default template
UPDATE resumes SET template_id = 'modern' WHERE template_id IS NULL;
