import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Trash2, Calendar, Clock, Upload, Download, Plus, X, Package, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OC {
  numero: string;
  proveedor: string;
  fechaMinima: Date;
  selected?: boolean;
}

interface DetalleEntrega {
  docCompra: string;
  posicion: string;
  textoBreve: string;
  material: string;
  centro: string;
  indicador: string;
  cantidad: string;
  tipoUnidad: string;
  origen: string;
  destino: string;
  folioProveedor: string;
  cantidadEntregar: string;
  embalaje: string;
  cajas: string;
  peso: string;
  lote: string;
}

const mockOCs: OC[] = [
  { numero: "80012345", proveedor: "Proveedor ABC S.A.", fechaMinima: new Date(2024, 11, 15) },
  { numero: "80012346", proveedor: "Distribuidora XYZ", fechaMinima: new Date(2024, 11, 18) },
  { numero: "80012347", proveedor: "Comercial 123", fechaMinima: new Date(2024, 11, 20) },
];

const AgendarCita = () => {
  const [searchOC, setSearchOC] = useState("");
  const [resultadosOC, setResultadosOC] = useState<OC[]>([]);
  const [carritoOCs, setCarritoOCs] = useState<OC[]>([]);
  const [fechaCita, setFechaCita] = useState<Date>();
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [rampaAsignada, setRampaAsignada] = useState("");
  const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [detallesEntrega, setDetallesEntrega] = useState<Record<string, DetalleEntrega>>({});
  const { toast } = useToast();

  const buscarOC = () => {
    if (!searchOC.trim()) {
      toast({
        title: "Campo requerido",
        description: "Ingresa un número de OC para buscar",
        variant: "destructive",
      });
      return;
    }

    // Simulación de búsqueda
    const resultados = mockOCs.filter(oc => 
      oc.numero.includes(searchOC) || 
      oc.proveedor.toLowerCase().includes(searchOC.toLowerCase())
    );
    
    setResultadosOC(resultados);
    
    if (resultados.length === 0) {
      toast({
        title: "Sin resultados",
        description: "No se encontraron OCs con ese criterio de búsqueda",
      });
    }
  };

  const agregarAlCarrito = (oc: OC) => {
    if (carritoOCs.find(item => item.numero === oc.numero)) {
      return; // Ya está en el carrito
    }
    
    setCarritoOCs([...carritoOCs, oc]);
    toast({
      title: "OC agregada",
      description: `OC ${oc.numero} agregada a la cita`,
    });
  };

  const eliminarDelCarrito = (numero: string) => {
    setCarritoOCs(carritoOCs.filter(oc => oc.numero !== numero));
    toast({
      title: "OC eliminada",
      description: `OC ${numero} eliminada de la cita`,
    });
  };

  const abrirDetallesEntrega = () => {
    if (carritoOCs.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una OC para continuar",
        variant: "destructive",
      });
      return;
    }

    if (!fechaCita || !horarioInicio || !horarioFin || !rampaAsignada) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los detalles de la cita",
        variant: "destructive",
      });
      return;
    }

    // Inicializar detalles para cada OC si no existen
    const nuevosDetalles = { ...detallesEntrega };
    carritoOCs.forEach(oc => {
      if (!nuevosDetalles[oc.numero]) {
        nuevosDetalles[oc.numero] = {
          docCompra: oc.numero,
          posicion: "00010",
          textoBreve: "",
          material: "",
          centro: "",
          indicador: "M",
          cantidad: "",
          tipoUnidad: "SENCILLO",
          origen: "",
          destino: "",
          folioProveedor: "",
          cantidadEntregar: "",
          embalaje: "",
          cajas: "",
          peso: "",
          lote: ""
        };
      }
    });
    setDetallesEntrega(nuevosDetalles);
    setMostrarDetalles(true);
  };

  const generarFolio = () => {
    // Validar que todos los detalles estén completos
    const detallesIncompletos = carritoOCs.some(oc => {
      const detalle = detallesEntrega[oc.numero];
      return !detalle || !detalle.textoBreve || !detalle.material || !detalle.cantidad;
    });

    if (detallesIncompletos) {
      toast({
        title: "Detalles incompletos",
        description: "Completa la información de entrega para todas las OCs",
        variant: "destructive",
      });
      return;
    }

    // Simulación de generación de folio
    const folio = `FC-${Date.now().toString().slice(-6)}`;
    toast({
      title: "¡Cita generada exitosamente!",
      description: `Folio de cita: ${folio}`,
      variant: "default",
    });

    // Limpiar formulario
    setCarritoOCs([]);
    setFechaCita(undefined);
    setHorarioInicio("");
    setHorarioFin("");
    setRampaAsignada("");
    setResultadosOC([]);
    setSearchOC("");
    setMostrarDetalles(false);
    setDetallesEntrega({});
  };

  const actualizarDetalle = (numeroOC: string, campo: keyof DetalleEntrega, valor: string) => {
    setDetallesEntrega(prev => ({
      ...prev,
      [numeroOC]: {
        ...prev[numeroOC],
        [campo]: valor
      }
    }));
  };

  const procesarArchivo = async () => {
    if (!archivoSubido) {
      toast({
        title: "Archivo requerido",
        description: "Selecciona un archivo Excel para procesar",
        variant: "destructive",
      });
      return;
    }

    setProcesandoArchivo(true);
    
    // Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setProcesandoArchivo(false);
    toast({
      title: "Archivo procesado",
      description: "Se procesaron 15 OCs correctamente. 2 OCs con errores.",
      variant: "default",
    });
    setArchivoSubido(null);
  };

  const horarios = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Agendar Cita de Entrega</h1>
          <p className="text-muted-foreground text-lg">
            Gestiona y programa las entregas de órdenes de compra
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="text-base py-3">
              <Search className="mr-2 h-4 w-4" />
              Búsqueda Manual
            </TabsTrigger>
            <TabsTrigger value="masiva" className="text-base py-3">
              <Upload className="mr-2 h-4 w-4" />
              Carga Masiva por Excel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Búsqueda y Resultados */}
              <div className="lg:col-span-2 space-y-6">
                {/* Búsqueda */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Búsqueda de OC
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label htmlFor="search-oc">Número de Orden de Compra (OC)</Label>
                        <Input
                          id="search-oc"
                          placeholder="Ej: 80012345"
                          value={searchOC}
                          onChange={(e) => setSearchOC(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && buscarOC()}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={buscarOC} variant="corporate">
                          <Search className="mr-2 h-4 w-4" />
                          Buscar OC
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados de Búsqueda */}
                {resultadosOC.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Resultados de Búsqueda</CardTitle>
                      <CardDescription>
                        Se encontraron {resultadosOC.length} OC(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resultadosOC.map((oc) => {
                          const yaEnCarrito = carritoOCs.find(item => item.numero === oc.numero);
                          return (
                            <div key={oc.numero} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                              <div className="flex items-center space-x-4">
                                <Checkbox
                                  checked={!!yaEnCarrito}
                                  disabled={!!yaEnCarrito}
                                  onCheckedChange={() => !yaEnCarrito && agregarAlCarrito(oc)}
                                />
                                <div>
                                  <p className="font-medium">{oc.numero}</p>
                                  <p className="text-sm text-muted-foreground">{oc.proveedor}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Fecha mínima: {format(oc.fechaMinima, "dd/MM/yyyy", { locale: es })}
                                  </p>
                                </div>
                              </div>
                              {yaEnCarrito && (
                                <Badge variant="secondary">En la cita</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Carrito de OCs */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>OCs para incluir en la Cita</span>
                      <Badge variant="outline" className="ml-2">
                        {carritoOCs.length} OC(s)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {carritoOCs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Plus className="mx-auto h-12 w-12 mb-3 opacity-50" />
                        <p>No hay OCs agregadas a la cita</p>
                        <p className="text-sm">Busca y selecciona OCs para agregar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {carritoOCs.map((oc) => (
                          <div key={oc.numero} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                            <div>
                              <p className="font-medium text-primary">{oc.numero}</p>
                              <p className="text-sm text-muted-foreground">{oc.proveedor}</p>
                              <p className="text-sm text-muted-foreground">
                                Fecha mínima: {format(oc.fechaMinima, "dd/MM/yyyy", { locale: es })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarDelCarrito(oc.numero)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detalles de la Cita */}
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Detalles de la Cita</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Fecha de Cita */}
                    <div>
                      <Label>Fecha de Cita</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fechaCita && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {fechaCita ? format(fechaCita, "PPP", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={fechaCita}
                            onSelect={setFechaCita}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Horario de Inicio */}
                    <div>
                      <Label>Horario de Inicio</Label>
                      <Select value={horarioInicio} onValueChange={setHorarioInicio}>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {horarios.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Horario de Fin */}
                    <div>
                      <Label>Horario de Fin</Label>
                      <Select value={horarioFin} onValueChange={setHorarioFin}>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {horarios.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rampa Asignada */}
                    <div>
                      <Label>Rampa Asignada</Label>
                      <Select value={rampaAsignada} onValueChange={setRampaAsignada}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rampa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rampa-01">Rampa 01</SelectItem>
                          <SelectItem value="rampa-02">Rampa 02</SelectItem>
                          <SelectItem value="rampa-03">Rampa 03</SelectItem>
                          <SelectItem value="rampa-04">Rampa 04</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!mostrarDetalles ? (
                      <Button 
                        onClick={abrirDetallesEntrega} 
                        className="w-full"
                        variant="corporate"
                        disabled={carritoOCs.length === 0 || !fechaCita || !horarioInicio || !horarioFin || !rampaAsignada}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Continuar con Detalles de Entrega
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setMostrarDetalles(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Volver a Detalles de Cita
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Formulario de Detalles de Entrega */}
            {mostrarDetalles && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Detalles de Entrega por OC
                  </CardTitle>
                  <CardDescription>
                    Completa la información específica de entrega para cada orden de compra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {carritoOCs.map((oc) => {
                      const detalle = detallesEntrega[oc.numero] || {
                        docCompra: oc.numero,
                        posicion: "00010",
                        textoBreve: "",
                        material: "",
                        centro: "",
                        indicador: "M",
                        cantidad: "",
                        tipoUnidad: "SENCILLO",
                        origen: "",
                        destino: "",
                        folioProveedor: "",
                        cantidadEntregar: "",
                        embalaje: "",
                        cajas: "",
                        peso: "",
                        lote: ""
                      };
                      return (
                        <div key={oc.numero} className="border rounded-lg p-6 bg-secondary/30">
                          <div className="flex items-center gap-2 mb-6">
                            <Badge variant="outline" className="text-base px-3 py-1">
                              OC: {oc.numero}
                            </Badge>
                            <span className="text-muted-foreground">-</span>
                            <span className="font-medium">{oc.proveedor}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Documento de Compra */}
                            <div>
                              <Label>Doc. Compra</Label>
                              <Input
                                value={detalle.docCompra || oc.numero}
                                onChange={(e) => actualizarDetalle(oc.numero, 'docCompra', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Posición */}
                            <div>
                              <Label>Posición</Label>
                              <Input
                                value={detalle.posicion || "00010"}
                                onChange={(e) => actualizarDetalle(oc.numero, 'posicion', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Texto Breve */}
                            <div className="md:col-span-2">
                              <Label>Texto Breve *</Label>
                              <Input
                                placeholder="Descripción del material/producto"
                                value={detalle.textoBreve || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'textoBreve', e.target.value)}
                                className="bg-background"
                                required
                              />
                            </div>

                            {/* Material */}
                            <div>
                              <Label>Material *</Label>
                              <Input
                                placeholder="Código de material"
                                value={detalle.material || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'material', e.target.value)}
                                className="bg-background"
                                required
                              />
                            </div>

                            {/* Centro */}
                            <div>
                              <Label>Centro</Label>
                              <Input
                                placeholder="Centro de costo"
                                value={detalle.centro || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'centro', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Indicador */}
                            <div>
                              <Label>Indicador</Label>
                              <Select value={detalle.indicador || "M"} onValueChange={(value) => actualizarDetalle(oc.numero, 'indicador', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="M">M - Manual</SelectItem>
                                  <SelectItem value="A">A - Automático</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Cantidad */}
                            <div>
                              <Label>Cantidad *</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={detalle.cantidad || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'cantidad', e.target.value)}
                                className="bg-background"
                                required
                              />
                            </div>

                            {/* Tipo de Unidad */}
                            <div>
                              <Label>Tipo Unidad</Label>
                              <Select value={detalle.tipoUnidad || "SENCILLO"} onValueChange={(value) => actualizarDetalle(oc.numero, 'tipoUnidad', value)}>
                                <SelectTrigger>
                                  <Truck className="mr-2 h-4 w-4" />
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SENCILLO">Sencillo</SelectItem>
                                  <SelectItem value="TORTON">Tortón</SelectItem>
                                  <SelectItem value="TRAILER">Trailer</SelectItem>
                                  <SelectItem value="RABON">Rabón</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Origen */}
                            <div>
                              <Label>Origen</Label>
                              <Input
                                placeholder="Ciudad/Ubicación origen"
                                value={detalle.origen || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'origen', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Destino */}
                            <div>
                              <Label>Destino</Label>
                              <Input
                                placeholder="Ciudad/Ubicación destino"
                                value={detalle.destino || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'destino', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Folio Proveedor */}
                            <div>
                              <Label>Folio Proveedor</Label>
                              <Input
                                placeholder="Referencia del proveedor"
                                value={detalle.folioProveedor || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'folioProveedor', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Cantidad a Entregar */}
                            <div>
                              <Label>Ctd. a Entregar</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={detalle.cantidadEntregar || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'cantidadEntregar', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Embalaje */}
                            <div>
                              <Label>Embalaje</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={detalle.embalaje || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'embalaje', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Cajas */}
                            <div>
                              <Label>Cajas</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={detalle.cajas || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'cajas', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Peso */}
                            <div>
                              <Label>Peso (kg)</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={detalle.peso || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'peso', e.target.value)}
                                className="bg-background"
                              />
                            </div>

                            {/* Lote */}
                            <div>
                              <Label>Lote</Label>
                              <Input
                                placeholder="Número de lote"
                                value={detalle.lote || ""}
                                onChange={(e) => actualizarDetalle(oc.numero, 'lote', e.target.value)}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-4 pt-6">
                      <Button
                        onClick={() => setMostrarDetalles(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={generarFolio}
                        variant="corporate"
                        className="flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Generar Folio de Cita
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="masiva" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Carga Masiva por Excel
                  </CardTitle>
                  <CardDescription>
                    Sube el archivo Excel con las OCs que deseas agendar. El sistema procesará el archivo y te notificará el resultado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enlace de plantilla */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Plantilla de formato Excel</p>
                      <p className="text-sm text-muted-foreground">
                        Descarga la plantilla con el formato correcto para cargar las OCs
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar formato
                    </Button>
                  </div>

                  {/* Área de subida de archivo */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setArchivoSubido(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">
                        {archivoSubido ? archivoSubido.name : "Arrastra tu archivo Excel aquí"}
                      </p>
                      <p className="text-muted-foreground">
                        {archivoSubido ? "Archivo listo para procesar" : "o haz clic para seleccionar"}
                      </p>
                    </label>
                  </div>

                  {/* Estado de procesamiento */}
                  {procesandoArchivo && (
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-primary font-medium">Archivo subido. Procesando...</p>
                    </div>
                  )}

                  {/* Botón de procesar */}
                  <Button 
                    onClick={procesarArchivo}
                    disabled={!archivoSubido || procesandoArchivo}
                    variant="corporate"
                    className="w-full"
                  >
                    {procesandoArchivo ? "Procesando..." : "Subir y Procesar"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgendarCita;