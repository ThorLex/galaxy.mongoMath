import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sections = [
    {
      title: 'Getting Started',
      items: ['Installation', 'Quick Start', 'Configuration']
    },
    {
      title: 'Core Concepts',
      items: ['Data Analysis', 'Cross-Field Analysis', 'Statistical Metrics']
    },
    {
      title: 'API Reference',
      items: ['MongoMath Class', 'dataAnalyzer', 'Error Handling']
    },
    {
      title: 'Examples',
      items: ['Basic Usage', 'Advanced Analysis', 'Performance Tips']
    }
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out`}
    >
      <div className="h-full overflow-y-auto">
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="px-4 py-2">
          {sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg px-3 py-2"
                    >
                      <span>{item}</span>
                      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;