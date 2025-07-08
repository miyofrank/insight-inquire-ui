
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PublicSurvey } from "@/components/survey/PublicSurveyForm";

interface Question {
  idPregunta: string;
  texto: string;
  tipo: string;
  items: Array<{ idItem: string; contenido: string; }>;
}

interface Survey {
  idEncuesta: string;
  nombre: string;
  preguntas: Question[];
}

const SurveyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSurvey(id);
    }
  }, [id]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        // Fallback for development
        setSurvey({
          idEncuesta: surveyId,
          nombre: "Mi Formulario",
          preguntas: [
            {
              idPregunta: "q1",
              texto: "¿Qué tan probable es que recomiende nuestra empresa a un colega o amigo?",
              tipo: "escala",
              items: []
            },
            {
              idPregunta: "q2",
              texto: "¿Podría explicar un poco más sobre su calificación en la pregunta anterior?",
              tipo: "texto-largo",
              items: []
            },
            {
              idPregunta: "q3",
              texto: "¿Cómo calificaría a nuestra empresa en los siguientes aspectos?",
              tipo: "seleccion-multiple",
              items: [
                { idItem: "i1", contenido: "Muy satisfecho" },
                { idItem: "i2", contenido: "Bastante satisfecho" },
                { idItem: "i3", contenido: "Indeciso" },
                { idItem: "i4", contenido: "Bastante insatisfecho" },
                { idItem: "i5", contenido: "Muy insatisfecho" }
              ]
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      // Fallback for development
      setSurvey({
        idEncuesta: surveyId,
        nombre: "Mi Formulario",
        preguntas: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Encuesta no encontrada</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/editor/${survey.idEncuesta}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver al Editor
              </Button>
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
                <strong>Vista Previa:</strong> Esta es una vista previa de la encuesta. Las respuestas no se guardan.
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">
                Vista Previa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PublicSurvey surveyId={survey.idEncuesta} isPreview={true} />
      </div>
    </div>
  );
};

export default SurveyPreview;
