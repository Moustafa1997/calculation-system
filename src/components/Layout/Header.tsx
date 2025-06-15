import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // Define titles for each route
  const getTitleForPath = (path: string): string => {
    switch (path) {
      case '/':
        return 'نظام إدارة المحاصيل';
      case '/card-entry':
        return 'إدخال كارتة جديدة';
      case '/search':
        return 'البحث عن الكارتات';
      case '/invoice-creation':
        return 'إنشاء فاتورة جديدة';
      case '/invoices':
        return 'سجل الفواتير';
      default:
        if (path.startsWith('/invoices/')) {
          return 'تفاصيل الفاتورة';
        }
        return 'نظام إدارة المحاصيل';
    }
  };
  
  // Get breadcrumb items
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const result = [{ name: 'الرئيسية', path: '/' }];
    
    if (path === '/') {
      return result;
    }
    
    if (path === '/card-entry') {
      result.push({ name: 'إدخال كارتة جديدة', path: '/card-entry' });
    } else if (path === '/search') {
      result.push({ name: 'البحث عن الكارتات', path: '/search' });
    } else if (path === '/invoice-creation') {
      result.push({ name: 'إنشاء فاتورة جديدة', path: '/invoice-creation' });
    } else if (path === '/invoices') {
      result.push({ name: 'سجل الفواتير', path: '/invoices' });
    } else if (path.startsWith('/invoices/')) {
      result.push({ name: 'سجل الفواتير', path: '/invoices' });
      result.push({ name: 'تفاصيل الفاتورة', path });
    }
    
    return result;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://images.pexels.com/photos/2893552/pexels-photo-2893552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Potato Field"
              className="h-12 w-12 object-cover rounded-full ml-3"
            />
            <h1 className="text-xl font-bold text-gray-900">
              {getTitleForPath(location.pathname)}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4 space-x-reverse">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.path}>
                    <div className="flex items-center">
                      {index !== 0 && (
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-gray-400 ml-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <Link
                        to={breadcrumb.path}
                        className={`text-sm font-medium ${
                          index === breadcrumbs.length - 1
                            ? 'text-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {breadcrumb.name}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>

            <button
              onClick={logout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;