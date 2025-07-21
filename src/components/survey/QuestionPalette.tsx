
import React, { useState } from 'react';
import { Type, AlignLeft, CheckSquare, Radio, ChevronDown, Star, BarChart3, Menu, Grid3X3 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface QuestionPaletteProps {
  onAddQuestion: (type: string) => void;
}

const questionTypes = [
  {
    id: 'texto-corto',
    name: 'Texto Corto',
    icon: Type,
    description: 'Respuesta de una línea'
  },
  {
    id: 'texto-largo',
    name: 'Texto Largo',
    icon: AlignLeft,
    description: 'Respuesta de párrafo'
  },
  {
    id: 'seleccion-multiple',
    name: 'Opción Múltiple',
    icon: Radio,
    description: 'Una sola respuesta'
  },
  {
    id: 'casillas',
    name: 'Casillas',
    icon: CheckSquare,
    description: 'Múltiples respuestas'
  },
  {
    id: 'desplegable',
    name: 'Desplegable',
    icon: ChevronDown,
    description: 'Lista desplegable'
  },
  {
    id: 'escala',
    name: 'Escala',
    icon: BarChart3,
    description: 'Escala numérica'
  },
  {
    id: 'calificacion',
    name: 'Calificación',
    icon: Star,
    description: 'Estrellas de 1 a 5'
  }
];

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ onAddQuestion }) => {
  const [isCompactView, setIsCompactView] = useState(false);

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Elementos</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCompactView(!isCompactView)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCompactView ? <Grid3X3 className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>
      
      <div className={isCompactView ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
        {questionTypes.map((type) => {
          const Icon = type.icon;
          
          if (isCompactView) {
            return (
              <Button
                key={type.id}
                variant="outline"
                onClick={() => onAddQuestion(type.id)}
                className="w-full h-auto p-2 text-left hover:bg-blue-50 hover:border-blue-300"
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">{type.name}</span>
                </div>
              </Button>
            );
          }
          
          return (
            <Button
              key={type.id}
              variant="outline"
              onClick={() => onAddQuestion(type.id)}
              className="h-auto p-3 text-left hover:bg-blue-50 hover:border-blue-300 overflow-hidden"
            >
              <div className="flex flex-col items-center space-y-2 w-full">
                <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="text-center w-full">
                  <div className="text-sm font-medium text-gray-900 truncate">{type.name}</div>
                  <div className="text-xs text-gray-500 break-words leading-tight">{type.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
