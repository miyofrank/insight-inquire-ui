import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const PublicSurvey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSurvey(id);
    }
  }, [id]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);

      let response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/public`);
      if (!response.ok) {
        response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`);
      }

      if (response.ok) {
        const data = await response.json();

        // Verificación estricta: evitar preguntas sin idPregunta
        const preguntasInvalidas = data.preguntas.filter((q: any) => !q.idPregunta);
        if (preguntasInvalidas.length > 0) {
          toast.error('Error: Algunas preguntas no tienen ID asignado. Contacta al administrador.');
          setSurvey(null);
          return;
        }

        setSurvey({
          idEncuesta: data.idEncuesta || surveyId, // Fallback al ID de la URL si es necesario
          nombre: data.nombre,
          preguntas: data.preguntas
        });
      } else {
        toast.error('Encuesta no encontrada o no disponible públicamente');
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
    if (!survey || isPreview) return;

    const unansweredQuestions = survey.preguntas.filter(q => {
      const response = responses[q.idPregunta];
      return !response || (Array.isArray(response) && response.length === 0);
    });

    if (unansweredQuestions.length > 0) {
      toast.error('Por favor responde todas las preguntas');
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        idEncuesta: survey.idEncuesta, // ✅ Solucionado: enviar correctamente idEncuesta
        items: Object.entries(responses).map(([preguntaId, valor]) => ({
          preguntaId,
          valor: Array.isArray(valor) ? valor : valor?.toString() || ''
        }))
      };

      const response = await fetch(
        `https://backend-survey-phb2.onrender.com/respuestas/encuesta/${survey.idEncuesta}/public`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(responseData),
        }
      );

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
    const currentValue = responses[question.idPregunta];

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
              id={`input-${question.idPregunta}`}
              value={currentValue || ''}
              onChange={e => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full"
              required
            />
          )}

          {/* Texto largo */}
          {question.tipo === 'texto-largo' && (
            <Textarea
              id={`textarea-${question.idPregunta}`}
              value={currentValue || ''}
              onChange={e => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={4}
              className="w-full resize-none"
              required
            />
          )}

          {/* Opción múltiple (una respuesta) */}
          {question.tipo === 'seleccion-multiple' && (
            <RadioGroup
              value={currentValue || ''}
              onValueChange={val => handleInputChange(question.idPregunta, val)}
            >
              {question.items.map(item => (
                <div
                  key={`radio-${question.idPregunta}-${item.idItem}`}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    id={`radio-${question.idPregunta}-${item.idItem}`}
                    value={item.idItem}
                    checked={currentValue === item.idItem}
                  />
                  <Label htmlFor={`radio-${question.idPregunta}-${item.idItem}`}>
                    {item.contenido}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Opción múltiple (varias respuestas) */}
          {question.tipo === 'casillas' && (
            <div className="space-y-3">
              {question.items.map(item => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <Checkbox
                    id={`checkbox-${question.idPregunta}-${item.idItem}`}
                    checked={Array.isArray(currentValue) && currentValue.includes(item.idItem)}
                    onCheckedChange={checked => {
                      const vals = Array.isArray(currentValue) ? currentValue : [];
                      handleInputChange(
                        question.idPregunta,
                        checked ? [...vals, item.idItem] : vals.filter(v => v !== item.idItem)
                      );
                    }}
                  />
                  <Label htmlFor={`checkbox-${question.idPregunta}-${item.idItem}`}>
                    {item.contenido}
                  </Label>
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
                {[...Array(10)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={`scale-${question.idPregunta}-${val}`}
                      type="button"
                      onClick={() => handleInputChange(question.idPregunta, val)}
                      className={`w-10 h-10 rounded-md border-2 text-sm font-medium transition-colors ${
                        currentValue === val
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
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
                {[...Array(11)].map((_, i) => (
                  <button
                    key={`nps-${question.idPregunta}-${i}`}
                    type="button"
                    onClick={() => handleInputChange(question.idPregunta, i)}
                    className={`w-10 h-10 rounded-md border-2 text-sm font-medium transition-colors ${
                      currentValue === i
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desplegable */}
          {question.tipo === 'desplegable' && (
            <select
              id={`select-${question.idPregunta}`}
              value={currentValue || ''}
              onChange={e => handleInputChange(question.idPregunta, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona una opción</option>
              {question.items.map(item => (
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
          <p className="text-gray-600">Esta encuesta podría no estar disponible públicamente.</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.nombre}</h1>
          <p className="text-gray-600">Responde todas las preguntas y envía tu formulario</p>
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
    </div>
  );
};

export default PublicSurvey;
