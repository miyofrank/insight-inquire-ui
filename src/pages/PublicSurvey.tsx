
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

  useEffect(() => {
    if (id) {
      fetchSurvey(id);
    }
  }, [id]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      
      // Intentar primero el endpoint público
      let response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/public`);
      
      if (!response.ok) {
        // Fallback al endpoint normal si el público no existe
        response = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
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
    if (!survey) return;

    // Validar que todas las preguntas requeridas tengan respuesta
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

      // Intentar el endpoint público específico primero
      let response = await fetch(`https://backend-survey-phb2.onrender.com/respuestas/encuesta/${survey.idEncuesta}/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        // Fallback al formato original si el nuevo endpoint no funciona
        const fallbackData = {
          idRespuesta: `resp_${Date.now()}`,
          idEncuesta: survey.idEncuesta,
          idPersona: "anonymous",
          respuestas: Object.entries(responses).map(([questionId, value]) => ({
            idPregunta: questionId,
            idItem: typeof value === 'string' ? value : Array.isArray(value) ? value.join(',') : value?.toString() || ''
          })),
          fechaRespuesta: new Date().toISOString()
        };

        response = await fetch('https://backend-survey-phb2.onrender.com/respuestas/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackData),
        });
      }
      
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
          {question.tipo === 'texto-corto' && (
            <Input
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full"
              required
            />
          )}

          {question.tipo === 'texto-largo' && (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={4}
              className="w-full resize-none"
              required
            />
          )}

          {question.tipo === 'seleccion-multiple' && (
            <RadioGroup
              value={value}
              onValueChange={(val) => handleInputChange(question.idPregunta, val)}
            >
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.idItem} id={item.idItem} />
                  <Label htmlFor={item.idItem}>{item.contenido}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.tipo === 'casillas' && (
            <div className="space-y-3">
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.idItem}
                    checked={Array.isArray(value) && value.includes(item.idItem)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleInputChange(question.idPregunta, [...currentValues, item.idItem]);
                      } else {
                        handleInputChange(question.idPregunta, currentValues.filter(v => v !== item.idItem));
                      }
                    }}
                  />
                  <Label htmlFor={item.idItem}>{item.contenido}</Label>
                </div>
              ))}
            </div>
          )}

          {(question.tipo === 'escala' || question.tipo === 'nps') && (
            <div>
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <span>Muy improbable</span>
                <span>Muy probable</span>
              </div>
              <div className="flex justify-between">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scaleValue) => (
                  <button
                    key={scaleValue}
                    type="button"
                    onClick={() => handleInputChange(question.idPregunta, scaleValue)}
                    className={`w-10 h-10 rounded-md border-2 text-sm font-medium transition-colors ${
                      value === scaleValue
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {scaleValue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {question.tipo === 'desplegable' && (
            <select
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
          
          <div className="flex justify-center pt-8">
            <Button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              {submitting ? 'Enviando...' : 'Enviar Respuestas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicSurvey;
