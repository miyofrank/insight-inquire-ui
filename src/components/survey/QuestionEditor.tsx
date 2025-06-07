
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  idPregunta: string;
  nombre: string;
  texto: string;
  tipo: string;
  items: Array<{ idItem: string; contenido: string; }>;
}

interface QuestionEditorProps {
  question: Question;
  onUpdateQuestion: (question: Question) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdateQuestion
}) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateField = (field: string, value: any) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    onUpdateQuestion(updated);
  };

  const addItem = () => {
    const newItem = {
      idItem: `item_${Date.now()}`,
      contenido: `Opción ${localQuestion.items.length + 1}`
    };
    const updatedItems = [...localQuestion.items, newItem];
    updateField('items', updatedItems);
  };

  const updateItem = (itemId: string, content: string) => {
    const updatedItems = localQuestion.items.map(item =>
      item.idItem === itemId ? { ...item, contenido: content } : item
    );
    updateField('items', updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = localQuestion.items.filter(item => item.idItem !== itemId);
    updateField('items', updatedItems);
  };

  const hasItems = ['seleccion-multiple', 'desplegable', 'casillas'].includes(question.tipo);

  return (
    <div className="p-6 border-t-4 border-blue-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {question.tipo.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Basic Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Básico</h4>
          
          <div>
            <Label htmlFor="caption" className="text-sm text-gray-600">Caption</Label>
            <Input
              id="caption"
              value={localQuestion.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="placeholder" className="text-sm text-gray-600">Placeholder</Label>
            <Textarea
              id="placeholder"
              value={localQuestion.texto}
              onChange={(e) => updateField('texto', e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="required" className="text-sm text-gray-600">Obligatoria</Label>
            <Switch id="required" />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Avanzado</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weight" className="text-sm text-gray-600">Añadir peso</Label>
            <Switch id="weight" />
          </div>
        </div>

        {/* Options for multiple choice questions */}
        {hasItems && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Opciones</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {localQuestion.items.map((item, index) => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <Input
                    value={item.contenido}
                    onChange={(e) => updateItem(item.idItem, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    className="flex-1"
                  />
                  {localQuestion.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.idItem)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scale options */}
        {question.tipo === 'escala' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Configuración de escala</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Mínimo</Label>
                <Input type="number" defaultValue="0" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Máximo</Label>
                <Input type="number" defaultValue="10" className="mt-1" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
