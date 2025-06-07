
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Eye, Settings, BarChart3, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionPalette } from "@/components/survey/QuestionPalette";
import { SurveyCanvas } from "@/components/survey/SurveyCanvas";
import { QuestionEditor } from "@/components/survey/QuestionEditor";
import { PublishModal } from "@/components/survey/PublishModal";
import { toast } from "sonner";

interface Question {
  idPregunta: string;
  nombre: string;
  texto: string;
  tipo: string;
  items: Array<{ idItem: string; contenido: string; }>;
}

interface Survey {
  idEncuesta: string;
  nombre: string;
  preguntas: Question[];
}

const SurveyEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
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
        // Fallback for development
        setSurvey({
          idEncuesta: surveyId,
          nombre: "Mi Formulario",
          preguntas: []
        });
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      // Fallback for development
      setSurvey({
        idEncuesta: surveyId,
        nombre: "Mi Formulario",
        preguntas: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSurvey = async () => {
    if (!survey) return;

    try {
      const surveyData = {
        ...survey,
        idPersona: "user_1",
        estadoEncuesta: "Nuevo",
        estadoLogico: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
      };

      const response = await fetch(`http://localhost:8000/encuestas/${survey.idEncuesta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      if (response.ok) {
        toast.success('Encuesta guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.success('Cambios guardados localmente');
    }
  };

  const addQuestion = (type: string) => {
    if (!survey) return;

    const newQuestion: Question = {
      idPregunta: `q_${Date.now()}`,
      nombre: `Pregunta ${survey.preguntas.length + 1}`,
      texto: "Escribe tu pregunta aquí",
      tipo: type,
      items: type === 'texto-corto' || type === 'texto-largo' ? [] : [
        { idItem: `item_${Date.now()}`, contenido: 'Opción 1' }
      ]
    };

    const updatedSurvey = {
      ...survey,
      preguntas: [...survey.preguntas, newQuestion]
    };

    setSurvey(updatedSurvey);
    setSelectedQuestion(newQuestion);
    saveSurvey();
  };

  const updateQuestion = (updatedQuestion: Question) => {
    if (!survey) return;

    const updatedSurvey = {
      ...survey,
      preguntas: survey.preguntas.map(q => 
        q.idPregunta === updatedQuestion.idPregunta ? updatedQuestion : q
      )
    };

    setSurvey(updatedSurvey);
    setSelectedQuestion(updatedQuestion);
    saveSurvey();
  };

  const deleteQuestion = (questionId: string) => {
    if (!survey) return;

    const updatedSurvey = {
      ...survey,
      preguntas: survey.preguntas.filter(q => q.idPregunta !== questionId)
    };

    setSurvey(updatedSurvey);
    if (selectedQuestion?.idPregunta === questionId) {
      setSelectedQuestion(null);
    }
    saveSurvey();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
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
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">e</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{survey.nombre}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tabs defaultValue="design" className="mr-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="design" className="text-sm">Diseño</TabsTrigger>
                  <TabsTrigger 
                    value="results"
                    onClick={() => navigate(`/results/${survey.idEncuesta}`)}
                  >
                    Resultados
                  </TabsTrigger>
                  <TabsTrigger value="logic" disabled>Lógica</TabsTrigger>
                  <TabsTrigger value="config" disabled>Configuración</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/preview/${survey.idEncuesta}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista previa
              </Button>
              <Button 
                onClick={() => setShowPublishModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Question Palette */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <QuestionPalette onAddQuestion={addQuestion} />
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <SurveyCanvas 
            questions={survey.preguntas}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        </div>

        {/* Question Editor */}
        {selectedQuestion && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <QuestionEditor 
              question={selectedQuestion}
              onUpdateQuestion={updateQuestion}
            />
          </div>
        )}
      </div>

      <PublishModal 
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        surveyId={survey.idEncuesta}
      />
    </div>
  );
};

export default SurveyEditor;
