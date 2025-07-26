import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Search, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  nuevaFechaMinima: z.date({
    required_error: "La nueva fecha mínima es obligatoria.",
  }),
  justificacion: z.string().min(1, "La justificación es obligatoria."),
});

type FormData = z.infer<typeof formSchema>;

interface OCDetails {
  numeroOC: string;
  proveedor: string;
  fechaMinimaActual: string;
}

export default function ModificarFechaMinima() {
  const navigate = useNavigate();
  const [searchOC, setSearchOC] = useState("");
  const [ocDetails, setOcDetails] = useState<OCDetails | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Simulated user profile - in real app this would come from auth context
  const userProfile = "Compras autorizado"; // or "Administrador"
  const hasAccess = userProfile === "Compras autorizado" || userProfile === "Administrador";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleSearch = async () => {
    if (!searchOC.trim()) {
      setSearchError("Ingrese un número de OC válido");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    // Simulate API call
    setTimeout(() => {
      // Mock data - in real app this would be an API call
      if (searchOC === "80012345") {
        setOcDetails({
          numeroOC: "80012345",
          proveedor: "Proveedor Industrial SA de CV",
          fechaMinimaActual: "2024-08-15"
        });
      } else if (searchOC === "123") {
        setOcDetails({
          numeroOC: "123",
          proveedor: "Distribuidora Comercial México",
          fechaMinimaActual: "2024-08-20"
        });
      } else {
        setSearchError("No se encontró la Orden de Compra especificada");
        setOcDetails(null);
      }
      setIsSearching(false);
    }, 1000);
  };

  const onSubmit = async (data: FormData) => {
    if (!ocDetails) return;

    try {
      // Simulate API call to update the minimum date
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Fecha actualizada correctamente",
        description: `Ahora puede proceder a agendar la cita para la OC ${ocDetails.numeroOC}.`,
      });

      // Reset form and details
      form.reset();
      setOcDetails(null);
      setSearchOC("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la fecha. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-corporate">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
              <CardTitle className="text-2xl text-foreground">Acceso Denegado</CardTitle>
              <CardDescription>
                No tiene permisos para acceder a esta funcionalidad. 
                Solo usuarios con perfil 'Compras autorizado' o 'Administrador' pueden modificar fechas mínimas.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-corporate">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            className="mb-4 text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Button>
          <h1 className="text-3xl font-bold text-primary-foreground">
            Modificación de Fecha Mínima de Recepción
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            Módulo de excepción para autorizar recepciones anticipadas de OC
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-corporate">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
              Autorizar Recepción Anticipada de OC
            </CardTitle>
            <CardDescription>
              Busque la OC que requiere modificación de fecha mínima y autorice la recepción anticipada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="searchOC">Buscar por Número de OC</Label>
                  <Input
                    id="searchOC"
                    value={searchOC}
                    onChange={(e) => setSearchOC(e.target.value)}
                    placeholder="Ej: 80012345"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching}
                    variant="corporate"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              {searchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* OC Details Section */}
            {ocDetails && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Detalles de la Orden de Compra
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Número de OC
                      </Label>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {ocDetails.numeroOC}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Proveedor
                      </Label>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {ocDetails.proveedor}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Fecha Mínima de Recepción Actual
                      </Label>
                      <p className="text-lg font-semibold text-warning mt-1">
                        {format(new Date(ocDetails.fechaMinimaActual), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modification Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-background rounded-lg border p-6 space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        Autorizar Nueva Fecha Mínima
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="nuevaFechaMinima"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Nueva Fecha Mínima de Recepción *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd 'de' MMMM, yyyy", { locale: es })
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="justificacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motivo de la recepción anticipada *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describa el motivo por el cual se autoriza la recepción anticipada de esta OC..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          variant="corporate"
                          size="lg"
                          disabled={!form.formState.isValid || form.formState.isSubmitting}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {form.formState.isSubmitting ? "Procesando..." : "Autorizar y Guardar Nueva Fecha"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}