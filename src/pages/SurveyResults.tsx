
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, RefreshCcw, Search, Filter, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Response {
  idRespuesta: string;
  idEncuesta: string;
  respuestas: Array<{
    idPregunta: string;
    idItem: string;
  }>;
  fechaRespuesta: string;
}

interface Survey {
  idEncuesta: string;
  nombre: string;
  preguntas: Array<{
    idPregunta: string;
    texto: string;
    tipo: string;
  }>;
}

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (surveyId: string) => {
    try {
      setLoading(true);
      
      // Fetch survey
      const surveyResponse = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`);
      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData);
      }

      // Fetch responses
      const responsesResponse = await fetch(`https://backend-survey-phb2.onrender.com/respuestas/encuesta/${surveyId}`);
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      } else {
        // Mock data for development
        setResponses([
          {
            idRespuesta: "1",
            idEncuesta: surveyId,
            respuestas: [],
            fechaRespuesta: "2025-02-21T14:10:00"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data for development
      setSurvey({
        idEncuesta: surveyId,
        nombre: "Mi Formulario",
        preguntas: [
          {
            idPregunta: "q1",
            texto: "¿Cuál es la principal prioridad en la atención al cliente en un negocio exitoso?",
            tipo: "texto-largo"
          }
        ]
      });
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resultados...</p>
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
              <Tabs defaultValue="results" className="mr-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger 
                    value="design"
                    onClick={() => navigate(`/editor/${survey.idEncuesta}`)}
                  >
                    Diseño
                  </TabsTrigger>
                  <TabsTrigger value="results">Resultados</TabsTrigger>
                  <TabsTrigger value="logic" disabled>Lógica</TabsTrigger>
                  <TabsTrigger value="config" disabled>Configuración</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/preview/${survey.idEncuesta}`)}
              >
                Preview
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Resultados</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span>Análisis de resultados</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span>Respuestas Individuales</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Respuestas Individuales</h1>
              
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Hide fields
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Sort
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date range
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <div className="ml-auto flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{responses.length} Resultados</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Questions Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-1 flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </div>
                {survey.preguntas.slice(0, 4).map((question, index) => (
                  <div key={question.idPregunta} className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.texto.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {question.tipo.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ¿Qué estrategias es más efectiva para mejorar la satisfacción del cliente?
                      </p>
                      <p className="text-xs text-gray-500">
                        Selección múltiple
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Rows */}
              <div className="divide-y divide-gray-200">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                    <div className="col-span-1 flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      #{i + 1}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      febrero 21, 2025 14:10
                    </div>
                    <div className="col-span-2 text-sm text-gray-900">
                      {i % 3 === 0 ? 'Escuchar al cliente' : 
                       i % 3 === 1 ? 'Resolver problemas rápido' : 'Trato amable'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-900">
                      {i % 3 === 0 ? 'Escuchar que es lo que quieren los clientes' : 
                       i % 3 === 1 ? 'Resolver problemas rápido' : 'Trato amable con todos para tener mejor servicio'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-900">
                      {i % 3 === 0 ? 'Precios bajos' : 
                       i % 3 === 1 ? 'Precios bajos' : 'Atención rápida y eficiente'}
                    </div>
                    <div className="col-span-1 text-sm text-gray-900">
                      {i % 3 === 0 ? 'Encuestas de satisfacción' : 
                       i % 3 === 1 ? 'Capacitación del personal' : 
                       i % 3 === 2 ? 'Programas de fidelización' : 
                       'Mejora en tiempos de respuesta'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;
