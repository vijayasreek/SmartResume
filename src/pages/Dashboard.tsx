import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Resume } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, FileText, Trash2, Copy, Edit, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setResumes(storage.getResumes(user.id));
    }
  }, [user]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this resume?')) {
      storage.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDuplicate = (resume: Resume, e: React.MouseEvent) => {
    e.preventDefault();
    const newResume = {
      ...resume,
      id: Math.random().toString(36).substr(2, 9),
      title: `${resume.title} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    storage.saveResume(newResume);
    if (user) setResumes(storage.getResumes(user.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <p className="mt-1 text-gray-500">Manage and edit your professional resumes</p>
        </div>
        <Link to="/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new resume.</p>
          <div className="mt-6">
            <Link to="/create">
              <Button>Create Resume</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-64"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {resume.field}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 truncate" title={resume.title}>
                  {resume.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/edit/${resume.id}`)}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => handleDuplicate(resume, e)} className="px-2" title="Duplicate">
                    <Copy className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(resume.id, e)} className="px-2 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
