import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateSurveyModal } from "@/components/survey/CreateSurveyModal";
import { useNavigate } from 'react-router-dom';

interface Survey {
  idEncuesta: string;
  idPersona: string;
  nombre: string;
  estadoEncuesta: string;
  estadoLogico: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  preguntas: any[];
}

const Index = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/encuestas/');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        console.error('Error fetching surveys:', response.status);
        setSurveys([]);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(survey => survey.estadoEncuesta === statusFilter);
    }

    setFilteredSurveys(filtered);
  };

  const handleSurveyClick = (surveyId: string) => {
    navigate(`/editor/${surveyId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'nuevo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">e</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Proyectos</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear encuesta
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proyectos y encuestas</h1>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las encuestas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las encuestas</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-states">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-states">Todos los estados</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1"></div>
              <div className="col-span-3">Nombre del proyecto</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Respuestas</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-1">Propietario</div>
              <div className="col-span-1">Última modificación</div>
              <div className="col-span-1">Fecha de creación</div>
            </div>
          </div>

          {/* Survey Rows */}
          <div className="divide-y divide-gray-200">
            {filteredSurveys.map((survey) => (
              <div 
                key={survey.idEncuesta}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSurveyClick(survey.idEncuesta)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <div className="w-5 h-5 border border-gray-300 rounded"></div>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded"></div>
                      </div>
                      <span className="font-medium text-gray-900">{survey.nombre}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge className={`${getStatusColor(survey.estadoEncuesta)} border`}>
                      {survey.estadoEncuesta}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">—</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-gray-600">Encuesta</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-gray-600">Yo</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-gray-600">{survey.fechaModificacion}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-gray-600">{survey.fechaCreacion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSurveys.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No se encontraron encuestas</p>
            </div>
          )}
        </div>
      </div>

      <CreateSurveyModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSurveyCreated={fetchSurveys}
      />
    </div>
  );
};

export default Index;
