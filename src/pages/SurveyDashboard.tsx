
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, Share, Download, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SurveyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboardName, setDashboardName] = useState("Dashboard Personalizable");

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
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="text-2xl font-bold border-none p-0 h-auto bg-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Reporte Automático
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Share className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <Button variant="outline" className="border-dashed border-2">
            <Plus className="w-4 h-4 mr-2" />
            Agregar filtro
          </Button>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Mostrando <strong>4</strong> elementos</span>
            <Badge variant="outline" className="ml-4">
              1 de febrero, 2025 - 25 de febrero, 2025
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Widget NPS Mock */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                1. ¿Qué tan probable es que recomiende nuestra empresa?
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">40%</div>
                <p className="text-sm text-gray-500 mb-4">Net Promoter Score (NPS)</p>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full"></div>
                </div>

                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-red-600 text-xs">2</span>
                    </div>
                    <p className="text-xs">Detractores</p>
                    <p className="text-sm font-bold">(20%)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-yellow-600 text-xs">2</span>
                    </div>
                    <p className="text-xs">Pasivos</p>
                    <p className="text-sm font-bold">(20%)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-green-600 text-xs">6</span>
                    </div>
                    <p className="text-xs">Promotores</p>
                    <p className="text-sm font-bold">(60%)</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-4">10 respuestas</p>
            </CardContent>
          </Card>

          {/* Widget Tabla Mock */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                2. ¿Podría explicar su calificación anterior?
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 py-2 border-b font-medium text-sm">
                  <span>Número</span>
                  <span>Respuesta</span>
                  <span>Ratio</span>
                </div>
                {[
                  "El servicio superó mis expectativas",
                  "Excelente atención al cliente",
                  "Producto de alta calidad",
                  "Recomendaría a otros",
                  "Muy satisfecho con la compra"
                ].map((response, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                    <span>{index + 1}</span>
                    <span className="truncate">{response}</span>
                    <span>{(20 - index * 2)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-4">10 respuestas</p>
            </CardContent>
          </Card>

          {/* Widget Radar Mock */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                3. Calificación por aspectos
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
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
              <p className="text-center text-xs text-gray-500">10 respuestas</p>
            </CardContent>
          </Card>

          {/* Área para agregar nuevo widget */}
          <Card className="col-span-1 border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Plus className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">Añadir Widget</p>
              <Button 
                variant="outline" 
                className="border-dashed"
                onClick={() => {
                  // Modal para seleccionar widget
                  console.log('Abrir modal para agregar widget');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Seleccionar Pregunta
              </Button>
            </CardContent>
          </Card>

          {/* Más widgets se pueden agregar aquí */}
          <Card className="col-span-1 border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Plus className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">Añadir Widget</p>
              <Button 
                variant="outline" 
                className="border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gráfico de Barras
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Plus className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium mb-2">Añadir Widget</p>
              <Button 
                variant="outline" 
                className="border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gráfico Circular
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurveyDashboard;
