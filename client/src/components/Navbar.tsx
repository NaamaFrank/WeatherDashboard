import { NavLink } from "react-router-dom";

const linkBase =
  "px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105";
const active =
  "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl ring-2 ring-slate-300";
const idle =
  "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900 hover:shadow-lg";

export default function Navbar() {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b-2 border-slate-300 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.4 4.4 0 003 15z" />
            </svg>
          </div>
          <div className="font-black text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
            Weather Alerts
          </div>
        </div>
        <nav className="flex gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
            end
          >
            <span className="text-lg">🌤️</span> Weather
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : idle}`
            }
          >
            <span className="text-lg">🚨</span> Alerts
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
