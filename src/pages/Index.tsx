import { Link } from "react-router-dom";
import { Calendar, FileText, Truck, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Sistema de Gestión de Citas de Entrega</h1>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Optimiza la logística de tu empresa con nuestro sistema integral de agendamiento y seguimiento de entregas
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/agendar-cita">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Nueva Cita
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/reporte-seguimiento">
                <FileText className="mr-2 h-5 w-5" />
                Ver Reportes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Funcionalidades Principales</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gestiona todo el proceso de entregas desde la programación hasta el seguimiento completo
            </p>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-card hover:shadow-corporate transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Agendamiento Inteligente</CardTitle>
                <CardDescription>
                  Programa citas de entrega con búsqueda manual o carga masiva por Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Búsqueda de OCs en tiempo real</li>
                  <li>• Validación de fechas mínimas</li>
                  <li>• Asignación de rampas automática</li>
                  <li>• Generación de folios únicos</li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/agendar-cita">Agendar Cita</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-corporate transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Seguimiento en Tiempo Real</CardTitle>
                <CardDescription>
                  Monitorea el estado de todas las entregas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Confirmación de arribos</li>
                  <li>• Estados por OC individual</li>
                  <li>• Comentarios y observaciones</li>
                  <li>• Alertas automáticas</li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/reporte-seguimiento">Ver Reportes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-corporate transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Reportes Avanzados</CardTitle>
                <CardDescription>
                  Genera reportes detallados con filtros personalizables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Vista por folio o por OC</li>
                  <li>• Filtros por fecha y proveedor</li>
                  <li>• Exportación de datos</li>
                  <li>• Métricas de rendimiento</li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/reporte-seguimiento">Acceder</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-corporate transition-shadow duration-300 border-warning/20">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Modificar Fecha Mínima</CardTitle>
                <CardDescription>
                  Módulo de excepción para autorizar recepciones anticipadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Solo usuarios autorizados</li>
                  <li>• Búsqueda por número de OC</li>
                  <li>• Justificación obligatoria</li>
                  <li>• Registro de auditoría</li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="warning" size="sm" className="w-full">
                    <Link to="/modificar-fecha-minima">Acceder</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.5%</div>
              <div className="text-muted-foreground">Precisión en entregas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50%</div>
              <div className="text-muted-foreground">Reducción en tiempos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Monitoreo continuo</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para optimizar tus entregas?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Comienza a gestionar tus citas de entrega de manera eficiente y profesional
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/agendar-cita">
              Empezar Ahora
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
