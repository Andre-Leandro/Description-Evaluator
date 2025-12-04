'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  GitCompare,
  Star,
  BarChart2,
  Upload,
  Home,
  Download,
  Flame,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const navItems = [
  {
    name: 'Inicio',
    path: '/',
    icon: <Home className="w-5 h-5" />
  },
  {
    name: 'Cargar Datos',
    path: '/subir-csv',
    icon: <Upload className="w-5 h-5" />
  },
  {
    name: 'Evaluación',
    path: '/comparacion',
    icon: <GitCompare className="w-5 h-5" />
  },
  {
    name: 'Resultados',
    path: '/resultados',
    icon: <BarChart2 className="w-5 h-5" />
  },
  {
    name: 'Descargar CSV',
    path: '/descargar-csv',
    icon: <Download className="w-5 h-5" />
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState({ crash: false, cache: false });
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', !isCollapsed);
  };

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const handleCrashTest = async () => {
    if (!confirm('⚠️ Esto va a crashear el backend intencionalmente (OOMKilled). ¿Continuar?')) {
      return;
    }
    setIsLoading(prev => ({ ...prev, crash: true }));
    try {
      const response = await fetch(`${API_URL}/kill-memory`, {
        method: 'POST',
      });
      const data = await response.json();
      alert(`🔥 Crash Test iniciado!\n${data.message}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, crash: false }));
    }
  };

  const handleClearCache = async () => {
    if (!confirm('¿Vaciar todo el cache de Redis?')) {
      return;
    }
    setIsLoading(prev => ({ ...prev, cache: true }));
    try {
      const response = await fetch(`${API_URL}/cache`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, cache: false }));
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-68'}`}>
      <div className="p-4 flex border-b border-gray-200">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-2 flex-grow min-w-0">
              <img
                src="/logo.png"
                alt="Logo"
                width={50}
                height={48}
                className="rounded-full flex-shrink-0"
              />
              <h2 className="text-lg font-bold text-gray-900 pl-2 leading-tight truncate">SmartCatalog</h2>
            </div>
            <button
              onClick={toggleSidebar}
              className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6"></div>
            <button
              onClick={toggleSidebar}
              className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Expandir menú"
            >
              <Menu size={18} />
            </button>
          </>
        )}
      </div>
      <nav className="flex-1 overflow-hidden hover:overflow-y-auto">
        <ul className="space-y-1 p-2 pr-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path ||
              (item.path !== '/' && pathname.startsWith(item.path));

            return (
              <li key={item.path} className="group">
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${isActive
                    ? 'bg-[#5A8CD3] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className={`w-6 flex-shrink-0 flex items-center justify-center`}>
                    {React.cloneElement(item.icon, {
                      className: `w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`
                    })}
                  </span>
                  <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.name}
                  </span>

                </Link>
              </li>
            );
          })}
        </ul>

        {/* DevOps Control Section */}
        <div className={`border-t border-gray-200 mt-2 pt-2 px-2 ${isCollapsed ? 'hidden' : ''}`}>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">DevOps Tests</p>
          <button
            onClick={handleCrashTest}
            disabled={isLoading.crash}
            className="w-full flex items-center p-3 rounded-md transition-colors text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <span className="w-6 flex-shrink-0 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </span>
            <span className="ml-3">
              {isLoading.crash ? 'Ejecutando...' : 'Crash Test'}
            </span>
          </button>
          <button
            onClick={handleClearCache}
            disabled={isLoading.cache}
            className="w-full flex items-center p-3 rounded-md transition-colors text-orange-600 hover:bg-orange-50 disabled:opacity-50"
          >
            <span className="w-6 flex-shrink-0 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </span>
            <span className="ml-3">
              {isLoading.cache ? 'Vaciando...' : 'Vaciar Redis'}
            </span>
          </button>
        </div>

        {/* Collapsed state DevOps buttons */}
        {isCollapsed && (
          <div className="border-t border-gray-200 mt-2 pt-2 px-2">
            <button
              onClick={handleCrashTest}
              disabled={isLoading.crash}
              className="w-full flex items-center justify-center p-3 rounded-md transition-colors text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="🔥 Crash Test"
            >
              <Flame className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearCache}
              disabled={isLoading.cache}
              className="w-full flex items-center justify-center p-3 rounded-md transition-colors text-orange-600 hover:bg-orange-50 disabled:opacity-50"
              title="🗑️ Vaciar Redis"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </nav>
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 ">
          <p>SmartCatalog v1.0.0</p>
        </div>
      )}
    </div>
  );
}
