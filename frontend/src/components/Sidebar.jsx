'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  GitCompare, 
  Star, 
  BarChart2, 
  Upload, 
  Home,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { 
    name: 'Inicio', 
    path: '/', 
    tab: 'inicio',
    icon: <Home className="w-5 h-5" />
  },
  { 
    name: 'Comparación', 
    path: '/', 
    tab: 'comparacion',
    icon: <GitCompare className="w-5 h-5" />
  },
  { 
    name: 'Calificación', 
    path: '/', 
    tab: 'individual',
    icon: <Star className="w-5 h-5" />
  },
  { 
    name: 'Resultados', 
    path: '/', 
    tab: 'resultados',
    icon: <BarChart2 className="w-5 h-5" />
  },
  { 
    name: 'Subir CSV', 
    path: '/', 
    tab: 'upload',
    icon: <Upload className="w-5 h-5" />
  },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`h-screen flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed ? (
          <h2 className="text-lg font-semibold text-gray-700">Menú</h2>
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
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {navItems.map((item) => (
            <li key={item.tab}>
              <Link
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.tab);
                }}
                className={`flex items-center p-3 rounded-md transition-colors ${
                  activeTab === item.tab
                    ? 'bg-[#a9cce3] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                  {React.cloneElement(item.icon, {
                    className: `w-5 h-5 ${activeTab === item.tab ? 'text-white' : 'text-gray-500'}`
                  })}
                </span>
                {!isCollapsed && (
                  <span className="font-medium">{}</span>
                )}
                {isCollapsed ? (
                  <span className="flex items-center justify-center w-8 h-8">
                    {}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-3">{item.name}</span>
                    {activeTab === item.tab && <ChevronRight size={16} className="ml-auto" />}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Description Evaluator</p>
          <p>v1.0.0</p>
        </div>
      )}
    </div>
  );
}
