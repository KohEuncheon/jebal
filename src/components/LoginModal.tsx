import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === "admin123") {
      // 로그인 상태를 localStorage에 저장 (7일 만료)
      const loginData = {
        isLoggedIn: true,
        expiry: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일
      };
      localStorage.setItem("adminLoggedIn", JSON.stringify(loginData));
      onSuccess();
      onClose();
      toast({
        title: "로그인 성공",
        description: "관리자 페이지로 이동합니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">관리자 로그인</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handleLogin} className="flex-1">
              로그인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;