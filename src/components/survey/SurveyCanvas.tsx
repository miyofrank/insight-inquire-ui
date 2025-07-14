
import React from 'react';
import { Trash2, GripVertical, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Question {
  idPregunta: string;
  nombre: string;
  texto: string;
  tipo: string;
  items: Array<{ idItem: string; contenido: string; }>;
}

interface SurveyCanvasProps {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions?: (reorderedQuestions: Question[]) => void;
}

export const SurveyCanvas: React.FC<SurveyCanvasProps> = ({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onDeleteQuestion,
  onReorderQuestions
}) => {
  const [draggedQuestion, setDraggedQuestion] = React.useState<Question | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, question: Question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedQuestion || !onReorderQuestions) return;

    const draggedIndex = questions.findIndex(q => q.idPregunta === draggedQuestion.idPregunta);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, movedQuestion);

    onReorderQuestions(newQuestions);
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const renderQuestionPreview = (question: Question, index: number) => {
    const isSelected = selectedQuestion?.idPregunta === question.idPregunta;
    const isDraggedOver = dragOverIndex === index;
    const isDragging = draggedQuestion?.idPregunta === question.idPregunta;
    
    return (
      <div
        key={question.idPregunta}
        draggable
        onDragStart={(e) => handleDragStart(e, question)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        className={`relative bg-white border-2 rounded-lg cursor-move transition-all ${
          isSelected 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300'
        } ${
          isDraggedOver ? 'border-blue-400 bg-blue-50' : ''
        } ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Drop indicator */}
        {isDraggedOver && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
        )}

        <div className="p-6">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
              <span>Pregunta {index + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectQuestion(question);
                }}
                className="text-gray-400 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuestion(question.idPregunta);
                }}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {question.texto}
            </h3>

            {/* Question Type Preview */}
            {question.tipo === 'texto-corto' && (
              <input
                type="text"
                placeholder="Escribe tu respuesta aquí..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            )}

            {question.tipo === 'texto-largo' && (
              <textarea
                placeholder="Escribe tu respuesta aquí..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                disabled
              />
            )}

            {(question.tipo === 'seleccion-multiple' || question.tipo === 'casillas') && (
              <div className="space-y-2">
                {question.items.map((item, index) => (
                  <div key={item.idItem} className="flex items-center space-x-2">
                    <input
                      type={question.tipo === 'casillas' ? 'checkbox' : 'radio'}
                      name={question.idPregunta}
                      disabled
                      className="text-blue-600"
                    />
                    <label className="text-gray-700">{item.contenido}</label>
                  </div>
                ))}
              </div>
            )}

            {question.tipo === 'desplegable' && (
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                <option>Selecciona una opción</option>
                {question.items.map((item) => (
                  <option key={item.idItem} value={item.idItem}>
                    {item.contenido}
                  </option>
                ))}
              </select>
            )}

            {question.tipo === 'escala' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Sin duda no</span>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      className="w-8 h-8 border border-gray-300 rounded-md text-sm hover:bg-blue-50 hover:border-blue-300"
                      disabled
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">Definitivamente sí</span>
              </div>
            )}

            {question.tipo === 'calificacion' && (
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="w-8 h-8 text-gray-300 hover:text-yellow-400"
                    disabled
                  >
                    ⭐
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Haga clic en un campo de su formulario para modificarlo
            </h3>
            <p className="text-gray-500">
              Agregue elementos desde el panel izquierdo para comenzar a crear su encuesta
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {questions.map((question, index) => renderQuestionPreview(question, index))}
      </div>
    </div>
  );
};
