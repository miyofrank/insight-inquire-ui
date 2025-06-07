
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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

interface SurveyResponseFormProps {
  survey: Survey;
  isPreview: boolean;
  onSubmit: (responses: any) => void;
}

export const SurveyResponseForm: React.FC<SurveyResponseFormProps> = ({
  survey,
  isPreview,
  onSubmit
}) => {
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreview) {
      const formattedResponses = Object.entries(responses).map(([questionId, value]) => ({
        idPregunta: questionId,
        idItem: typeof value === 'string' ? value : value?.toString() || ''
      }));
      onSubmit(formattedResponses);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const value = responses[question.idPregunta] || '';

    return (
      <Card key={question.idPregunta} className="mb-8">
        <CardContent className="p-8">
          <div className="mb-6">
            <span className="text-sm text-gray-500 mb-2 block">{index + 1}</span>
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              {question.texto}
            </h2>
          </div>

          {question.tipo === 'texto-corto' && (
            <Input
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full"
            />
          )}

          {question.tipo === 'texto-largo' && (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={4}
              className="w-full resize-none"
              maxLength={500}
            />
          )}

          {question.tipo === 'seleccion-multiple' && (
            <div className="space-y-3">
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={item.idItem}
                    name={question.idPregunta}
                    value={item.idItem}
                    checked={value === item.idItem}
                    onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={item.idItem} className="text-gray-700 cursor-pointer">
                    {item.contenido}
                  </label>
                </div>
              ))}
            </div>
          )}

          {question.tipo === 'casillas' && (
            <div className="space-y-3">
              {question.items.map((item) => (
                <div key={item.idItem} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={item.idItem}
                    checked={Array.isArray(value) && value.includes(item.idItem)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInputChange(question.idPregunta, [...currentValues, item.idItem]);
                      } else {
                        handleInputChange(question.idPregunta, currentValues.filter(v => v !== item.idItem));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={item.idItem} className="text-gray-700 cursor-pointer">
                    {item.contenido}
                  </label>
                </div>
              ))}
            </div>
          )}

          {question.tipo === 'escala' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-500">Sin duda no</span>
                <span className="text-sm text-blue-500">Definitivamente sí</span>
              </div>
              <div className="flex justify-between">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scaleValue) => (
                  <div key={scaleValue} className="flex flex-col items-center">
                    <button
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
                    <span className="text-xs text-gray-500 mt-1">{scaleValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.tipo === 'desplegable' && (
            <select
              value={value}
              onChange={(e) => handleInputChange(question.idPregunta, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una opción</option>
              {question.items.map((item) => (
                <option key={item.idItem} value={item.idItem}>
                  {item.contenido}
                </option>
              ))}
            </select>
          )}

          {question.tipo === 'texto-largo' && (
            <div className="text-right mt-2">
              <span className="text-sm text-gray-500">500</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {survey.preguntas.map((question, index) => renderQuestion(question, index))}
      
      <div className="flex justify-center space-x-4 pt-8">
        <Button
          type="button"
          variant="outline"
          className="px-8 py-2"
        >
          Estándar
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="px-8 py-2"
        >
          Móvil
        </Button>
      </div>
    </form>
  );
};
