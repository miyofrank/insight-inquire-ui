
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Settings, Filter, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from "sonner";

interface AnalyticsData {
  nps?: {
    score: number;
    detractores: number;
    pasivos: number;
    promotores: number;
    totalResponses: number;
  };
  questionStats: Array<{
    idPregunta: string;
    texto: string;
    tipo: string;
    responses: Array<{
      value: string;
      count: number;
      percentage: number;
    }>;
  }>;
}

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchAnalytics(id);
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

  const fetchAnalytics = async (surveyId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Obtener datos de la encuesta
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

      // Obtener resumen de resultados
      try {
        const analyticsResponse = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/resultados/resumen`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(formatAnalyticsData(analyticsData));
        } else if (analyticsResponse.status === 401) {
          handleAuthError();
          return;
        } else {
          // Datos mock si no hay datos reales
          setAnalytics(getMockAnalyticsData());
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(getMockAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error al cargar los análisis');
    } finally {
      setLoading(false);
    }
  };

  const formatAnalyticsData = (data: any): AnalyticsData => {
    const formatted: AnalyticsData = {
      questionStats: []
    };

    if (data.nps) {
      formatted.nps = {
        score: data.nps.score,
        detractores: data.nps.detractores,
        pasivos: data.nps.pasivos,
        promotores: data.nps.promotores,
        totalResponses: data.nps.detractores + data.nps.pasivos + data.nps.promotores
      };
    }

    // Convertir otras estadísticas de preguntas
    Object.keys(data).forEach(key => {
      if (key !== 'nps' && data[key]) {
        const questionData = data[key];
        if (questionData.conteo) {
          const responses = Object.entries(questionData.conteo).map(([value, count]) => ({
            value: value as string,
            count: count as number,
            percentage: ((count as number) / questionData.total) * 100
          }));

          formatted.questionStats.push({
            idPregunta: key,
            texto: `Pregunta ${key}`,
            tipo: 'multiple',
            responses
          });
        }
      }
    });

    return formatted;
  };

  const getMockAnalyticsData = (): AnalyticsData => {
    return {
      nps: {
        score: 40,
        detractores: 2,
        pasivos: 2,
        promotores: 6,
        totalResponses: 10
      },
      questionStats: [
        {
          idPregunta: "q1",
          texto: "¿Qué tan probable es que recomiende nuestra empresa?",
          tipo: "nps",
          responses: [
            { value: "Detractores (0-6)", count: 2, percentage: 20 },
            { value: "Pasivos (7-8)", count: 2, percentage: 20 },
            { value: "Promotores (9-10)", count: 6, percentage: 60 }
          ]
        }
      ]
    };
  };

  const NPSGaugeChart = ({ score }: { score: number }) => {
    const data = [
      { name: 'Score', value: Math.abs(score), fill: score >= 0 ? '#10b981' : '#ef4444' }
    ];

    return (
      <div className="relative w-48 h-24 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <span className="text-3xl font-bold">{score}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis...</p>
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
                onClick={() => navigate(`/results/${id}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Análisis de resultados</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Estadísticas
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                CREAR UN FILTRO
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span>Respuestas totales: <strong>{analytics?.nps?.totalResponses || 0}</strong></span>
            <span className="ml-4">Descartados: <strong>0</strong></span>
            <span className="ml-4">Filtros de coincidencia: <strong>5</strong></span>
          </div>
        </div>

        {/* Grid de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Tarjeta NPS */}
          {analytics?.nps && (
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  Net Promoter Score (NPS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <NPSGaugeChart score={analytics.nps.score} />
                  <p className="text-sm text-gray-500 mt-2">Net Promoter Score (NPS)</p>
                </div>
                
                <div className="flex justify-center space-x-6 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mb-1">
                      <span className="text-red-600 text-xs font-bold">D</span>
                    </div>
                    <p className="text-xs text-gray-600">Detractores</p>
                    <p className="text-sm font-bold">{analytics.nps.detractores} ({((analytics.nps.detractores / analytics.nps.totalResponses) * 100).toFixed(1)}%)</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mb-1">
                      <span className="text-yellow-600 text-xs font-bold">P</span>
                    </div>
                    <p className="text-xs text-gray-600">Pasivos</p>
                    <p className="text-sm font-bold">{analytics.nps.pasivos} ({((analytics.nps.pasivos / analytics.nps.totalResponses) * 100).toFixed(1)}%)</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-1">
                      <span className="text-green-600 text-xs font-bold">P</span>
                    </div>
                    <p className="text-xs text-gray-600">Promotores</p>
                    <p className="text-sm font-bold">{analytics.nps.promotores} ({((analytics.nps.promotores / analytics.nps.totalResponses) * 100).toFixed(1)}%)</p>
                  </div>
                </div>

                <Button variant="link" className="w-full text-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración detallada del gráfico
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tarjeta de Radar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                Análisis por categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 rounded-full relative">
                      <div className="absolute inset-1 border border-blue-300 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm">Gráfico de Radar</p>
                </div>
              </div>
              
              <Button variant="link" className="w-full text-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Configuración detallada del gráfico
              </Button>
            </CardContent>
          </Card>

          {/* Otras estadísticas de preguntas */}
          {analytics?.questionStats.map((stat, index) => (
            <Card key={stat.idPregunta} className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  {stat.texto}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Respuesta</span>
                    <span className="text-sm font-medium">Cantidad</span>
                    <span className="text-sm font-medium">%</span>
                  </div>
                  {stat.responses.map((response, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-sm">
                      <span className="flex-1 truncate">{response.value}</span>
                      <span className="px-4">{response.count}</span>
                      <span className="text-gray-600">{response.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                
                <Button variant="link" className="w-full text-blue-600 mt-4">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración detallada del gráfico
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Si no hay datos, mostrar mensaje */}
          {(!analytics || analytics.questionStats.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BarChart3 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de análisis</h3>
                <p className="text-gray-500 mb-4">
                  Cuando las personas respondan tu encuesta, verás los análisis aquí.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(`/survey/${id}`, '_blank')}
                >
                  Compartir Encuesta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;
