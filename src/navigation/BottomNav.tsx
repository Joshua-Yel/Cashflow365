import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Plus, History, Target } from "lucide-react";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handlePress = (path: string) => {
    navigate(path);
  };

  const NavItem: React.FC<{
    path: string;
    icon: React.ReactNode;
    label: string;
  }> = ({ path, icon, label }) => {
    const isActive = location.pathname === path;

    return (
      <button
        className={`flex flex-col items-center flex-1 py-2 px-1 transition-colors ${
          isActive ? "text-blue-600" : "text-gray-500"
        }`}
        onClick={() => handlePress(path)}
      >
        <div className="text-2xl mb-1">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavItem
          path="/"
          icon={<Home size={24} />}
          label="Home"
        />
        <NavItem
          path="/predictions"
          icon={<BarChart3 size={24} />}
          label="Predict"
        />
        <button
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors -mt-6"
          onClick={() => handlePress("/quick-add")}
        >
          <Plus size={24} />
        </button>
        <NavItem
          path="/expenses-list"
          icon={<History size={24} />}
          label="History"
        />
        <NavItem
          path="/savings-goals"
          icon={<Target size={24} />}
          label="Goals"
        />
      </div>
    </div>
  );
};

export default BottomNav;
