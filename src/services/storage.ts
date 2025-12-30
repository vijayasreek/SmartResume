import { supabase } from '../lib/supabase';
import { Resume, User } from '../types';
import { Session } from '@supabase/supabase-js';

export const storage = {
  // --- Auth & User ---
  // Optimized to accept session if we already have it (avoids extra call)
  getCurrentUser: async (existingSession?: Session | null): Promise<User | null> => {
    let session = existingSession;
    
    if (!session) {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    }

    if (!session?.user) return null;

    // Fetch profile to get the name
    // We use maybeSingle() instead of single() to avoid errors if profile creation is delayed
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', session.user.id)
      .maybeSingle();

    return {
      id: session.user.id,
      email: session.user.email!,
      // Prioritize profile name, fallback to metadata (faster), then default
      name: profile?.name || session.user.user_metadata?.name || 'User',
    };
  },

  // --- Resumes ---
  getResumes: async (userId: string): Promise<Resume[]> => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      field: r.field,
      personalInfo: r.personal_info,
      experience: r.experience,
      education: r.education,
      projects: r.projects,
      skills: r.skills,
      languages: r.languages,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },

  getResume: async (id: string): Promise<Resume | null> => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      field: data.field,
      personalInfo: data.personal_info,
      experience: data.experience,
      education: data.education,
      projects: data.projects,
      skills: data.skills,
      languages: data.languages,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  saveResume: async (resume: Resume, userId: string): Promise<Resume> => {
    const dbResume = {
      user_id: userId,
      title: resume.title,
      field: resume.field,
      personal_info: resume.personalInfo,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      skills: resume.skills,
      languages: resume.languages,
      updated_at: new Date().toISOString()
    };

    let result;
    if (resume.id && !resume.id.startsWith('temp-')) {
      const { data, error } = await supabase
        .from('resumes')
        .update(dbResume)
        .eq('id', resume.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert(dbResume)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return {
      id: result.id,
      userId: result.user_id,
      title: result.title,
      field: result.field,
      personalInfo: result.personal_info,
      experience: result.experience,
      education: result.education,
      projects: result.projects,
      skills: result.skills,
      languages: result.languages,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  },

  deleteResume: async (id: string) => {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
