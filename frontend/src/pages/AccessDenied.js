import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const AccessDenied = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A2238] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[rgba(26,34,56,0.9)] border border-gray-700 rounded-xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <ShieldOff size={40} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          {t('Access Denied')}
        </h1>
        
        <p className="text-gray-300 mb-6">
          {t('You do not have permission to access this page. Please contact your administrator if you believe this is an error.')}
        </p>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          <ArrowLeft size={18} />
          <span>{t('Go Back')}</span>
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
