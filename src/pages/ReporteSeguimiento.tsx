import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  CalendarDays, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Package, 
  Settings,
  FileText,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DialogCitaDetalle } from "@/components/ui/dialog-cita-detalle";

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
    fechaCita: new Date(2024, 11, 15),
    horario: "14:00 - 16:00",
    rampa: "Rampa 02",
    proveedores: ["Comercial 123"],
    estadoGeneral: "Completo",
    ocs: [
      { numero: "80012347", proveedor: "Comercial 123", estadoRecibo: "Llegó", comentarios: "Entrega completa" },
    ]
  },
  {
    folio: "FC-123458",
    fechaCita: new Date(2024, 11, 15),
    horario: "08:00 - 10:00",
    rampa: "Rampa 03",
    proveedores: ["Suministros Delta", "Logística Omega"],
    estadoGeneral: "Parcial",
    ocs: [
      { numero: "80012348", proveedor: "Suministros Delta", estadoRecibo: "Llegó", comentarios: "Primera entrega completada" },
      { numero: "80012349", proveedor: "Logística Omega", estadoRecibo: "Pendiente" },
    ]
  },
  {
    folio: "FC-123459",
    fechaCita: new Date(2024, 11, 15),
    horario: "11:00 - 13:00",
    rampa: "Rampa 01",
    proveedores: ["Transportes Beta"],
    estadoGeneral: "Pendiente",
    ocs: [
      { numero: "80012350", proveedor: "Transportes Beta", estadoRecibo: "Pendiente" },
      { numero: "80012351", proveedor: "Transportes Beta", estadoRecibo: "Pendiente" },
    ]
  },
  {
    folio: "FC-123460",
    fechaCita: new Date(2024, 11, 15),
    horario: "16:00 - 18:00",
    rampa: "Rampa 04",
    proveedores: ["Importadora Gamma", "Distribuciones Alpha"],
    estadoGeneral: "Pendiente",
    ocs: [
      { numero: "80012352", proveedor: "Importadora Gamma", estadoRecibo: "Pendiente" },
      { numero: "80012353", proveedor: "Distribuciones Alpha", estadoRecibo: "Pendiente" },
      { numero: "80012354", proveedor: "Importadora Gamma", estadoRecibo: "Pendiente" },
    ]
  },
  {
    folio: "FC-123461",
    fechaCita: new Date(2024, 11, 15),
    horario: "10:00 - 12:00",
    rampa: "Rampa 02",
    proveedores: ["Proveeduría Central"],
    estadoGeneral: "Completo",
    ocs: [
      { numero: "80012355", proveedor: "Proveeduría Central", estadoRecibo: "Llegó", comentarios: "Entrega sin novedad" },
    ]
  },
  {
    folio: "FC-123462",
    fechaCita: new Date(2024, 11, 16),
    horario: "09:00 - 11:00",
    rampa: "Rampa 01",
    proveedores: ["Logistics Express"],
    estadoGeneral: "Pendiente",
    ocs: [
      { numero: "80012356", proveedor: "Logistics Express", estadoRecibo: "Pendiente" },
    ]
  },
  {
    folio: "FC-123463",
    fechaCita: new Date(2024, 11, 16),
    horario: "13:00 - 15:00",
    rampa: "Rampa 03",
    proveedores: ["Carga Pesada S.A.", "Transporte Rápido"],
    estadoGeneral: "Parcial",
    ocs: [
      { numero: "80012357", proveedor: "Carga Pesada S.A.", estadoRecibo: "Llegó", comentarios: "Mercancía en perfectas condiciones" },
      { numero: "80012358", proveedor: "Transporte Rápido", estadoRecibo: "No Llegó", comentarios: "Retraso por tráfico" },
    ]
  }
];

const ReporteSeguimiento = () => {
  const [fechaDesde, setFechaDesde] = useState<Date>();
  const [fechaHasta, setFechaHasta] = useState<Date>();
  const [buscarFolio, setBuscarFolio] = useState("");
  const [buscarOC, setBuscarOC] = useState("");
  const [folios, setFolios] = useState<Folio[]>(mockFolios);
  const [folioConfirmacion, setFolioConfirmacion] = useState<Folio | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date(2024, 11, 15)); // 15 de diciembre 2024
  const [citaDetalle, setCitaDetalle] = useState<Folio | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
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

  // Horarios disponibles del día (8:00 AM - 6:00 PM)
  const horariosDelDia = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const obtenerCitasPorHorario = (fecha: Date) => {
    return folios.filter(folio => 
      format(folio.fechaCita, "yyyy-MM-dd") === format(fecha, "yyyy-MM-dd")
    );
  };

  const obtenerCitaEnHorario = (hora: string, citasDelDia: Folio[]) => {
    return citasDelDia.find(cita => {
      const horaInicio = cita.horario.split(" - ")[0];
      return horaInicio === hora;
    });
  };

  const abrirDetalleCita = (cita: Folio) => {
    setCitaDetalle(cita);
    setModalDetalleAbierto(true);
  };

  const cambiarEstadoCita = (folio: string, nuevoEstado: string) => {
    setFolios(folios.map(f =>
      f.folio === folio ? { ...f, estadoGeneral: nuevoEstado as "Pendiente" | "Parcial" | "Completo" } : f
    ));
    toast({
      title: "Estado actualizado",
      description: `La cita ${folio} ha sido actualizada a ${nuevoEstado}`,
    });
  };

  const confirmarArriboCita = (folio: string) => {
    abrirConfirmacion(folios.find(f => f.folio === folio)!);
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-primary">Horarios del Día</h3>
                  <div className="flex items-center gap-4">
                    <Label>Seleccionar fecha:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[200px] justify-start text-left font-normal"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(fechaSeleccionada, "dd/MM/yyyy", { locale: es })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fechaSeleccionada}
                          onSelect={(date) => date && setFechaSeleccionada(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-base mb-2">
                    {format(fechaSeleccionada, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-success/20 border-2 border-success rounded"></div>
                      <span>Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted border-2 border-muted-foreground/30 rounded"></div>
                      <span>Disponible</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {(() => {
                    const citasDelDia = obtenerCitasPorHorario(fechaSeleccionada);
                    return horariosDelDia.map((hora) => {
                      const citaEnHorario = obtenerCitaEnHorario(hora, citasDelDia);
                      const esOcupado = !!citaEnHorario;
                      
                      return (
                        <div
                          key={hora}
                          className={cn(
                            "border-2 rounded-lg p-4 transition-all",
                            esOcupado 
                              ? "bg-success/10 border-success/30" 
                              : "bg-muted/30 border-muted-foreground/20 hover:border-muted-foreground/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium text-base">{hora}</span>
                              </div>
                              {esOcupado ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success">
                                  Ocupado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Disponible
                                </Badge>
                              )}
                            </div>
                            
                            {esOcupado && citaEnHorario && (
                               <div className="flex items-center gap-3">
                                 <div className="text-right">
                                   <p className="font-medium text-primary">{citaEnHorario.folio}</p>
                                   <p className="text-sm text-muted-foreground">{citaEnHorario.rampa}</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                       <Button variant="outline" size="sm">
                                         <Settings className="h-4 w-4 mr-1" />
                                         Estado
                                       </Button>
                                     </DropdownMenuTrigger>
                                     <DropdownMenuContent>
                                       <DropdownMenuItem onClick={() => cambiarEstadoCita(citaEnHorario.folio, "en espera")}>
                                         En espera
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => cambiarEstadoCita(citaEnHorario.folio, "descargando")}>
                                         Descargando
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => cambiarEstadoCita(citaEnHorario.folio, "finalizado")}>
                                         Finalizado
                                       </DropdownMenuItem>
                                     </DropdownMenuContent>
                                   </DropdownMenu>
                                   
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => confirmarArriboCita(citaEnHorario.folio)}
                                   >
                                     <Check className="h-4 w-4 mr-1" />
                                     Confirmar Arribo
                                   </Button>
                                   
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => abrirDetalleCita(citaEnHorario)}
                                   >
                                     Ver Detalles
                                   </Button>
                                 </div>
                               </div>
                            )}
                          </div>
                          
                          {esOcupado && citaEnHorario && (
                            <div className="mt-3 pt-3 border-t border-success/20">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Horario completo:</p>
                                  <p className="font-medium">{citaEnHorario.horario}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Estado:</p>
                                  {getEstadoBadge(citaEnHorario.estadoGeneral)}
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-muted-foreground">Proveedores:</p>
                                  <p className="font-medium">{citaEnHorario.proveedores.join(", ")}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-muted-foreground">OCs ({citaEnHorario.ocs.length}):</p>
                                  <p className="font-medium">{citaEnHorario.ocs.map(oc => oc.numero).join(", ")}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
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

        {/* Modal de Detalle de Cita */}
        <DialogCitaDetalle 
          cita={citaDetalle}
          open={modalDetalleAbierto}
          onOpenChange={setModalDetalleAbierto}
          onEstadoChange={cambiarEstadoCita}
          onConfirmarArribo={confirmarArriboCita}
        />
      </div>
    </div>
  );
};

export default ReporteSeguimiento;