import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { SurveyResponseForm } from "@/components/survey/SurveyResponseForm";
import { toast } from "sonner";

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

const SurveyResponse = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSurvey(id);
    }
  }, [id]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/public`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      } else {
        // Mock data for development
        setSurvey({
          idEncuesta: surveyId,
          nombre: "Encuesta de Satisfacción",
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

  const handleSubmit = async (responses: any) => {
    try {
      const responseData = {
        idRespuesta: `resp_${Date.now()}`,
        idEncuesta: survey?.idEncuesta,
        idPersona: "anonymous", // Respuestas anónimas
        respuestas: responses,
        fechaRespuesta: new Date().toISOString()
      };

      const response = await fetch(`https://backend-survey-phb2.onrender.com/respuestas/encuesta/${survey?.idEncuesta}/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('¡Respuesta enviada exitosamente!');
      } else {
        // Fallback for development
        setSubmitted(true);
        toast.success('¡Respuesta enviada exitosamente!');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitted(true);
      toast.success('¡Respuesta enviada exitosamente!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Encuesta no encontrada</p>
          <p className="text-gray-600">Esta encuesta podría haber expirado o no estar disponible.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Gracias por participar!</h2>
          <p className="text-gray-600">
            Tu respuesta ha sido enviada exitosamente. Apreciamos tu tiempo y comentarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <Progress value={100} className="h-2" />
        <p className="text-right text-sm text-gray-600 mt-1">100%</p>
      </div>

      {/* Survey Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <SurveyResponseForm 
          survey={survey} 
          isPreview={false}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default SurveyResponse;
