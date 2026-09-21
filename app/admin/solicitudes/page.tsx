import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listSubmissions } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { SubmissionList } from "../_components/SubmissionList";

export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  const rows = hasDb ? await listSubmissions() : [];
  const nuevas = rows.filter((r) => r.estado === "nuevo").length;

  return (
    <>
      <Nav nuevas={nuevas} />
      <h1>Solicitudes</h1>
      <p className="ad-lead">
        Lo que manda la gente desde el formulario de «De seguidores»: su nombre, Instagram, email, el outfit que quieren ver y si se ha
        registrado en Hipobuy con tu link.
      </p>
      <SubmissionList rows={rows} />
    </>
  );
}
