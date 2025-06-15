import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  FileText, 
  FileSpreadsheet,
  Home 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'الرئيسية', icon: Home, path: '/' },
    { name: 'إدخال كارتة جديدة', icon: PlusCircle, path: '/card-entry' },
    { name: 'سجل الكارتات', icon: Search, path: '/search' },
    { name: 'إنشاء فاتورة', icon: FileText, path: '/invoice-creation' },
    { name: 'سجل الفواتير', icon: FileSpreadsheet, path: '/invoices' }
  ];
  
  return (
    <div className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="pt-5 pb-4 h-full flex flex-col">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  group flex items-center px-2 py-3 text-sm font-medium rounded-md 
                  ${location.pathname === item.path
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    ml-3 flex-shrink-0 h-5 w-5
                    ${location.pathname === item.path
                      ? 'text-green-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            نظام إدارة المحاصيل - الإصدار 1.0
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;