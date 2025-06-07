
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSurveyCreated: () => void;
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  onClose,
  onSurveyCreated
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createSurvey = async (type: 'custom' | 'template' | 'ai') => {
    if (type !== 'custom') {
      toast.info('Esta función estará disponible próximamente');
      return;
    }

    try {
      setLoading(true);
      
      const newSurvey = {
        idEncuesta: `survey_${Date.now()}`,
        idPersona: "user_1", 
        nombre: "Nueva Encuesta",
        estadoEncuesta: "Nuevo",
        estadoLogico: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        preguntas: []
      };

      const response = await fetch('http://localhost:8000/encuestas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurvey),
      });

      if (response.ok) {
        const createdSurvey = await response.json();
        onSurveyCreated();
        onClose();
        navigate(`/editor/${createdSurvey.idEncuesta}`);
        toast.success('Encuesta creada exitosamente');
      } else {
        // Fallback for development
        onSurveyCreated();
        onClose();
        navigate(`/editor/${newSurvey.idEncuesta}`);
        toast.success('Encuesta creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      // Fallback for development
      const surveyId = `survey_${Date.now()}`;
      onSurveyCreated();
      onClose();
      navigate(`/editor/${surveyId}`);
      toast.success('Encuesta creada exitosamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-white">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Bienvenido a Eficientis Survey</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Crea una encuesta</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Custom Survey */}
              <div 
                className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => createSurvey('custom')}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-6 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Propia</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Crea tu propia encuesta nueva desde cero.
                </p>
              </div>

              {/* Template Survey */}
              <div 
                className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group opacity-75"
                onClick={() => createSurvey('template')}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-6 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Por plantilla</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Personalice una plantilla con preguntas ya preparadas
                </p>
              </div>

              {/* AI Survey */}
              <div 
                className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group opacity-75"
                onClick={() => createSurvey('ai')}
              >
                <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto mb-6 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Sparkles className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Con IA</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  ¿Sin ideas? Deja que la IA cree la encuesta para ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
