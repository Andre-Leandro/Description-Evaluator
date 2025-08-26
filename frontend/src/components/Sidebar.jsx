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
  Download
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    name: 'Comparación', 
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

  return (
    <div className={`h-screen flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed ? (
          <h2 className="text-lg font-bold text-gray-900"> Catalog Enrichment</h2>
        ) : (
          <div className="w-6"></div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
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
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive
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
      </nav>
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Description Evaluator v1.0.0</p>
        </div>
      )}
    </div>
  );
}
