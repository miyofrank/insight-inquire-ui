
import React from 'react';
import { Type, AlignLeft, CheckSquare, ChevronDown, List, Star, Award } from 'lucide-react';

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
    name: 'Selección múltiple',
    icon: CheckSquare,
    description: 'Múltiples opciones'
  },
  {
    id: 'desplegable',
    name: 'Desplegable',
    icon: ChevronDown,
    description: 'Lista desplegable'
  },
  {
    id: 'casillas',
    name: 'Casillas',
    icon: CheckSquare,
    description: 'Casillas de verificación'
  },
  {
    id: 'escala',
    name: 'Escala',
    icon: List,
    description: 'Escala numérica'
  },
  {
    id: 'calificacion',
    name: 'Calificación',
    icon: Star,
    description: 'Calificación con estrellas'
  }
];

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ onAddQuestion }) => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Crear</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar Elemento"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md">
            Todos
          </button>
          <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50">
            Widgets
          </button>
        </div>
        
        <h4 className="text-xs font-medium text-gray-600 mb-3 flex items-center">
          Más usadas
          <div className="ml-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </h4>
      </div>

      <div className="space-y-3">
        {questionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              onClick={() => onAddQuestion(type.id)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg mb-2 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-900 text-center mb-1">
                {type.name}
              </span>
              <span className="text-xs text-gray-500 text-center">
                {type.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
