"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bus,
  Route,
  MapPinned,
  Calendar,
  BarChart3,
  LogOut,
  UserCheck,
  ArrowRightLeft,
  MessageCircle,
} from "lucide-react";

const sections = [
  {
    title: null,
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/motoristas", icon: UserCheck, label: "Motoristas" },
      { href: "/passageiros", icon: Users, label: "Passageiros" },
      { href: "/onibus", icon: Bus, label: "Ônibus" },
      { href: "/rotas", icon: Route, label: "Rotas" },
      { href: "/itinerarios", icon: MapPinned, label: "Itinerários" },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/viagens", icon: Calendar, label: "Viagens" },
      { href: "/embarques", icon: ArrowRightLeft, label: "Embarques" },
      { href: "/feedbacks", icon: MessageCircle, label: "Feedbacks" },
    ],
  },
  {
    title: "Análise",
    items: [
      { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-slate-900 text-slate-300">
      <div className="px-5 py-6 h-full flex flex-col">
        {/* Logo */}
        <div className="flex-shrink-0 mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                SIGA
              </h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                Juazeiro do Norte
              </p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-slate-800 text-emerald-400 font-medium"
                          : "hover:bg-slate-800/60 hover:text-slate-100"
                      }`}
                    >
                      <item.icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${
                          isActive
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Botão Sair */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-slate-500" />
            <span className="truncate">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
