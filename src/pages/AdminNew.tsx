import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, Building, Star, FileText, Trash2, Edit, Eye } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BulkUpload from "@/components/BulkUpload";

// 로그인 상태 확인 함수
const checkAdminAuth = () => {
  const adminAuth = localStorage.getItem('adminLoggedIn');
  if (!adminAuth) return false;
  
  const authData = JSON.parse(adminAuth);
  
  // expiry 시간 확인
  if (Date.now() > authData.expiry) {
    localStorage.removeItem('adminLoggedIn');
    return false;
  }
  
  return authData.isLoggedIn;
};

const AdminNew = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hosts, setHosts] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('reservations');
  const [showAddHostModal, setShowAddHostModal] = useState(false);
  const [showAddPromotionModal, setShowAddPromotionModal] = useState(false);
  const [showAddTipModal, setShowAddTipModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  
  const [hostForm, setHostForm] = useState({
    name: "",
    description: "",
    imageUrl: ""
  });
  const [promotionForm, setPromotionForm] = useState({
    title: "",
    content: "",
    isActive: true
  });
  const [tipForm, setTipForm] = useState({
    category: "",
    title: "",
    content: "",
    author: "",
    tags: "",
    isPublished: true
  });
  
  const [editingHost, setEditingHost] = useState<any>(null);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [editingTip, setEditingTip] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const { toast } = useToast();

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsAuthenticated(false);
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
  };

  // 관리자 로그인 함수
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password') as string;
    
    console.log('입력된 비밀번호:', password);
    console.log('설정된 비밀번호: admin123');
    
    if (password === 'admin123') {
      const authData = {
        isLoggedIn: true,
        expiry: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일
      };
      localStorage.setItem('adminLoggedIn', JSON.stringify(authData));
      setIsAuthenticated(true);
      loadHosts();
      loadReservations();
      loadPromotions();
      loadTips();
      toast({
        title: "로그인 성공",
        description: "관리자 페이지에 접속했습니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "비밀번호가 올바르지 않습니다. 비밀번호: admin123",
        variant: "destructive",
      });
    }
  };

  // 데이터 로드 함수들
  const loadHosts = async () => {
    try {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setHosts(data || []);
    } catch (error) {
      console.error('사회자 목록 로드 실패:', error);
    }
  };

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          host:hosts(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('프로모션 목록 로드 실패:', error);
    }
  };

  const loadTips = async () => {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('팁 목록 로드 실패:', error);
    }
  };

  useEffect(() => {
    const authResult = checkAdminAuth();
    setIsAuthenticated(authResult);
    
    if (authResult) {
      loadHosts();
      loadReservations();
      loadPromotions();
      loadTips();
    }
  }, []);

  // 사회자 관리 함수들
  const handleAddHost = async () => {
    try {
      const { error } = await supabase
        .from('hosts')
        .insert([{
          name: hostForm.name,
          description: hostForm.description,
          image_url: hostForm.imageUrl
        }]);

      if (error) throw error;

      await loadHosts();
      setHostForm({ name: "", description: "", imageUrl: "" });
      setShowAddHostModal(false);
      toast({
        title: "성공",
        description: "사회자가 성공적으로 추가되었습니다!",
      });
    } catch (error) {
      console.error('사회자 추가 실패:', error);
      toast({
        title: "오류",
        description: "사회자 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHost = async (hostId: string, hostName: string) => {
    if (window.confirm(`정말로 "${hostName}" 사회자를 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('hosts')
          .delete()
          .eq('id', hostId);

        if (error) throw error;

        await loadHosts();
        toast({
          title: "삭제 완료",
          description: `"${hostName}" 사회자가 성공적으로 삭제되었습니다.`,
        });
      } catch (error) {
        console.error('사회자 삭제 실패:', error);
        toast({
          title: "삭제 실패",
          description: "사회자 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 프로모션 관리 함수들
  const handleAddPromotion = async () => {
    try {
      const { error } = await supabase
        .from('promotions')
        .insert([{
          title: promotionForm.title,
          content: promotionForm.content,
          is_active: promotionForm.isActive
        }]);

      if (error) throw error;

      await loadPromotions();
      setPromotionForm({ title: "", content: "", isActive: true });
      setShowAddPromotionModal(false);
      toast({
        title: "성공",
        description: "프로모션이 성공적으로 추가되었습니다!",
      });
    } catch (error) {
      console.error('프로모션 추가 실패:', error);
      toast({
        title: "오류",
        description: "프로모션 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePromotion = async (promotionId: string, promotionTitle: string) => {
    if (window.confirm(`정말로 "${promotionTitle}" 프로모션을 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('promotions')
          .delete()
          .eq('id', promotionId);

        if (error) throw error;

        await loadPromotions();
        toast({
          title: "삭제 완료",
          description: `"${promotionTitle}" 프로모션이 성공적으로 삭제되었습니다.`,
        });
      } catch (error) {
        console.error('프로모션 삭제 실패:', error);
        toast({
          title: "삭제 실패",
          description: "프로모션 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 팁 관리 함수들
  const handleAddTip = async () => {
    try {
      const { error } = await supabase
        .from('tips')
        .insert([{
          category: tipForm.category,
          title: tipForm.title,
          content: tipForm.content,
          author: tipForm.author,
          tags: tipForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_published: tipForm.isPublished
        }]);

      if (error) throw error;

      await loadTips();
      setTipForm({ category: "", title: "", content: "", author: "", tags: "", isPublished: true });
      setShowAddTipModal(false);
      toast({
        title: "성공",
        description: "팁이 성공적으로 추가되었습니다!",
      });
    } catch (error) {
      console.error('팁 추가 실패:', error);
      toast({
        title: "오류",
        description: "팁 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTip = async (tipId: string, tipTitle: string) => {
    if (window.confirm(`정말로 "${tipTitle}" 팁을 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('tips')
          .delete()
          .eq('id', tipId);

        if (error) throw error;

        await loadTips();
        toast({
          title: "삭제 완료",
          description: `"${tipTitle}" 팁이 성공적으로 삭제되었습니다.`,
        });
      } catch (error) {
        console.error('팁 삭제 실패:', error);
        toast({
          title: "삭제 실패",
          description: "팁 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (window.confirm("정말로 이 예약을 삭제하시겠습니까?")) {
      try {
        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', reservationId);

        if (error) throw error;

        await loadReservations();
        toast({
          title: "성공",
          description: "예약이 성공적으로 삭제되었습니다!",
        });
      } catch (error) {
        console.error('예약 삭제 실패:', error);
        toast({
          title: "오류",
          description: "예약 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      await loadReservations();
      
      // 선택된 예약 정보도 업데이트
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "성공",
        description: "예약 상태가 성공적으로 변경되었습니다!",
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 로그인 전 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-96">
          <h1 className="text-2xl font-bold text-center mb-6">관리자 로그인</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">관리자 페이지</h1>
          <Button variant="outline" onClick={handleLogout} className="text-white border-white hover:bg-white hover:text-gray-900">
            로그아웃
          </Button>
        </div>
        
        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'reservations' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('reservations')}
              >
                <Building className="inline mr-2 h-4 w-4" />
                예약 문의 관리
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'hosts' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('hosts')}
              >
                <User className="inline mr-2 h-4 w-4" />
                사회자 관리
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'promotions' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('promotions')}
              >
                <Star className="inline mr-2 h-4 w-4" />
                프로모션 관리
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'tips' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('tips')}
              >
                <FileText className="inline mr-2 h-4 w-4" />
                안내팁 관리
              </button>
            </div>
          </div>

          {/* 예약 문의 관리 탭 */}
          {activeTab === 'reservations' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">예약 문의 관리</h2>
                <BulkUpload />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-left">번호</th>
                      <th className="border p-3 text-left">제목</th>
                      <th className="border p-3 text-left">사회자</th>
                      <th className="border p-3 text-left">작성자</th>
                      <th className="border p-3 text-left">날짜</th>
                      <th className="border p-3 text-left">상태</th>
                      <th className="border p-3 text-left">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation, index) => (
                      <tr 
                        key={reservation.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowReservationModal(true);
                        }}
                      >
                        <td className="border p-3">{reservations.length - index}</td>
                        <td className="border p-3 font-medium text-blue-600 hover:underline">{reservation.title}</td>
                        <td className="border p-3">{reservation.host?.name || 'N/A'}</td>
                        <td className="border p-3">{reservation.contact}</td>
                        <td className="border p-3">{new Date(reservation.created_at).toLocaleDateString('ko-KR')}</td>
                        <td className="border p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reservation.status === 'pending' ? '문의' :
                             reservation.status === 'confirmed' ? '확정' : '취소됨'}
                          </span>
                        </td>
                        <td className="border p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteReservation(reservation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 사회자 관리 탭 */}
          {activeTab === 'hosts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">사회자 관리</h2>
                <Dialog open={showAddHostModal} onOpenChange={setShowAddHostModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      새 사회자 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 사회자 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="hostName">이름</Label>
                        <Input
                          id="hostName"
                          value={hostForm.name}
                          onChange={(e) => setHostForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="사회자 이름"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hostDescription">설명</Label>
                        <Textarea
                          id="hostDescription"
                          value={hostForm.description}
                          onChange={(e) => setHostForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="사회자 설명"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hostImageUrl">이미지 URL</Label>
                        <Input
                          id="hostImageUrl"
                          value={hostForm.imageUrl}
                          onChange={(e) => setHostForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="이미지 URL (선택사항)"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddHostModal(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddHost}>
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hosts.map((host) => (
                  <div key={host.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{host.name}</h3>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteHost(host.id, host.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {host.description && (
                      <p className="text-sm text-gray-600 mb-2">{host.description}</p>
                    )}
                    {host.image_url && (
                      <img src={host.image_url} alt={host.name} className="w-full h-32 object-cover rounded" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 프로모션 관리 탭 */}
          {activeTab === 'promotions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">프로모션 관리</h2>
                <Dialog open={showAddPromotionModal} onOpenChange={setShowAddPromotionModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      새 프로모션 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 프로모션 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="promotionTitle">제목</Label>
                        <Input
                          id="promotionTitle"
                          value={promotionForm.title}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="프로모션 제목"
                        />
                      </div>
                      <div>
                        <Label htmlFor="promotionContent">내용</Label>
                        <Textarea
                          id="promotionContent"
                          value={promotionForm.content}
                          onChange={(e) => setPromotionForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="프로모션 내용"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddPromotionModal(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddPromotion}>
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {promotions.map((promotion) => (
                  <div key={promotion.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{promotion.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{promotion.content}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {promotion.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePromotion(promotion.id, promotion.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 안내팁 관리 탭 */}
          {activeTab === 'tips' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">안내팁 관리</h2>
                <Dialog open={showAddTipModal} onOpenChange={setShowAddTipModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      새 팁 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 팁 추가</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="tipCategory">카테고리</Label>
                        <Input
                          id="tipCategory"
                          value={tipForm.category}
                          onChange={(e) => setTipForm(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="팁 카테고리"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipTitle">제목</Label>
                        <Input
                          id="tipTitle"
                          value={tipForm.title}
                          onChange={(e) => setTipForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="팁 제목"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipContent">내용</Label>
                        <Textarea
                          id="tipContent"
                          value={tipForm.content}
                          onChange={(e) => setTipForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="팁 내용"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipAuthor">작성자</Label>
                        <Input
                          id="tipAuthor"
                          value={tipForm.author}
                          onChange={(e) => setTipForm(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="작성자"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipTags">태그 (쉼표로 구분)</Label>
                        <Input
                          id="tipTags"
                          value={tipForm.tags}
                          onChange={(e) => setTipForm(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="태그1, 태그2, 태그3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddTipModal(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddTip}>
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {tips.map((tip) => (
                  <div key={tip.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{tip.category}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            tip.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tip.is_published ? '공개' : '비공개'}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tip.content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500">작성자: {tip.author}</p>
                        {tip.tags && tip.tags.length > 0 && (
                          <div className="mt-2">
                            {tip.tags.map((tag: string, index: number) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded mr-1">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTip(tip.id, tip.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 예약 상세 모달 */}
      {selectedReservation && (
        <Dialog open={showReservationModal} onOpenChange={setShowReservationModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>예약 상세 정보</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>제목</Label>
                  <p className="text-sm">{selectedReservation.title}</p>
                </div>
                <div>
                  <Label>상태 변경</Label>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant={selectedReservation.status === 'pending' ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedReservation.id, 'pending')}
                    >
                      문의
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedReservation.status === 'confirmed' ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedReservation.id, 'confirmed')}
                    >
                      확정
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedReservation.status === 'cancelled' ? "destructive" : "outline"}
                      onClick={() => handleStatusChange(selectedReservation.id, 'cancelled')}
                    >
                      취소
                    </Button>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedReservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedReservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      현재 상태: {selectedReservation.status === 'pending' ? '문의' :
                                selectedReservation.status === 'confirmed' ? '확정' : '취소됨'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>신부</Label>
                  <p className="text-sm">{selectedReservation.bride}</p>
                </div>
                <div>
                  <Label>신랑</Label>
                  <p className="text-sm">{selectedReservation.groom}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>연락처</Label>
                  <p className="text-sm">{selectedReservation.contact}</p>
                </div>
                <div>
                  <Label>사회자</Label>
                  <p className="text-sm">{selectedReservation.host?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>웨딩홀</Label>
                  <p className="text-sm">{selectedReservation.venue}</p>
                </div>
                <div>
                  <Label>예식종류</Label>
                  <p className="text-sm">{selectedReservation.ceremony_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>예식일</Label>
                  <p className="text-sm">{selectedReservation.ceremony_date}</p>
                </div>
                <div>
                  <Label>예식시간</Label>
                  <p className="text-sm">{selectedReservation.ceremony_time}</p>
                </div>
              </div>
              {selectedReservation.notes && (
                <div>
                  <Label>메모</Label>
                  <p className="text-sm">{selectedReservation.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowReservationModal(false)}>
                닫기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminNew;