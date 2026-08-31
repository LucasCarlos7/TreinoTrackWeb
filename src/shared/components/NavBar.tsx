import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Treino
      </NavLink>
      <NavLink to="/plano" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Gerar plano
      </NavLink>
      <NavLink to="/nutricao" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Nutrição
      </NavLink>
      <NavLink to="/progresso" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        Progresso
      </NavLink>
    </nav>
  );
}
