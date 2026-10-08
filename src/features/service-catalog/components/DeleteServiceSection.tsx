"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { notifyError } from "@/lib/notify-error";
import { ServiceCatalogService } from "../services/service-catalog.service";
import DeleteServiceDialog from "./DeleteServiceDialog";

/** Zona de eliminación en la edición del servicio; al eliminar vuelve al listado. */
export default function DeleteServiceSection({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const router = useRouter();

  async function remove(): Promise<boolean> {
    try {
      await ServiceCatalogService.remove(serviceId);
      toast.success(`${serviceName} eliminado`);
      router.push("/servicios");
      router.refresh();
      return true;
    } catch (err) {
      notifyError(err, "No se pudo eliminar el servicio.");
      return false;
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-destructive/30 p-4 md:flex-row md:items-center md:justify-between md:p-6">
      <h2 className="font-semibold">Zona de peligro</h2>
      <DeleteServiceDialog serviceName={serviceName} onConfirm={remove} />
    </section>
  );
}
