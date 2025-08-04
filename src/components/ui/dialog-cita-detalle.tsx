import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, Package, Users, Settings, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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
}

interface DialogCitaDetalleProps {
  cita: Folio | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstadoChange?: (folio: string, nuevoEstado: string) => void;
  onConfirmarArribo?: (folio: string) => void;
}

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "Pendiente":
    case "en espera":
      return <Badge variant="secondary">En espera</Badge>;
    case "Parcial":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Parcial</Badge>;
    case "Completo":
    case "finalizado":
      return <Badge variant="outline" className="bg-success/10 text-success border-success">Finalizado</Badge>;
    case "descargando":
      return <Badge variant="outline" className="bg-info/10 text-info border-info">Descargando</Badge>;
    case "Llegó":
      return <Badge variant="outline" className="bg-success/10 text-success border-success">Llegó</Badge>;
    case "No Llegó":
      return <Badge variant="destructive">No Llegó</Badge>;
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
};

export function DialogCitaDetalle({ cita, open, onOpenChange, onEstadoChange, onConfirmarArribo }: DialogCitaDetalleProps) {
  const { toast } = useToast();
  
  if (!cita) return null;

  const handleCambiarEstado = (nuevoEstado: string) => {
    if (onEstadoChange) {
      onEstadoChange(cita.folio, nuevoEstado);
      toast({
        title: "Estado actualizado",
        description: `La cita ${cita.folio} ha sido actualizada a ${nuevoEstado}`,
      });
    }
  };

  const handleConfirmarArribo = () => {
    if (onConfirmarArribo) {
      onConfirmarArribo(cita.folio);
      toast({
        title: "Arribo confirmado",
        description: `Se ha confirmado el arribo de la cita ${cita.folio}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Detalles de la Cita - {cita.folio}
          </DialogTitle>
          <DialogDescription>
            Información completa de la cita programada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información general */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-primary">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{format(cita.fechaCita, "EEEE, dd/MM/yyyy", { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horario</p>
                    <p className="font-medium">{cita.horario}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rampa</p>
                    <p className="font-medium">{cita.rampa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estado General</p>
                    {getEstadoBadge(cita.estadoGeneral)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proveedores */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                Proveedores ({cita.proveedores.length})
              </h3>
              <div className="space-y-2">
                {cita.proveedores.map((proveedor, index) => (
                  <div key={index} className="p-2 bg-muted/30 rounded border">
                    <p className="font-medium">{proveedor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OCs */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-primary">
                Órdenes de Compra ({cita.ocs.length})
              </h3>
              <div className="space-y-3">
                {cita.ocs.map((oc, index) => (
                  <div key={oc.numero}>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-primary">{oc.numero}</p>
                          {getEstadoBadge(oc.estadoRecibo)}
                        </div>
                        <p className="text-sm text-muted-foreground">{oc.proveedor}</p>
                        {oc.comentarios && (
                          <div className="mt-2 p-2 bg-background border rounded text-sm">
                            <p className="text-muted-foreground font-medium">Comentarios:</p>
                            <p className="italic">{oc.comentarios}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < cita.ocs.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Cambiar Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleCambiarEstado("en espera")}>
                  En espera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCambiarEstado("descargando")}>
                  Descargando
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCambiarEstado("finalizado")}>
                  Finalizado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleConfirmarArribo} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Confirmar Arribo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}