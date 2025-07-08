
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Settings, Filter, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AnalyticsData {
  nps: {
    score: number;
    detractors: number;
    passives: number;
    promoters: number;
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
    if (id) {
      fetchAnalytics(id);
    }
  }, [id]);

  const fetchAnalytics = async (surveyId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
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
      }

      // Intentar obtener analytics del nuevo endpoint
      const analyticsResponse = await fetch(`https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/resultados/resumen`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      } else {
        // Crear datos mock si no existe el endpoint
        setAnalytics({
          nps: {
            score: 0,
            detractors: 5,
            passives: 5,
            promoters: 5,
            totalResponses: 15
          },
          questionStats: [
            {
              idPregunta: "q1",
              texto: "¿Qué tan probable es que recomiende nuestra empresa?",
              tipo: "nps",
              responses: [
                { value: "Detractores (0-6)", count: 5, percentage: 33.3 },
                { value: "Pasivos (7-8)", count: 5, percentage: 33.3 },
                { value: "Promotores (9-10)", count: 5, percentage: 33.3 }
              ]
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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
            <span>Respuestas totales: <strong>{analytics?.nps.totalResponses || 15}</strong></span>
            <span className="ml-4">Descartados: <strong>0</strong></span>
            <span className="ml-4">Filtros de coincidencia: <strong>5</strong></span>
          </div>
        </div>

        {/* Grid de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* NPS Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                1. ¿Qué tan probable es que recomiende nuestra empresa a un colega o amigo?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <NPSGaugeChart score={analytics?.nps.score || 0} />
                <p className="text-sm text-gray-500 mt-2">Net Promoter Score (NPS)</p>
              </div>
              
              <div className="flex justify-center space-x-6 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mb-1">
                    <span className="text-red-600 text-xs font-bold">D</span>
                  </div>
                  <p className="text-xs text-gray-600">Detractores</p>
                  <p className="text-sm font-bold">{analytics?.nps.detractors || 5} (33.3%)</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mb-1">
                    <span className="text-yellow-600 text-xs font-bold">P</span>
                  </div>
                  <p className="text-xs text-gray-600">Pasivos</p>
                  <p className="text-sm font-bold">{analytics?.nps.passives || 5} (33.3%)</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-1">
                    <span className="text-green-600 text-xs font-bold">P</span>
                  </div>
                  <p className="text-xs text-gray-600">Promotores</p>
                  <p className="text-sm font-bold">{analytics?.nps.promoters || 5} (33.3%)</p>
                </div>
              </div>

              <Button variant="link" className="w-full text-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Configuración detallada del gráfico
              </Button>
            </CardContent>
          </Card>

          {/* Tabla de respuestas */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                2. ¿Podría explicar un poco más sobre su calificación en la pregunta anterior?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Número</span>
                  <span className="text-sm font-medium">Respuesta</span>
                  <span className="text-sm font-medium">Ratio</span>
                </div>
                {[
                  "El servicio no cumplió mis expectativas.",
                  "Hubo problemas con la entrega y no se resolvieron bien.",
                  "Mala atención al cliente, no me ayudaron cuando lo necesité.",
                  "El producto es bueno, pero el soporte deja mucho que desear.",
                  "No fue una experiencia terrible, pero tampoco la recomendaría."
                ].map((response, index) => (
                  <div key={index} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-600">{index + 1}</span>
                    <span className="flex-1 px-4 truncate">{response}</span>
                    <span className="text-gray-600">6,7%</span>
                  </div>
                ))}
              </div>
              
              <Button variant="link" className="w-full text-blue-600 mt-4">
                <Settings className="w-4 h-4 mr-2" />
                Configuración detallada del gráfico
              </Button>
            </CardContent>
          </Card>

          {/* Gráfico de radar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                3. ¿Cómo calificaría a nuestra empresa en los siguientes aspectos?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: 'Red de oficinas', A: 80, fullMark: 100 },
                    { subject: 'Calidad del producto', A: 90, fullMark: 100 },
                    { subject: 'Relación calidad-precio', A: 70, fullMark: 100 },
                    { subject: 'Experiencia de compra', A: 85, fullMark: 100 },
                    { subject: 'Atención al cliente', A: 75, fullMark: 100 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Calificación" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <Button variant="link" className="w-full text-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Configuración detallada del gráfico
              </Button>
            </CardContent>
          </Card>

          {/* Cuarta pregunta */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">
                4. ¿Hay algo que pueda mejorar aún más su experiencia como cliente?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Número</span>
                  <span className="text-sm font-medium">Respuesta</span>
                  <span className="text-sm font-medium">Ratio</span>
                </div>
                {[
                  "Entrega más rápida, urgente.",
                  "Más opciones de pago.",
                  "Atención al cliente 24/7",
                  "Descuentos para clientes frecuentes",
                  "Descripciones de productos detalladas"
                ].map((response, index) => (
                  <div key={index} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-600">{index + 1}</span>
                    <span className="flex-1 px-4 truncate">{response}</span>
                    <span className="text-gray-600">6,7%</span>
                  </div>
                ))}
              </div>
              
              <Button variant="link" className="w-full text-blue-600 mt-4">
                <Settings className="w-4 h-4 mr-2" />
                Configuración detallada del gráfico
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;
