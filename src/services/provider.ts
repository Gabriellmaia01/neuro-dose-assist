/**
 * Define se os dados clínicos (Pacientes, Medicamentos, Doses, Agenda, Notas,
 * Clínica, Logs de Atividade e Configurações) devem usar a API Spring Boot + MySQL/MariaDB
 * ("spring") ou o legado Firebase ("firebase").
 *
 * A autenticação permanece no Firebase Auth em ambos os modos.
 */
export function isSpringApiEnabled(): boolean {
  return String(import.meta.env.VITE_API_PROVIDER || "").trim().toLowerCase() === "spring";
}
