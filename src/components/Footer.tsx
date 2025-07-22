import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

const Footer = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    navigate("/admin");
  };

  return (
    <>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          {/* Company Info */}
          <div className="text-center text-sm text-gray-300">
            <div className="space-y-2">
              <p>상호명 : 늘봄 / 대표 : 고은천 / 번호 : 010-3938-2998</p>
              <p>이메일 : neulbom2020@naver.com / 사업자 등록번호 : 749-77-00451</p>
              <p 
                className="text-xs cursor-pointer hover:text-primary transition-colors"
                onClick={handleAdminClick}
              >
                Copyright ⓒ 늘봄 All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Footer;