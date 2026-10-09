import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { explain, hasDb, listAvisos, type AvisoRow } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { AvisoList } from "../_components/AvisoList";

export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  let rows: AvisoRow[] = [];
  let problem = "";
  if (hasDb) {
    try {
      rows = await listAvisos();
    } catch (error) {
      problem = explain(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <>
      <Nav />
      <h1>Avisos</h1>
      <p className="ad-lead">
        Quienes han dejado su email en «Nuevos outfits en camino» para que les avises cuando vuelvan. Todos han marcado
        la casilla de la política de privacidad. Cuando les escribas, pon los emails en «CCO» y, una vez avisados,
        bórralos: solo dieron permiso para ese aviso.
      </p>
      {problem ? (
        <>
          <p className="ad-msg ad-msg-err">{problem}</p>
          <p className="ad-hint">
            Mientras tanto no se pierde ninguno: los avisos se guardan en «Solicitudes» con el nombre «Aviso de nuevos
            outfits».
          </p>
        </>
      ) : (
        <AvisoList rows={rows} />
      )}
    </>
  );
}
