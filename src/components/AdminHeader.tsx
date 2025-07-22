import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminHeader = ({ activeTab, setActiveTab }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const tabs = [
    { id: "dashboard", label: "대시보드" },
    { id: "inquiries", label: "문의 관리" },
    { id: "hosts", label: "사회자 관리" },
    { id: "banners", label: "배너 관리" },
    { id: "promotions", label: "프로모션" },
    { id: "tips", label: "안내&TIP" }
  ];

  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">늘봄 관리자</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;