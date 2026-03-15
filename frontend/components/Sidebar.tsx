"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Bus,
  Map,
  Calendar,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronUp,
  TrendingUpDown,
  MessageSquareCheck,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/motoristas", icon: Users, label: "Motoristas" },
    { href: "/passageiros", icon: Users, label: "Passageiros" },
    { href: "/onibus", icon: Bus, label: "Ônibus" },
    { href: "/rotas", icon: Map, label: "Rotas" },
    { href: "/itinerarios", icon: Map, label: "Itinerários" }, // ← NOVO
    { href: "/viagens", icon: Calendar, label: "Viagens" },
    { href: "/embarques", icon: TrendingUpDown, label: "Embarques" },
    { href: "/feedbacks", icon: MessageSquareCheck, label: "Feedbacks" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-blue-800 text-white">
      <div className="p-6 h-full flex flex-col">
        {/* Logo */}
        <div className="flex-shrink-0 mb-8">
          <h1 className="text-2xl font-bold">SIGA</h1>
          <p className="text-sm opacity-80">Juazeiro do Norte</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto space-y-1 pr-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Link direto para Relatórios (sem dropdown) */}
          <Link
            href="/relatorios"
            className={`flex items-center px-4 py-3 rounded-lg transition ${
              pathname === "/relatorios" ? "bg-blue-700" : "hover:bg-blue-700"
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">Relatórios</span>
          </Link>
        </nav>

        {/* Botão Sair */}
        <div className="flex-shrink-0 pt-4 border-t border-blue-700 mt-4">
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}