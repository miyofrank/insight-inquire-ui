// src/pages/PublicSurvey.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Question {
  idPregunta: string;
  texto: string;
  tipo: string;
  items: Array<{ idItem: string; contenido: string; }>;
}

interface Survey {
  idEncuesta: string;
  nombre: string;
  preguntas: Question[];
}

const PublicSurvey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) fetchSurvey(id);
  }, [id]);

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://backend-survey-phb2.onrender.com/encuestas/${surveyId}/public`
      );
      if (!res.ok) {
        throw new Error("No pública, intentando privada");
      }
      const data = await res.json();
      // Asegurar que cada pregunta tenga idPregunta
      const preguntasConIds = data.preguntas.map((q: any, idx: number) => ({
        ...q,
        idPregunta: q.idPregunta || `pregunta-${idx}`
      }));
      setSurvey({
        idEncuesta: data.idEncuesta,
        nombre: data.nombre,
        preguntas: preguntasConIds
      });
    } catch (error) {
      console.error("Error fetching survey:", error);
      toast.error("Encuesta no disponible públicamente");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    // Validar que todas las preguntas tengan respuesta
    const faltantes = survey.preguntas.filter(q => {
      const resp = responses[q.idPregunta];
      return resp === undefined || resp === "" || (Array.isArray(resp) && resp.length === 0);
    });
    if (faltantes.length) {
      toast.error("Por favor responde todas las preguntas");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        respuestas: Object.entries(responses).map(([preguntaId, valor]) => ({
          preguntaId,
          // Para el backend, valor puede ser string|number|array
          valor: Array.isArray(valor) ? valor : valor
        }))
      };

      const resp = await fetch(
        `https://backend-survey-phb2.onrender.com/respuestas/encuesta/${survey.idEncuesta}/public`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (resp.ok) {
        setSubmitted(true);
        toast.success("¡Respuesta enviada exitosamente!");
      } else {
        const err = await resp.json();
        toast.error(err.detail || "Error al enviar la respuesta");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Error al enviar la respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (q: Question, idx: number) => {
    const val = responses[q.idPregunta];
    return (
      <Card key={q.idPregunta} className="max-w-2xl mx-auto mb-6">
        <CardHeader>
          <CardTitle>{idx + 1}. {q.texto}</CardTitle>
        </CardHeader>
        <CardContent>
          {q.tipo === "texto-corto" && (
            <Input
              value={val || ""}
              onChange={e => handleInputChange(q.idPregunta, e.target.value)}
              placeholder="Escribe tu respuesta..."
              required
            />
          )}
          {q.tipo === "texto-largo" && (
            <Textarea
              value={val || ""}
              onChange={e => handleInputChange(q.idPregunta, e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta..."
              required
            />
          )}
          {q.tipo === "seleccion-multiple" && (
            <RadioGroup
              value={val || ""}
              onValueChange={v => handleInputChange(q.idPregunta, v)}
            >
              {q.items.map(item => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.idItem} />
                  <Label>{item.contenido}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {q.tipo === "casillas" && (
            <div className="space-y-2">
              {q.items.map(item => (
                <div key={item.idItem} className="flex items-center space-x-2">
                  <Checkbox
                    checked={Array.isArray(val) && val.includes(item.idItem)}
                    onCheckedChange={checked => {
                      const prev = Array.isArray(val) ? val : [];
                      handleInputChange(
                        q.idPregunta,
                        checked
                          ? [...prev, item.idItem]
                          : prev.filter((v: string) => v !== item.idItem)
                      );
                    }}
                  />
                  <Label>{item.contenido}</Label>
                </div>
              ))}
            </div>
          )}
          {q.tipo === "escala" && (
            <div className="flex justify-between">
              {[...Array(10)].map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleInputChange(q.idPregunta, n)}
                    className={`w-8 h-8 rounded-full border ${
                      val === n ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          )}
          {q.tipo === "nps" && (
            <div className="flex justify-between">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInputChange(q.idPregunta, i)}
                  className={`w-8 h-8 rounded-full border ${
                    val === i ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
          {q.tipo === "desplegable" && (
            <select
              value={val || ""}
              onChange={e => handleInputChange(q.idPregunta, e.target.value)}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">-- Selecciona --</option>
              {q.items.map(item => (
                <option key={item.idItem} value={item.idItem}>
                  {item.contenido}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div>Cargando encuesta...</div>;
  if (!survey) return <div>Encuesta no encontrada.</div>;
  if (submitted) return <div>¡Gracias! Tu respuesta ha sido registrada.</div>;

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">{survey.nombre}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {survey.preguntas.map(renderQuestion)}
        <div className="text-center">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar Respuestas"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PublicSurvey;
