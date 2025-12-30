import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService } from '../services/gemini';

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) {
        setApiKey(key);
        setShowCustom(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
        handleReset();
        return;
    }
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setStatus('idle');
    alert('Custom API Key saved locally!');
  };

  const handleTest = async () => {
    setStatus('testing');
    setErrorMsg('');
    
    // Temporarily set/unset for the test
    if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
        localStorage.removeItem('gemini_api_key');
    }

    try {
      await aiService.testConnection();
      setStatus('success');
    } catch (e: any) {
      console.error("Connection Test Error:", e);
      
      // AUTO-FIX: If custom key fails, revert to system default
      if (apiKey && (e.message?.includes('400') || e.message?.includes('403') || e.message?.includes('key'))) {
          try {
              console.log("Custom key failed. Reverting to System Key...");
              localStorage.removeItem('gemini_api_key');
              setApiKey('');
              await aiService.testConnection();
              setStatus('success');
              alert("Your custom key was invalid. We've switched back to the System Default Key, which is working correctly.");
              return;
          } catch (retryError) {}
      }

      setStatus('error');
      setErrorMsg(e.message || "Connection failed");
    }
  };

  const handleReset = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setStatus('idle');
    setErrorMsg('');
    setShowCustom(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h2>
        
        {/* Default State Display */}
        {!showCustom && !apiKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                    <h3 className="font-medium text-green-900">System API Key Active</h3>
                    <p className="text-sm text-green-700 mt-1">
                        The application is configured with a default AI key. You can use all features immediately without any setup.
                    </p>
                </div>
            </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <Button variant="outline" onClick={handleTest} isLoading={status === 'testing'}>
                <RefreshCw className="h-4 w-4 mr-2" /> Test AI Connection
             </Button>

             <button 
                onClick={() => setShowCustom(!showCustom)}
                className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
             >
                {showCustom ? 'Hide Advanced Settings' : 'I have my own API Key'}
                {showCustom ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
             </button>
          </div>

          {showCustom && (
              <div className="pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="relative mb-3">
                    <Input 
                        label="Custom Gemini API Key" 
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setStatus('idle');
                        }}
                        placeholder="Paste your key here to override default"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save Custom Key
                    </Button>
                    <Button variant="ghost" onClick={handleReset} size="sm" className="text-red-600 hover:bg-red-50">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                    </Button>
                </div>
              </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md animate-in fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Connection Successful! AI features are ready.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-md animate-in fade-in">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Connection Failed</p>
                <p className="mt-1 break-all">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
