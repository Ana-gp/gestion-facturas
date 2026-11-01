import type { Metadata } from "next";
import Subir from "./Subir";

export const metadata: Metadata = {
  title: "Subir justificante | Ticketon",
};

// [Pendiente] Cuando estén el login (#13) y los límites del plan (#31), leer
// aquí el uso real del mes y la dirección de reenvío (#16).
export default function SubirPage() {
  return <Subir uso={{ usados: 7, limite: 10 }} direccionCorreo={null} datosDeEjemplo />;
}
