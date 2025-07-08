
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, RefreshCcw, Search, Filter, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from "sonner";

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
  const [activeSection, setActiveSection] = useState('individual');

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
  };

  const handleAuthError = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    navigate('/login');
  };

  const fetchData = async (surveyId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Fetch survey
      const surveyResponse = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData);
      } else if (surveyResponse.status === 401) {
        handleAuthError();
        return;
      }

      // Fetch responses using the correct endpoint
      const responsesResponse = await fetch(`https://backend-survey-phb2.onrender.com/respuestas/encuesta/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      } else if (responsesResponse.status === 401) {
        handleAuthError();
        return;
      } else {
        // Si no hay respuestas, inicializar array vacío
        setResponses([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
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
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(`/survey/${survey.idEncuesta}`, '_blank')}
              >
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
              <button 
                onClick={() => {
                  setActiveSection('analytics');
                  navigate(`/analytics/${survey.idEncuesta}`);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span>Análisis de resultados</span>
              </button>
              <button 
                onClick={() => setActiveSection('individual')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md ${
                  activeSection === 'individual' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  activeSection === 'individual' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'individual' ? 'bg-blue-600' : 'bg-gray-400'
                  }`}></div>
                </div>
                <span>Respuestas Individuales</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSection('dashboard');
                  navigate(`/dashboard/${survey.idEncuesta}`);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Solo mostramos si activeSection es 'individual' */}
        {activeSection === 'individual' && (
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

              {/* Responses Content */}
              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay respuestas aún</h3>
                  <p className="text-gray-500 mb-4">
                    Cuando las personas respondan tu encuesta, verás sus respuestas aquí.
                  </p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(`/survey/${survey.idEncuesta}`, '_blank')}
                  >
                    Compartir Encuesta
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          {survey.preguntas.slice(0, 3).map((question, index) => (
                            <th key={question.idPregunta} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {question.texto.substring(0, 30)}...
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {responses.map((response, index) => (
                          <tr key={response.idRespuesta} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="rounded border-gray-300" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(response.fechaRespuesta).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            {survey.preguntas.slice(0, 3).map((question) => {
                              const respuesta = response.respuestas.find(r => r.idPregunta === question.idPregunta);
                              return (
                                <td key={question.idPregunta} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {respuesta?.idItem || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;
