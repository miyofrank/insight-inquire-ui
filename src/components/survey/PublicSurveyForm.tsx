
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

interface PublicSurveyProps {
  surveyId: string;
  isPreview?: boolean;
}

export const PublicSurvey: React.FC<PublicSurveyProps> = ({ surveyId, isPreview = false }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey(surveyId);
  }, [surveyId]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      
      if (isPreview) {
        // For preview mode, use authenticated endpoint
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setSurvey(data);
        }
      } else {
        // For public mode, use public endpoint
        const response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/public`);
        
        if (response.ok) {
          const data = await response.json();
          setSurvey(data);
        } else {
          toast.error('Encuesta no encontrada o no disponible públicamente');
        }
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Error al cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || isPreview) {
      if (isPreview) {
        toast.info('Esta es una vista previa. Las respuestas no se envían.');
      }
      return;
    }

    // Validate that all questions have answers
    const unansweredQuestions = survey.preguntas.filter(q => !responses[q.idPregunta]);
    if (unansweredQuestions.length > 0) {
      toast.error('Por favor responde todas las preguntas');
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        respuestas: Object.entries(responses).map(([preguntaId, valor]) => ({
          preguntaId,
          valor: Array.isArray(valor) ? valor : valor?.toString() || ''
        }))
      };

      const response = await fetch(`https://backend-survey-phb2.onrender.com/respuestas/encuesta/${survey.idEncuesta}/public`, {
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
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al enviar la respuesta');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Error al enviar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const value = responses[question.idPregunta] || '';

    return (
      <Card key={question.idPregunta} className="w-full max-w-2xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {index + 1}. {question.texto}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Texto corto */}
          {question.tipo === 'texto-corto' && (
            <Input
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full"
              disabled={isPreview}
            />
          )}

          {/* Texto largo */}
          {question.tipo === 'texto-largo' && (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={4}
              className="w-full resize-none"
              disabled={isPreview}
            />
          )}

          {/* Opción múltiple (una respuesta) */}
          {question.tipo === 'seleccion-multiple' && (
            <RadioGroup
              value={value}
              onValueChange={(val) => !isPreview && handleInputChange(question.idPregunta, val)}
              disabled={isPreview}
            >
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.idItem} id={item.idItem} disabled={isPreview} />
                  <Label htmlFor={item.idItem}>{item.contenido}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Opción múltiple (varias respuestas) */}
          {question.tipo === 'casillas' && (
            <div className="space-y-3">
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.idItem}
                    checked={Array.isArray(value) && value.includes(item.idItem)}
                    onCheckedChange={(checked) => {
                      if (isPreview) return;
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleInputChange(question.idPregunta, [...currentValues, item.idItem]);
                      } else {
                        handleInputChange(question.idPregunta, currentValues.filter(v => v !== item.idItem));
                      }
                    }}
                    disabled={isPreview}
                  />
                  <Label htmlFor={item.idItem}>{item.contenido}</Label>
                </div>
              ))}
            </div>
          )}

          {/* Escala del 1 al 10 */}
          {question.tipo === 'escala' && (
            <div>
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <span>1 - Muy malo</span>
                <span>10 - Excelente</span>
              </div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scaleValue) => (
                  <button
                    key={scaleValue}
                    type="button"
                    onClick={() => !isPreview && handleInputChange(question.idPregunta, scaleValue)}
                    disabled={isPreview}
                    className={`w-10 h-10 rounded-md border-2 text-sm font-medium transition-colors ${
                      value === scaleValue
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    } ${isPreview ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                  >
                    {scaleValue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NPS (0-10) */}
          {question.tipo === 'nps' && (
            <div>
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <span>0 - Muy improbable</span>
                <span>10 - Muy probable</span>
              </div>
              <div className="flex justify-between">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scaleValue) => (
                  <button
                    key={scaleValue}
                    type="button"
                    onClick={() => !isPreview && handleInputChange(question.idPregunta, scaleValue)}
                    disabled={isPreview}
                    className={`w-10 h-10 rounded-md border-2 text-sm font-medium transition-colors ${
                      value === scaleValue
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    } ${isPreview ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                  >
                    {scaleValue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desplegable */}
          {question.tipo === 'desplegable' && (
            <select
              value={value}
              onChange={(e) => !isPreview && handleInputChange(question.idPregunta, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPreview}
            >
              <option value="">Selecciona una opción</option>
              {question.items.map((item) => (
                <option key={item.idItem} value={item.idItem}>
                  {item.contenido}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Encuesta no encontrada</p>
          <p className="text-gray-600">Esta encuesta podría no estar disponible.</p>
        </div>
      </div>
    );
  }

  if (submitted && !isPreview) {
    return (
      <div className="flex items-center justify-center py-12">
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.nombre}</h1>
        <p className="text-gray-600">
          {isPreview ? 'Vista previa de la encuesta' : 'Responde todas las preguntas y envía tu formulario'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.preguntas.map((question, index) => renderQuestion(question, index))}
        
        {!isPreview && (
          <div className="flex justify-center pt-8">
            <Button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              {submitting ? 'Enviando...' : 'Enviar Respuestas'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
