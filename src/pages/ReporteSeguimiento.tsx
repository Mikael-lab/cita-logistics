import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Search, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  X,
  Filter,
  RotateCcw,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OC {
  numero: string;
  proveedor: string;
  estadoRecibo: "Pendiente" | "Llegó" | "No Llegó";
  comentarios?: string;
}

interface Folio {
  folio: string;
  fechaCita: Date;
  horario: string;
  rampa: string;
  proveedores: string[];
  estadoGeneral: "Pendiente" | "Parcial" | "Completo";
  ocs: OC[];
  expanded?: boolean;
}

const mockFolios: Folio[] = [
  {
    folio: "FC-123456",
    fechaCita: new Date(2024, 11, 15),
    horario: "09:00 - 11:00",
    rampa: "Rampa 01",
    proveedores: ["Proveedor ABC S.A.", "Distribuidora XYZ"],
    estadoGeneral: "Pendiente",
    ocs: [
      { numero: "80012345", proveedor: "Proveedor ABC S.A.", estadoRecibo: "Pendiente" },
      { numero: "80012346", proveedor: "Distribuidora XYZ", estadoRecibo: "Pendiente" },
    ]
  },
  {
    folio: "FC-123457",
    fechaCita: new Date(2024, 11, 16),
    horario: "14:00 - 16:00",
    rampa: "Rampa 02",
    proveedores: ["Comercial 123"],
    estadoGeneral: "Completo",
    ocs: [
      { numero: "80012347", proveedor: "Comercial 123", estadoRecibo: "Llegó", comentarios: "Entrega completa" },
    ]
  },
];

const ReporteSeguimiento = () => {
  const [fechaDesde, setFechaDesde] = useState<Date>();
  const [fechaHasta, setFechaHasta] = useState<Date>();
  const [buscarFolio, setBuscarFolio] = useState("");
  const [buscarOC, setBuscarOC] = useState("");
  const [folios, setFolios] = useState<Folio[]>(mockFolios);
  const [folioConfirmacion, setFolioConfirmacion] = useState<Folio | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { toast } = useToast();

  const aplicarFiltros = () => {
    let foliosFiltrados = mockFolios;

    if (fechaDesde && fechaHasta) {
      foliosFiltrados = foliosFiltrados.filter(folio => 
        folio.fechaCita >= fechaDesde && folio.fechaCita <= fechaHasta
      );
    }

    if (buscarFolio) {
      foliosFiltrados = foliosFiltrados.filter(folio =>
        folio.folio.toLowerCase().includes(buscarFolio.toLowerCase())
      );
    }

    if (buscarOC) {
      foliosFiltrados = foliosFiltrados.filter(folio =>
        folio.ocs.some(oc => oc.numero.includes(buscarOC))
      );
    }

    setFolios(foliosFiltrados);
    toast({
      title: "Filtros aplicados",
      description: `Se encontraron ${foliosFiltrados.length} resultado(s)`,
    });
  };

  const limpiarFiltros = () => {
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setBuscarFolio("");
    setBuscarOC("");
    setFolios(mockFolios);
    toast({
      title: "Filtros limpiados",
      description: "Mostrando todos los registros",
    });
  };

  const toggleExpansion = (folio: string) => {
    setFolios(folios.map(f => 
      f.folio === folio ? { ...f, expanded: !f.expanded } : f
    ));
  };

  const abrirConfirmacion = (folio: Folio) => {
    setFolioConfirmacion(folio);
    setModalAbierto(true);
  };

  const confirmarEstadoOC = (numeroOC: string, estado: "Pendiente" | "Llegó" | "No Llegó", comentarios?: string) => {
    if (folioConfirmacion) {
      const folioActualizado = {
        ...folioConfirmacion,
        ocs: folioConfirmacion.ocs.map(oc =>
          oc.numero === numeroOC ? { ...oc, estadoRecibo: estado, comentarios } : oc
        )
      };
      setFolioConfirmacion(folioActualizado);
    }
  };

  const guardarConfirmacion = () => {
    if (folioConfirmacion) {
      setFolios(folios.map(f =>
        f.folio === folioConfirmacion.folio ? folioConfirmacion : f
      ));
      
      setModalAbierto(false);
      setFolioConfirmacion(null);
      
      toast({
        title: "Confirmación guardada",
        description: `Arribos confirmados para el folio ${folioConfirmacion.folio}`,
        variant: "default",
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "Parcial":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Parcial</Badge>;
      case "Completo":
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Completo</Badge>;
      case "Llegó":
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Llegó</Badge>;
      case "No Llegó":
        return <Badge variant="destructive">No Llegó</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Reporte y Seguimiento de Citas</h1>
          <p className="text-muted-foreground text-lg">
            Monitorea el estado y seguimiento de todas las citas programadas
          </p>
        </div>

        {/* Filtros */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Fecha Desde */}
              <div>
                <Label>Desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaDesde && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fechaDesde ? format(fechaDesde, "dd/MM/yyyy", { locale: es }) : "Fecha desde"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fechaDesde}
                      onSelect={setFechaDesde}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha Hasta */}
              <div>
                <Label>Hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaHasta && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fechaHasta ? format(fechaHasta, "dd/MM/yyyy", { locale: es }) : "Fecha hasta"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fechaHasta}
                      onSelect={setFechaHasta}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Buscar por Folio */}
              <div>
                <Label htmlFor="buscar-folio">Buscar por Folio</Label>
                <Input
                  id="buscar-folio"
                  placeholder="FC-123456"
                  value={buscarFolio}
                  onChange={(e) => setBuscarFolio(e.target.value)}
                />
              </div>

              {/* Buscar por OC */}
              <div>
                <Label htmlFor="buscar-oc">Buscar por OC</Label>
                <Input
                  id="buscar-oc"
                  placeholder="80012345"
                  value={buscarOC}
                  onChange={(e) => setBuscarOC(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={aplicarFiltros} variant="corporate">
                <Search className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Vistas */}
        <Tabs defaultValue="folios" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="folios" className="text-base py-3">
              <FileText className="mr-2 h-4 w-4" />
              Vista por Folio
            </TabsTrigger>
            <TabsTrigger value="ocs" className="text-base py-3">
              <Search className="mr-2 h-4 w-4" />
              Vista por OC
            </TabsTrigger>
            <TabsTrigger value="hora" className="text-base py-3">
              <Clock className="mr-2 h-4 w-4" />
              Vista por Hora
            </TabsTrigger>
          </TabsList>

          <TabsContent value="folios" className="space-y-4">
            {folios.map((folio) => (
              <Card key={folio.folio} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpansion(folio.folio)}
                      >
                        {folio.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <div>
                        <h3 className="text-lg font-semibold text-primary">{folio.folio}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(folio.fechaCita, "dd/MM/yyyy", { locale: es })} • {folio.horario} • {folio.rampa}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Proveedores: {folio.proveedores.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getEstadoBadge(folio.estadoGeneral)}
                      <Button 
                        onClick={() => abrirConfirmacion(folio)}
                        variant="outline"
                        size="sm"
                      >
                        Confirmar Arribo
                      </Button>
                    </div>
                  </div>

                  {folio.expanded && (
                    <div className="mt-4 pl-10">
                      <h4 className="font-medium mb-3">OCs en esta cita:</h4>
                      <div className="space-y-2">
                        {folio.ocs.map((oc) => (
                          <div key={oc.numero} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div>
                              <p className="font-medium">{oc.numero}</p>
                              <p className="text-sm text-muted-foreground">{oc.proveedor}</p>
                              {oc.comentarios && (
                                <p className="text-sm text-muted-foreground italic">
                                  Comentarios: {oc.comentarios}
                                </p>
                              )}
                            </div>
                            {getEstadoBadge(oc.estadoRecibo)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ocs" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Número OC</th>
                        <th className="text-left p-4 font-medium">Proveedor</th>
                        <th className="text-left p-4 font-medium">Fecha Cita</th>
                        <th className="text-left p-4 font-medium">Folio</th>
                        <th className="text-left p-4 font-medium">Rampa</th>
                        <th className="text-left p-4 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folios.flatMap(folio =>
                        folio.ocs.map(oc => (
                          <tr key={`${folio.folio}-${oc.numero}`} className="border-b hover:bg-muted/20">
                            <td className="p-4 font-medium text-primary">{oc.numero}</td>
                            <td className="p-4">{oc.proveedor}</td>
                            <td className="p-4">{format(folio.fechaCita, "dd/MM/yyyy", { locale: es })}</td>
                            <td className="p-4">{folio.folio}</td>
                            <td className="p-4">{folio.rampa}</td>
                            <td className="p-4">{getEstadoBadge(oc.estadoRecibo)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hora" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Citas Programadas por Hora</h3>
                <div className="space-y-6">
                  {/* Agrupar citas por fecha y hora */}
                  {Object.entries(
                    folios.reduce((acc, folio) => {
                      const fechaKey = format(folio.fechaCita, "yyyy-MM-dd");
                      if (!acc[fechaKey]) acc[fechaKey] = {};
                      
                      const horaInicio = folio.horario.split(" - ")[0];
                      if (!acc[fechaKey][horaInicio]) acc[fechaKey][horaInicio] = [];
                      acc[fechaKey][horaInicio].push(folio);
                      
                      return acc;
                    }, {} as Record<string, Record<string, Folio[]>>)
                  )
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([fecha, citasPorHora]) => (
                      <div key={fecha} className="border rounded-lg p-4 bg-muted/20">
                        <h4 className="font-semibold text-lg mb-4 text-primary">
                          {format(new Date(fecha), "EEEE, dd/MM/yyyy", { locale: es })}
                        </h4>
                        <div className="grid gap-4">
                          {Object.entries(citasPorHora)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([hora, citas]) => (
                              <div key={hora} className="border-l-4 border-primary/30 pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-base">{hora}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {citas.length} cita{citas.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  {citas.map((cita) => (
                                    <div
                                      key={cita.folio}
                                      className="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-1">
                                            <span className="font-medium text-primary">{cita.folio}</span>
                                            <span className="text-sm text-muted-foreground">{cita.rampa}</span>
                                            {getEstadoBadge(cita.estadoGeneral)}
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-1">
                                            Horario: {cita.horario}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            Proveedores: {cita.proveedores.join(", ")}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            OCs: {cita.ocs.map(oc => oc.numero).join(", ")}
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => abrirConfirmacion(cita)}
                                        >
                                          Confirmar
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Confirmación de Arribo */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Confirmar Arribo de Cita - Folio: {folioConfirmacion?.folio}
              </DialogTitle>
              <DialogDescription>
                Marca el estado de cada OC y agrega comentarios si es necesario
              </DialogDescription>
            </DialogHeader>
            
            {folioConfirmacion && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {folioConfirmacion.ocs.map((oc) => (
                  <div key={oc.numero} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">{oc.numero}</p>
                        <p className="text-sm text-muted-foreground">{oc.proveedor}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={oc.estadoRecibo === "Llegó" ? "success" : "outline"}
                          onClick={() => confirmarEstadoOC(oc.numero, "Llegó")}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Llegó
                        </Button>
                        <Button
                          size="sm"
                          variant={oc.estadoRecibo === "No Llegó" ? "destructive" : "outline"}
                          onClick={() => confirmarEstadoOC(oc.numero, "No Llegó")}
                        >
                          <X className="mr-1 h-4 w-4" />
                          No Llegó
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`comentarios-${oc.numero}`} className="text-sm">
                        Comentarios
                      </Label>
                      <Textarea
                        id={`comentarios-${oc.numero}`}
                        placeholder="Agregar comentarios sobre la entrega..."
                        value={oc.comentarios || ""}
                        onChange={(e) => confirmarEstadoOC(oc.numero, oc.estadoRecibo, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button variant="corporate" onClick={guardarConfirmacion}>
                Guardar Confirmación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReporteSeguimiento;