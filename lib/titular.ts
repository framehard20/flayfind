// Who runs the site, for the legal notice (LSSI art. 10) and the privacy
// policy (GDPR art. 13). Fill in the three fields to show them; while they're
// empty, the pages show only the contact email — never a blank or a placeholder.
//
// Ojo: el nombre aquí sale publicado. Antes del lanzamiento (1 nov) Mario no
// quiere que se sepa quién está detrás: rellénalo a partir de esa fecha.

export const TITULAR = {
  nombre: "", // nombre y apellidos, o la razón social si un día hay empresa
  nif: "", // DNI con letra (o CIF)
  domicilio: "", // calle, número, código postal y ciudad (puede ser una domiciliación)
};

export const hayTitular = () => !!(TITULAR.nombre && TITULAR.nif && TITULAR.domicilio);

/** Date of the current legal texts. */
export const LEGAL_ACTUALIZADO = "22 de octubre de 2026";
