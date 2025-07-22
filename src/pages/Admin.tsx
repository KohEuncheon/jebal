import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Users, Calendar, FileText, Star, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { checkAdminAuth } from "@/utils/auth";

interface SocialHost {
  id: string;
  name: string;
  region: string;
  photoPath: string;
  biography: string[];
  color: string;
}

interface Reservation {
  id: string;
  title: string;
  bride: string;
  groom: string;
  contact: string;
  hostId: string;
  venue: string;
  ceremonyType: string;
  secondParty: string;
  ceremonyDate: string;
  ceremonyTime: string;
  referralSource: string;
  additionalInput?: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Promotion {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hosts, setHosts] = useState<SocialHost[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [selectedHost, setSelectedHost] = useState<SocialHost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newHost, setNewHost] = useState({
    name: '',
    region: '',
    photoPath: '',
    biography: [''],
    color: '#ef4444'
  });
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    content: '',
    isActive: true
  });
  const [newTip, setNewTip] = useState({
    category: '',
    title: '',
    content: '',
    author: '',
    tags: '',
    isPublished: true
  });

  // 클립보드 복사 함수
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다.");
  };

  // DB 내용 생성 함수
  const generateDBContent = (reservation: Reservation) => {
    const hostName = hosts.find(h => h.id === reservation.hostId)?.name || '사회자';
    const ceremonyTypeText = reservation.ceremonyType === '주례있음' ? '주례 있는 예식' : '주례 없는 예식';
    const secondPartText = reservation.secondParty === '있음' ? '2부 진행 함' : '2부 진행 안함';
    
    return `**늘봄 예약 문의 확인**
${reservation.ceremonyDate} / ${reservation.ceremonyTime} / ${reservation.venue} / ${secondPartText} / /${hostName}/사회자 / ${reservation.bride}님

[제목]
${reservation.title}

[배우자]
${reservation.groom}님

[예식 종류]
${ceremonyTypeText}

[연락처]
${reservation.contact}

[문의 내용]
${reservation.notes || '비용이 궁금합니다!'}`;
  };

  // 가능 문구 생성 함수
  const generateAvailableMessage = (reservation: Reservation) => {
    const hostName = hosts.find(h => h.id === reservation.hostId)?.name || '사회자';
    const ceremonyDate = reservation.ceremonyDate.replace(/-/g, '년 ').replace(/년 /, '년도 ').replace(/-/, '월 ') + '일';
    
    return `안녕하세요 ${reservation.bride}님 맞으시죠?
프리미엄 결혼식 사회자 에이전시 늘봄입니다~^^ 

먼저 결혼을 진심으로 축하드립니다. 항상 행복과 즐거움이 가득하시길 바라겠습니다. 

${ceremonyDate} ${reservation.ceremonyTime} (${reservation.venue}) /${hostName}/ 사회자 예식 진행이 가능하십니다 

그럼 비용 안내해드릴까요~?`;
  };

  // 확정 문구 생성 함수
  const generateConfirmedMessage = (reservation: Reservation) => {
    const hostName = hosts.find(h => h.id === reservation.hostId)?.name || '사회자';
    const ceremonyDate = reservation.ceremonyDate.replace(/-/g, '년 ').replace(/년 /, '년도 ').replace(/-/, '월 ') + '일';
    
    return `아 네에 ${ceremonyDate} ${reservation.ceremonyTime} (${reservation.venue}) /${hostName}/ 사회자 섭외 확정 되셨구요~!   

사전 미팅은 /${hostName}/ 사회자와 직접 일정 조율 후에 진행 가능하십니다~ ㅎㅎㅎ   

식순과 대본 등은 /${hostName}/ 사회자를 통해 직접 받으실 수 있으며 늘봄에도 필요한 내용 있으시면 언제든 연락주시면 되겠습니다~!   

그리고 할인 이벤트(후기, 짝꿍/깐부)에 참여하시려면 아래 두 가지를 해주시면 됩니다.
1. 링크로 들어가 신청폼 작성(https://forms.gle/VY7pt8Nxp5UK1GBKA)
2. 링크 작성 후, 각 사회자가 아닌 늘봄 번호(010-3938-2998)로 신청폼 작성했다고 연락
(할인 이벤트는 예식 있는 전 주까지 등록을 완료해주셔야 할인 적용이 됩니다. 꼭 기한을 지켜 주시기 바랍니다.)

그럼 다시 한 번 진심으로 결혼을 축하드리구요~ /${hostName}/ 사회자에게 연락드리라고 전해놓겠습니다ㅎㅎㅎ
(번호 오류로 문자가 안 가는 경우가 있기 때문에 3일 내에 사회자에게서 연락이 오지 않는 경우에 이 번호로 다시 회신 부탁드립니다.) 감사합니다!!!
    
필요하신 것 있으시면 언제든 편히 연락주세요! 
감사합니다 :-)`;
  };

  // 거절 문구 생성 함수
  const generateRejectedMessage = (reservation: Reservation) => {
    const hostName = hosts.find(h => h.id === reservation.hostId)?.name || '사회자';
    const ceremonyDate = reservation.ceremonyDate.replace(/-/g, '년 ').replace(/년 /, '년도 ').replace(/-/, '월 ') + '일';
    
    return `안녕하세요 ${ceremonyDate} ${reservation.ceremonyTime} ${reservation.venue}로 문의 주신 ${reservation.bride}님 맞으시죠?
프리미엄 결혼식 사회자 에이전시 늘봄입니다~^^ 문의 남겨주셔서 연락드렸습니다!

먼저 결혼을 진심으로 축하드립니다. 항상 행복과 즐거움이 가득하시길 바라겠습니다.

그런데 정말 아쉽네요ᅮᅮ 문의해주신 해당 날짜에는 /${hostName}/ 사회자 일정이 차있어 서 진행이 어려울 것 같습니다ᅮᅮ

이렇게 연락을 주셨는데 너무 아쉽네요😭😭
도움 드리지 못해서 정말 죄송합니다ᅮᅮ

혹시 몰라서 다른 잘하는 사회자 필요하시면 편하게 연락주세요ᄒᄒᄒᄒ

감사합니다!!`;
  };

  // 비용 안내 생성 함수
  const generateCostGuide = (reservation: Reservation) => {
    return `넵 비용 알려드릴게요!! 

총 비용은 40에 진행되며, 후기 이벤트 참여시 최대 3만원, 짝꿍 이벤트 참여시 최대6만원 할인 가능합니다!! (최대9만원)
그럼 살펴보시고 편히 연락주세요!!😄`;
  };

  useEffect(() => {
    // 인증 확인
    const authResult = checkAdminAuth();
    setIsAuthenticated(authResult);
    
    if (authResult) {
      // 데이터 로드
      loadHosts();
      loadReservations();
      loadPromotions();
      loadTips();
    } else {
      setShowLoginModal(true);
    }
  }, []);

  const loadHosts = () => {
    const saved = localStorage.getItem('hosts');
    if (saved) {
      setHosts(JSON.parse(saved));
    }
  };

  const loadReservations = () => {
    const saved = localStorage.getItem('reservations');
    if (saved) {
      const parsedReservations = JSON.parse(saved);
      console.log('Admin - Loaded reservations:', parsedReservations);
      parsedReservations.forEach((res, index) => {
        console.log(`Reservation ${index}:`, {
          id: res.id,
          title: res.title,
          bride: res.bride,
          author: res.author
        });
      });
      setReservations(parsedReservations);
    }
  };

  const loadPromotions = () => {
    const saved = localStorage.getItem('wedding-promotions');
    console.log('Admin - Loading promotions from localStorage:', saved);
    if (saved) {
      const parsedPromotions = JSON.parse(saved);
      console.log('Admin - Parsed promotions:', parsedPromotions);
      setPromotions(parsedPromotions);
    }
  };

  const loadTips = () => {
    const saved = localStorage.getItem('wedding-tips');
    if (saved) {
      setTips(JSON.parse(saved));
    }
  };

  const saveHost = () => {
    if (!newHost.name || !newHost.region) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }

    const host: SocialHost = {
      id: `host-${Date.now()}`,
      ...newHost,
      biography: newHost.biography.filter(bio => bio.trim() !== '')
    };

    const updatedHosts = [...hosts, host];
    setHosts(updatedHosts);
    localStorage.setItem('hosts', JSON.stringify(updatedHosts));
    
    setNewHost({
      name: '',
      region: '',
      photoPath: '',
      biography: [''],
      color: '#ef4444'
    });

    toast.success("사회자 등록이 완료되었습니다.");
  };

  const updateHost = () => {
    if (!selectedHost) return;

    const updatedHosts = hosts.map(h =>
      h.id === selectedHost.id ? selectedHost : h
    );
    setHosts(updatedHosts);
    localStorage.setItem('hosts', JSON.stringify(updatedHosts));
    setSelectedHost(null);
    toast.success("사회자 정보가 수정되었습니다.");
  };

  const savePromotion = () => {
    if (!newPromotion.title || !newPromotion.content) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    const promotion: Promotion = {
      id: `promotion-${Date.now()}`,
      title: newPromotion.title,
      content: newPromotion.content,
      isActive: newPromotion.isActive,
      createdAt: new Date().toISOString()
    };

    const updatedPromotions = [...promotions, promotion];
    setPromotions(updatedPromotions);
    localStorage.setItem('wedding-promotions', JSON.stringify(updatedPromotions));
    
    setNewPromotion({
      title: '',
      content: '',
      isActive: true
    });

    toast.success("프로모션이 등록되었습니다.");
  };

  const updatePromotion = () => {
    if (!selectedPromotion) return;

    const updatedPromotions = promotions.map(p =>
      p.id === selectedPromotion.id ? selectedPromotion : p
    );
    setPromotions(updatedPromotions);
    localStorage.setItem('wedding-promotions', JSON.stringify(updatedPromotions));
    setSelectedPromotion(null);
    toast.success("프로모션이 수정되었습니다.");
  };

  const deletePromotion = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const updatedPromotions = promotions.filter(p => p.id !== id);
      setPromotions(updatedPromotions);
      localStorage.setItem('wedding-promotions', JSON.stringify(updatedPromotions));
      toast.success("프로모션이 삭제되었습니다.");
    }
  };

  const updateReservation = () => {
    if (!selectedReservation) return;

    const updatedReservations = reservations.map(r =>
      r.id === selectedReservation.id ? selectedReservation : r
    );
    setReservations(updatedReservations);
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    setSelectedReservation(null);
    toast.success("예약 정보가 수정되었습니다.");
  };

  const deleteReservation = (id: string) => {
    const updatedReservations = reservations.filter(r => r.id !== id);
    setReservations(updatedReservations);
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    toast.success("예약이 삭제되었습니다.");
  };

  const filteredReservations = reservations
    .filter(reservation =>
      reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.bride.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.groom.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 최신순 정렬

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-wedding-800 mb-4">관리자 인증이 필요합니다</h1>
            <Button onClick={() => setShowLoginModal(true)}>로그인</Button>
          </div>
        </div>
        <Footer />
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            navigate('/');
          }}
          onSuccess={() => {
            setIsAuthenticated(true);
            loadHosts();
            loadReservations();
            loadPromotions();
            loadTips();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wedding-800 mb-2">관리자 페이지</h1>
          <p className="text-wedding-600">웨딩 정보를 관리하고 등록할 수 있습니다.</p>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              예약 문의 관리
            </TabsTrigger>
            <TabsTrigger value="hosts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              사회자 관리
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              프로모션 관리
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              인사&TIP 관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="space-y-6">
            <Card className="card-wedding">
              <CardHeader>
                <CardTitle>예약 문의 관리</CardTitle>
                <CardDescription>
                  접수된 예약 문의를 확인하고 관리합니다.
                </CardDescription>
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="예약 문의 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">번호</TableHead>
                      <TableHead className="w-48">제목</TableHead>
                      <TableHead className="w-24 text-center">작성자</TableHead>
                      <TableHead className="w-24 text-center">사회자</TableHead>
                      <TableHead className="w-28 text-center">작성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation, index) => (
                      <TableRow 
                        key={reservation.id} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {reservation.title}
                            {reservation.status === 'confirmed' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                확정
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{reservation.bride || '작성자 없음'}</TableCell>
                        <TableCell className="text-center">
                          {hosts.find(h => h.id === reservation.hostId)?.name || '미지정'}
                        </TableCell>
                        <TableCell className="text-center">{formatDate(reservation.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* 예약 상세 정보 모달 */}
                <Dialog 
                  open={!!selectedReservation} 
                  onOpenChange={(open) => !open && setSelectedReservation(null)}
                >
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="relative">
                      <DialogTitle>예약 상세 정보</DialogTitle>
                      <DialogDescription>
                        예약 정보를 확인하고 수정할 수 있습니다.
                      </DialogDescription>
                      {/* 예약 상태를 오른쪽 상단에 배치 */}
                      {selectedReservation && (
                        <div className="absolute top-0 right-0">
                          <Label htmlFor="edit-status" className="text-xs">예약 상태</Label>
                          <Select 
                            value={selectedReservation.status} 
                            onValueChange={(value) => setSelectedReservation(prev => prev ? {...prev, status: value as Reservation['status']} : null)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">문의</SelectItem>
                              <SelectItem value="confirmed">확정</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </DialogHeader>
                    
                    {selectedReservation && (
                      <div className="grid gap-2 py-4">
                        <div>
                          <Label htmlFor="edit-title" className="text-xs">제목 *</Label>
                          <Input
                            id="edit-title"
                            value={selectedReservation.title}
                            onChange={(e) => setSelectedReservation(prev => prev ? {...prev, title: e.target.value} : null)}
                            placeholder="예약 제목"
                            className="h-8"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="edit-author" className="text-xs">작성자 *</Label>
                            <Input
                              id="edit-author"
                              value={selectedReservation.bride}
                              onChange={(e) => setSelectedReservation(prev => prev ? {...prev, bride: e.target.value} : null)}
                              placeholder="작성자 이름"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-spouse" className="text-xs">배우자 *</Label>
                            <Input
                              id="edit-spouse"
                              value={selectedReservation.groom}
                              onChange={(e) => setSelectedReservation(prev => prev ? {...prev, groom: e.target.value} : null)}
                              placeholder="배우자 이름"
                              className="h-8"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-contact" className="text-xs">연락처 *</Label>
                          <Input
                            id="edit-contact"
                            value={selectedReservation.contact}
                            onChange={(e) => setSelectedReservation(prev => prev ? {...prev, contact: e.target.value} : null)}
                            placeholder="010-1234-5678"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-host" className="text-xs">사회자 *</Label>
                          <Select 
                            value={selectedReservation.hostId} 
                            onValueChange={(value) => setSelectedReservation(prev => prev ? {...prev, hostId: value} : null)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="사회자 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {hosts.map((host) => (
                                <SelectItem key={host.id} value={host.id}>
                                  {host.name} ({host.region})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="edit-venue" className="text-xs">웨딩홀명 *</Label>
                            <Input
                              id="edit-venue"
                              value={selectedReservation.venue}
                              onChange={(e) => setSelectedReservation(prev => prev ? {...prev, venue: e.target.value} : null)}
                              placeholder="강남웨딩홀"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-ceremony-type" className="text-xs">예식종류 *</Label>
                            <Select 
                              value={selectedReservation.ceremonyType || ''} 
                              onValueChange={(value) => setSelectedReservation(prev => prev ? {...prev, ceremonyType: value} : null)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="주례있음">주례 있음</SelectItem>
                                <SelectItem value="주례없음">주례 없음</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="edit-second-party" className="text-xs">2부 진행 여부 *</Label>
                            <Select 
                              value={selectedReservation.secondParty || ''} 
                              onValueChange={(value) => setSelectedReservation(prev => prev ? {...prev, secondParty: value} : null)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="있음">있음</SelectItem>
                                <SelectItem value="없음">없음</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-ceremony-date" className="text-xs">예식날짜 *</Label>
                            <Input
                              id="edit-ceremony-date"
                              type="date"
                              value={selectedReservation.ceremonyDate}
                              onChange={(e) => setSelectedReservation(prev => prev ? {...prev, ceremonyDate: e.target.value} : null)}
                              className="h-8"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-ceremony-time" className="text-xs">예식시간 *</Label>
                          <Input
                            id="edit-ceremony-time"
                            value={selectedReservation.ceremonyTime}
                            onChange={(e) => setSelectedReservation(prev => prev ? {...prev, ceremonyTime: e.target.value} : null)}
                            placeholder="예: 오후 1시, 14:00 등"
                            className="h-8"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-referral" className="text-xs">처음 접한 경로 *</Label>
                          <Select 
                            value={selectedReservation.referralSource} 
                            onValueChange={(value) => setSelectedReservation(prev => prev ? {...prev, referralSource: value} : null)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google-search">구글 검색</SelectItem>
                              <SelectItem value="naver-search">네이버 검색</SelectItem>
                              <SelectItem value="blog">블로그</SelectItem>
                              <SelectItem value="friend">지인 추천</SelectItem>
                              <SelectItem value="previous-customer">기존 고객</SelectItem>
                              <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* 추가 입력 필드 */}
                        {selectedReservation.additionalInput && (
                          <div>
                            <Label htmlFor="edit-additional" className="text-xs">
                              {(() => {
                                const referralSource = selectedReservation.referralSource;
                                if (referralSource === "google-search" || referralSource === "naver-search") {
                                  return "검색어";
                                } else if (referralSource === "blog") {
                                  return "블로그 주소";
                                } else if (referralSource === "friend" || referralSource === "previous-customer") {
                                  return "업체명";
                                } else {
                                  return "추가 정보";
                                }
                              })()}
                            </Label>
                            <Input
                              id="edit-additional"
                              value={selectedReservation.additionalInput || ''}
                              onChange={(e) => setSelectedReservation(prev => prev ? {...prev, additionalInput: e.target.value} : null)}
                              className="h-8"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="edit-notes" className="text-xs">기타 문의 사항</Label>
                          <Textarea
                            id="edit-notes"
                            value={selectedReservation.notes}
                            onChange={(e) => setSelectedReservation(prev => prev ? {...prev, notes: e.target.value} : null)}
                            className="min-h-[50px]"
                            placeholder="기타 문의사항을 작성하세요"
                          />
                        </div>
                        
                        {/* 관리 버튼들 */}
                        <div className="grid grid-cols-5 gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => copyToClipboard(generateDBContent(selectedReservation))}
                          >
                            DB 내용
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => copyToClipboard(generateAvailableMessage(selectedReservation))}
                          >
                            가능 문구
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => copyToClipboard(generateConfirmedMessage(selectedReservation))}
                          >
                            확정 문구
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => copyToClipboard(generateRejectedMessage(selectedReservation))}
                          >
                            거절 문구
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => copyToClipboard(generateCostGuide(selectedReservation))}
                          >
                            비용 안내
                          </Button>
                        </div>
                        
                        <div className="flex justify-between gap-2 pt-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (confirm('정말 삭제하시겠습니까?')) {
                                deleteReservation(selectedReservation.id);
                                setSelectedReservation(null);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </Button>
                          <Button size="sm" onClick={updateReservation}>수정 저장</Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosts" className="space-y-6">
            <Card className="card-wedding">
              <CardHeader>
                <CardTitle>사회자 관리</CardTitle>
                <CardDescription>
                  등록된 사회자 목록을 확인하고 새로운 사회자를 추가합니다.
                </CardDescription>
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        사회자 등록
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>사회자 등록</DialogTitle>
                        <DialogDescription>
                          새로운 사회자 정보를 등록합니다.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="host-name">이름</Label>
                            <Input
                              id="host-name"
                              value={newHost.name}
                              onChange={(e) => setNewHost(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="이름"
                            />
                          </div>
                          <div>
                            <Label htmlFor="host-region">지역</Label>
                            <Select 
                              value={newHost.region} 
                              onValueChange={(value) => setNewHost(prev => ({ ...prev, region: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="지역을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border shadow-lg z-50">
                                <SelectItem value="서울/경기">서울/경기</SelectItem>
                                <SelectItem value="광주/전남">광주/전남</SelectItem>
                                <SelectItem value="대전">대전</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="host-photo">프로필 사진</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {newHost.photoPath && (
                              <div className="mb-4">
                                <img 
                                  src={newHost.photoPath} 
                                  alt="프로필 미리보기" 
                                  className="w-20 h-20 object-cover rounded-full mx-auto"
                                />
                              </div>
                            )}
                            <Input
                              id="host-photo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  const img = new Image();
                                  
                                  img.onload = () => {
                                    canvas.width = 466;
                                    canvas.height = 574;
                                    ctx?.drawImage(img, 0, 0, 466, 574);
                                    const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                    setNewHost(prev => ({ ...prev, photoPath: resizedDataUrl }));
                                  };
                                  
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    img.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('host-photo')?.click()}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="host-color">프로필색상</Label>
                          <div className="grid grid-cols-10 gap-2 mt-2">
                            {[
                              '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
                              '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
                              '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
                              '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
                              '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
                              '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
                            ].map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${newHost.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setNewHost(prev => ({ ...prev, color }))}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>소개</Label>
                          <div className="border rounded-md bg-white">
                            {/* 텍스트 에디터 툴바 */}
                            <div className="border-b p-2 flex items-center gap-2 bg-gray-50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('bold');
                                }}
                              >
                                <strong>B</strong>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('italic');
                                }}
                              >
                                <em>I</em>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('underline');
                                }}
                              >
                                <u>U</u>
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyLeft');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyCenter');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyRight');
                                }}
                              >
                                ≡
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              
                              {/* 이미지 업로드 */}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="new-host-image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      document.execCommand('insertHTML', false, `<div style="text-align: center;"><img src="${imageUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.getElementById('new-host-image-upload')?.click();
                                }}
                              >
                                📷
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  const url = prompt('유튜브 링크를 입력하세요:');
                                  if (url) {
                                    const embedUrl = url.replace('watch?v=', 'embed/');
                                    document.execCommand('insertHTML', false, `<iframe width="300" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`);
                                  }
                                }}
                              >
                                📺
                              </Button>
                              
                              {/* 폰트 크기 선택 */}
                              <select 
                                className="ml-2 text-sm border rounded px-2 py-1"
                                onChange={(e) => {
                                  document.execCommand('fontSize', false, e.target.value);
                                }}
                              >
                                <option value="">폰트 크기</option>
                                <option value="1">10px</option>
                                <option value="2">12px</option>
                                <option value="3">14px</option>
                                <option value="4">16px</option>
                                <option value="5">18px</option>
                                <option value="6">20px</option>
                                <option value="7">24px</option>
                              </select>
                            </div>
                            
                            {/* 에디터 영역 - 커서 문제 해결 */}
                            <div
                              ref={(el) => {
                                if (el && newHost.biography.length === 1 && newHost.biography[0] === '') {
                                  el.innerHTML = '<span style="color: #9ca3af;">사회자 소개 및 약력을 입력하세요...</span>';
                                }
                              }}
                              contentEditable
                              className="min-h-[200px] p-3 focus:outline-none"
                              onBlur={(e) => {
                                const content = e.currentTarget.innerHTML;
                                const biographyArray = content.split('<br><br>').filter(item => item.trim() !== '');
                                setNewHost(prev => ({ ...prev, biography: biographyArray.length > 0 ? biographyArray : [''] }));
                              }}
                              onFocus={(e) => {
                                // placeholder 텍스트 제거
                                if (e.currentTarget.innerHTML.includes('사회자 소개 및 약력을 입력하세요...')) {
                                  e.currentTarget.innerHTML = '';
                                }
                              }}
                              suppressContentEditableWarning={true}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <DialogTrigger asChild>
                            <Button variant="outline">취소</Button>
                          </DialogTrigger>
                          <Button onClick={saveHost}>사회자 등록</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사진</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hosts.map((host) => (
                      <TableRow 
                        key={host.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedHost(host)}
                      >
                        <TableCell>
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br shadow-sm"
                            style={{ backgroundColor: host.color }}
                          >
                            {host.photoPath ? (
                              <img 
                                src={host.photoPath} 
                                alt={host.name} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                                {host.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{host.name}</TableCell>
                        <TableCell>{host.region}</TableCell>
                        <TableCell>2024-01-01</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 사회자 수정 모달 */}
                <Dialog 
                  open={!!selectedHost} 
                  onOpenChange={(open) => !open && setSelectedHost(null)}
                >
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>사회자 정보 수정</DialogTitle>
                      <DialogDescription>
                        사회자 정보를 수정합니다.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedHost && (
                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-host-name">이름</Label>
                            <Input
                              id="edit-host-name"
                              value={selectedHost.name}
                              onChange={(e) => setSelectedHost(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                              placeholder="이름"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-host-region">지역</Label>
                            <Select 
                              value={selectedHost.region} 
                              onValueChange={(value) => setSelectedHost(prev => prev ? ({ ...prev, region: value }) : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="지역을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border shadow-lg z-50">
                                <SelectItem value="서울/경기">서울/경기</SelectItem>
                                <SelectItem value="광주/전남">광주/전남</SelectItem>
                                <SelectItem value="대전">대전</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-host-photo">프로필 사진</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {selectedHost.photoPath && (
                              <img 
                                src={selectedHost.photoPath} 
                                alt="preview" 
                                className="mx-auto mb-4 w-20 h-20 rounded-full object-cover" 
                              />
                            )}
                            <Input
                              id="edit-host-photo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedHost(prev => prev ? ({ ...prev, photoPath: URL.createObjectURL(file) }) : null);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('edit-host-photo')?.click()}
                            >
                              Upload
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-host-color">프로필색상</Label>
                          <div className="grid grid-cols-10 gap-2 mt-2">
                            {[
                              '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
                              '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
                              '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
                              '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
                              '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
                              '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
                            ].map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${selectedHost.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedHost(prev => prev ? ({ ...prev, color }) : null)}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label>소개</Label>
                          <div className="border rounded-md bg-white">
                            {/* 텍스트 에디터 툴바 */}
                            <div className="border-b p-2 flex items-center gap-2 bg-gray-50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('bold');
                                }}
                              >
                                <strong>B</strong>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('italic');
                                }}
                              >
                                <em>I</em>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('underline');
                                }}
                              >
                                <u>U</u>
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyLeft');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyCenter');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyRight');
                                }}
                              >
                                ≡
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              
                              {/* 이미지 업로드 */}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="edit-host-image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      document.execCommand('insertHTML', false, `<div style="text-align: center;"><img src="${imageUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.getElementById('edit-host-image-upload')?.click();
                                }}
                              >
                                📷
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  const url = prompt('유튜브 링크를 입력하세요:');
                                  if (url) {
                                    const embedUrl = url.replace('watch?v=', 'embed/');
                                    document.execCommand('insertHTML', false, `<iframe width="300" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`);
                                  }
                                }}
                              >
                                📺
                              </Button>
                              
                              {/* 폰트 크기 선택 */}
                              <select 
                                className="ml-2 text-sm border rounded px-2 py-1"
                                onChange={(e) => {
                                  document.execCommand('fontSize', false, e.target.value);
                                }}
                              >
                                <option value="">폰트 크기</option>
                                <option value="1">10px</option>
                                <option value="2">12px</option>
                                <option value="3">14px</option>
                                <option value="4">16px</option>
                                <option value="5">18px</option>
                                <option value="6">20px</option>
                                <option value="7">24px</option>
                              </select>
                            </div>
                            
                            {/* 에디터 영역 */}
                            <div
                              ref={(el) => {
                                if (el && selectedHost) {
                                  el.innerHTML = selectedHost.biography.join('<br><br>');
                                }
                              }}
                              contentEditable
                              className="min-h-[120px] p-3 focus:outline-none"
                              onBlur={(e) => {
                                const content = e.currentTarget.innerHTML;
                                const biography = content.split('<br><br>').filter(bio => bio.trim() !== '');
                                setSelectedHost(prev => prev ? ({ ...prev, biography }) : null);
                              }}
                              suppressContentEditableWarning={true}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              if (confirm('정말 삭제하시겠습니까?')) {
                                const updatedHosts = hosts.filter(h => h.id !== selectedHost.id);
                                setHosts(updatedHosts);
                                localStorage.setItem('hosts', JSON.stringify(updatedHosts));
                                setSelectedHost(null);
                                toast.success("사회자가 삭제되었습니다.");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </Button>
                          <Button onClick={updateHost}>수정 저장</Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-6">
            <Card className="card-wedding">
              <CardHeader>
                <CardTitle>프로모션 관리</CardTitle>
                <CardDescription>
                  등록된 프로모션 목록을 확인하고 관리합니다.
                </CardDescription>
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        프로모션 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>프로모션 추가</DialogTitle>
                        <DialogDescription>
                          새로운 프로모션 정보를 등록합니다.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-6 py-4">
                        <div>
                          <Label htmlFor="promotion-title">프로모션 제목</Label>
                          <Input
                            id="promotion-title"
                            value={newPromotion.title}
                            onChange={(e) => setNewPromotion(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="프로모션 제목을 입력하세요"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="promotion-content">프로모션 내용</Label>
                          <div className="border rounded-md bg-white">
                            {/* 텍스트 에디터 툴바 */}
                            <div className="border-b p-2 flex items-center gap-2 bg-gray-50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('bold');
                                }}
                              >
                                <strong>B</strong>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('italic');
                                }}
                              >
                                <em>I</em>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('underline');
                                }}
                              >
                                <u>U</u>
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyLeft');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyCenter');
                                }}
                              >
                                ≡
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.execCommand('justifyRight');
                                }}
                              >
                                ≡
                              </Button>
                              <div className="w-px h-6 bg-gray-300 mx-1" />
                              
                              {/* 이미지 업로드 */}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="promotion-image-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      document.execCommand('insertHTML', false, `<div style="text-align: center;"><img src="${imageUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  document.getElementById('promotion-image-upload')?.click();
                                }}
                              >
                                📷
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => {
                                  const url = prompt('유튜브 링크를 입력하세요:');
                                  if (url) {
                                    const embedUrl = url.replace('watch?v=', 'embed/');
                                    document.execCommand('insertHTML', false, `<div style="text-align: center;"><iframe width="300" height="200" src="${embedUrl}" frameborder="0" allowfullscreen style="margin: 0 auto; display: block;"></iframe></div>`);
                                  }
                                }}
                              >
                                📺
                              </Button>
                              
                              {/* 폰트 크기 선택 */}
                              <select 
                                className="ml-2 text-sm border rounded px-2 py-1"
                                onChange={(e) => {
                                  document.execCommand('fontSize', false, e.target.value);
                                }}
                              >
                                <option value="">폰트 크기</option>
                                <option value="1">10px</option>
                                <option value="2">12px</option>
                                <option value="3">14px</option>
                                <option value="4">16px</option>
                                <option value="5">18px</option>
                                <option value="6">20px</option>
                                <option value="7">24px</option>
                              </select>
                            </div>
                            
                            {/* 에디터 영역 */}
                            <div
                              ref={(el) => {
                                if (el && newPromotion.content === '') {
                                  el.innerHTML = '<span style="color: #9ca3af;">프로모션 내용을 입력하세요...</span>';
                                }
                              }}
                              contentEditable
                              className="min-h-[120px] p-3 focus:outline-none"
                              onBlur={(e) => {
                                const content = e.currentTarget.innerHTML;
                                // placeholder 제거
                                const cleanContent = content.includes('프로모션 내용을 입력하세요...') ? '' : content;
                                setNewPromotion(prev => ({ ...prev, content: cleanContent }));
                              }}
                              onFocus={(e) => {
                                // placeholder 텍스트 제거
                                if (e.currentTarget.innerHTML.includes('프로모션 내용을 입력하세요...')) {
                                  e.currentTarget.innerHTML = '';
                                }
                              }}
                              suppressContentEditableWarning={true}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <DialogTrigger asChild>
                            <Button variant="outline">취소</Button>
                          </DialogTrigger>
                          <Button onClick={savePromotion}>프로모션 추가</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {promotions.map((promotion) => (
                    <Dialog key={promotion.id}>
                      <DialogTrigger asChild>
                        <Card 
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedPromotion(promotion)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{promotion.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {promotion.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePromotion(promotion.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>프로모션 수정</DialogTitle>
                          <DialogDescription>
                            프로모션 정보를 수정합니다.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPromotion && (
                          <div className="grid gap-6 py-4">
                            <div>
                              <Label htmlFor="edit-promotion-title">프로모션 제목</Label>
                              <Input
                                id="edit-promotion-title"
                                value={selectedPromotion.title}
                                onChange={(e) => setSelectedPromotion(prev => prev ? {...prev, title: e.target.value} : null)}
                                placeholder="프로모션 제목을 입력하세요"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="edit-promotion-content">프로모션 내용</Label>
                              <div className="border rounded-md bg-white">
                                {/* 텍스트 에디터 툴바 */}
                                <div className="border-b p-2 flex items-center gap-2 bg-gray-50">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('bold');
                                    }}
                                  >
                                    <strong>B</strong>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('italic');
                                    }}
                                  >
                                    <em>I</em>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('underline');
                                    }}
                                  >
                                    <u>U</u>
                                  </Button>
                                  <div className="w-px h-6 bg-gray-300 mx-1" />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('justifyLeft');
                                    }}
                                  >
                                    ≡
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('justifyCenter');
                                    }}
                                  >
                                    ≡
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.execCommand('justifyRight');
                                    }}
                                  >
                                    ≡
                                  </Button>
                                  <div className="w-px h-6 bg-gray-300 mx-1" />
                                  
                                  {/* 이미지 업로드 */}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="edit-promotion-image-upload"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const imageUrl = event.target?.result as string;
                                          document.execCommand('insertHTML', false, `<div style="text-align: center;"><img src="${imageUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      document.getElementById('edit-promotion-image-upload')?.click();
                                    }}
                                  >
                                    📷
                                  </Button>
                                  
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      const url = prompt('유튜브 링크를 입력하세요:');
                                      if (url) {
                                        const embedUrl = url.replace('watch?v=', 'embed/');
                                        document.execCommand('insertHTML', false, `<iframe width="300" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`);
                                      }
                                    }}
                                  >
                                    📺
                                  </Button>
                                  
                                  {/* 폰트 크기 선택 */}
                                  <select 
                                    className="ml-2 text-sm border rounded px-2 py-1"
                                    onChange={(e) => {
                                      document.execCommand('fontSize', false, e.target.value);
                                    }}
                                  >
                                    <option value="">폰트 크기</option>
                                    <option value="1">10px</option>
                                    <option value="2">12px</option>
                                    <option value="3">14px</option>
                                    <option value="4">16px</option>
                                    <option value="5">18px</option>
                                    <option value="6">20px</option>
                                    <option value="7">24px</option>
                                  </select>
                                </div>
                                
                                {/* 에디터 영역 */}
                                <div
                                  ref={(el) => {
                                    if (el && selectedPromotion) {
                                      el.innerHTML = selectedPromotion.content;
                                    }
                                  }}
                                  contentEditable
                                  className="min-h-[120px] p-3 focus:outline-none"
                                  onBlur={(e) => {
                                    const content = e.currentTarget.innerHTML;
                                    setSelectedPromotion(prev => prev ? {...prev, content} : null);
                                  }}
                                  suppressContentEditableWarning={true}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-4">
                              <DialogTrigger asChild>
                                <Button variant="outline">취소</Button>
                              </DialogTrigger>
                              <Button onClick={updatePromotion}>수정 저장</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                  {promotions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      등록된 프로모션이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card className="card-wedding">
              <CardHeader>
                <CardTitle>인사&TIP 관리</CardTitle>
                <CardDescription>
                  인사말과 TIP 게시글을 등록하고 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tip-category">카테고리</Label>
                      <Select value={newTip.category} onValueChange={(value) => setNewTip(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="인사말">인사말</SelectItem>
                          <SelectItem value="웨딩팁">웨딩팁</SelectItem>
                          <SelectItem value="사회자가이드">사회자가이드</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tip-author">작성자</Label>
                      <Input
                        id="tip-author"
                        value={newTip.author}
                        onChange={(e) => setNewTip(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="작성자명"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tip-title">제목</Label>
                    <Input
                      id="tip-title"
                      value={newTip.title}
                      onChange={(e) => setNewTip(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="TIP 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tip-content">내용</Label>
                    <Textarea
                      id="tip-content"
                      value={newTip.content}
                      onChange={(e) => setNewTip(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="내용을 입력하세요"
                      className="min-h-[200px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tip-tags">태그</Label>
                    <Input
                      id="tip-tags"
                      value={newTip.tags}
                      onChange={(e) => setNewTip(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="태그를 쉼표로 구분하여 입력하세요"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>TIP 등록</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;