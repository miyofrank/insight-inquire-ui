
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
    idItem: string | string[];
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
      const surveyResponse = await fetch(
        `https://backend-survey-phb2.onrender.com/encuestas/${surveyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData);
      } else if (surveyResponse.status === 401) {
        handleAuthError();
        return;
      }

      // Fetch responses
      const responsesResponse = await fetch(
        `https://backend-survey-phb2.onrender.com/respuestas/encuesta/${surveyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      } else if (responsesResponse.status === 401) {
        handleAuthError();
      } else {
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
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
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
                <TabsTrigger value="logic" disabled>Logíca</TabsTrigger>
                <TabsTrigger value="config" disabled>Configuración</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
            <Button variant="outline" size="sm"><RefreshCcw className="w-4 h-4 mr-2" />Actualizar</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(`/survey/${survey.idEncuesta}`, '_blank')}
            >
              Publicar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Secciones</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/analytics/${survey.idEncuesta}`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                <RefreshCcw className="w-2 h-2 text-gray-400"/>
              </span>
              <span>Análisis</span>
            </button>
            <button
              onClick={() => setActiveSection('individual')}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md ${
                activeSection === 'individual'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                activeSection === 'individual' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  activeSection === 'individual' ? 'bg-blue-600' : 'bg-gray-400'
                }`} />
              </span>
              <span>Respuestas</span>
            </button>
            <button
              onClick={() => navigate(`/dashboard/${survey.idEncuesta}`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
              </span>
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        {/* Main Content - Respuestas Individuales */}
        {activeSection === 'individual' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Respuestas Individuales</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
                <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" />Fechas</Button>
              </div>
            </div>

            {responses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No hay respuestas registradas aún.</p>
                <Button onClick={() => window.open(`/survey/${survey.idEncuesta}`, '_blank')}>
                  Compartir Encuesta
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de respuesta
                      </th>
                      {survey.preguntas.map(question => (
                        <th
                          key={question.idPregunta}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {question.texto}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {responses.map(response => (
                      <tr key={response.idRespuesta} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(response.fechaRespuesta).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        {survey.preguntas.map(question => {
                          const ans = response.respuestas.find(r => r.idPregunta === question.idPregunta);
                          const val = ans?.idItem;
                          return (
                            <td
                              key={question.idPregunta}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {Array.isArray(val) ? val.join(', ') : val ?? '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;

