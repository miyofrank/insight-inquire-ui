
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SurveyResponseForm } from "@/components/survey/SurveyResponseForm";

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
      const response = await fetch(`http://localhost:8000/encuestas/${surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      } else {
        // Mock data for development
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
              </Button>
              <span className="text-lg font-medium text-gray-900">
                Prueba tu encuesta. Las respuestas no se guardan en la vista previa.
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-2 border-b border-gray-200">
        <Progress value={100} className="h-2" />
        <p className="text-right text-sm text-gray-600 mt-1">100%</p>
      </div>

      {/* Survey Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <SurveyResponseForm 
          survey={survey} 
          isPreview={true}
          onSubmit={() => {}}
        />
      </div>
    </div>
  );
};

export default SurveyPreview;
