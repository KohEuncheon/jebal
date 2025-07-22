import { useState, useEffect } from "react";
import { Calendar, Clock, User, Building, Heart, Phone, Mail, MessageSquare, CalendarIcon, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// 예약 상세 정보 수정 컴포넌트는 관리자 페이지에서만 접근 가능하도록 제거

// 예약 문의 목록 컴포넌트 (게시판 형태)
const ReservationsList = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  // 예약 상세 정보 모달 제거 - 관리자 페이지에서만 접근 가능

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
    }
  };

  // 예약 수정 기능 제거 - 관리자 페이지에서만 접근 가능

  if (reservations.length === 0) {
    return (
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">예약 문의 목록</h3>
        <div className="text-center text-gray-500 py-8">
          현재 등록된 문의가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-center">예약 문의 목록</h3>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
              <th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">작성자</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">날짜</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation, index) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="pl-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {String(reservations.length - index).padStart(3, '0')}
                </td>
                <td className="pl-8 py-4 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{reservation.title}</span>
                    {reservation.status === 'confirmed' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        확정
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {reservation.bride || '작성자 없음'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {new Date(reservation.created_at).toLocaleDateString('ko-KR').slice(2)} {/* YY-MM-DD 형태 */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 예약 상세 정보 모달 */}
      {/* 예약 상세 모달 제거 - 관리자 페이지에서만 접근 가능 */}
    </div>
  );
};

const Booking = () => {
  const [formData, setFormData] = useState({
    title: "",
    password: "",
    author: "",
    spouse: "",
    phone: "",
    host: "",
    venue: "",
    ceremonyType: "",
    secondPart: "",
    weddingDate: null as Date | null,
    weddingTime: "",
    howDidYouFind: "",
    additionalInput: "", // 추가 입력 필드 (링크, 검색어, 업체명)
    additionalNotes: ""
  });

  // Supabase에서 사회자 데이터 불러오기
  const [adminHosts, setAdminHosts] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setAdminHosts(data || []);
    } catch (error) {
      console.error('사회자 목록 로드 실패:', error);
    }
  };
  
  // 관리자가 등록한 사회자들만 사용 (기본 사회자 제거)
  const hosts = adminHosts.map(host => ({
    id: host.id,
    name: `${host.name} 사회자`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weddingDate) {
      toast({
        title: "오류",
        description: "예식날짜를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Supabase에 예약 문의 저장
      const reservation = {
        title: formData.title,
        bride: formData.author,
        groom: formData.spouse,
        contact: formData.phone,
        host_id: formData.host || null,
        venue: formData.venue,
        ceremony_type: formData.ceremonyType === "with-officiant" ? "주례있음" : "주례없음",
        second_party: formData.secondPart === "yes" ? "있음" : "없음",
        ceremony_date: format(formData.weddingDate, "yyyy-MM-dd"),
        ceremony_time: formData.weddingTime,
        referral_source: formData.howDidYouFind,
        additional_input: formData.additionalInput,
        notes: formData.additionalNotes,
        password: formData.password
      };

      const { error } = await supabase
        .from('reservations')
        .insert([reservation]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "예약 문의가 성공적으로 제출되었습니다!",
      });
      
      // 폼 데이터 초기화
      setFormData({
        title: "",
        password: "",
        author: "",
        spouse: "",
        phone: "",
        host: "",
        venue: "",
        ceremonyType: "",
        secondPart: "",
        weddingDate: null,
        weddingTime: "",
        howDidYouFind: "",
        additionalInput: "",
        additionalNotes: ""
      });
    } catch (error) {
      console.error('예약 문의 제출 실패:', error);
      toast({
        title: "오류",
        description: "예약 문의 제출에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 처음 접한 경로에 따른 추가 입력 필드 표시 여부와 라벨
  const getAdditionalInputInfo = () => {
    switch (formData.howDidYouFind) {
      case "naver-cafe-maekmawe":
        return { show: true, label: "네이버 카페 - 멕마웨", placeholder: "카페 링크나 글 제목을 입력하세요 (선택)", type: "text" };
      case "naver-cafe-gwangju":
        return { show: true, label: "네이버 카페 - 광주결", placeholder: "카페 링크나 글 제목을 입력하세요 (선택)", type: "text" };
      case "naver-cafe-diet":
        return { show: true, label: "네이버 카페 - 다이어트 카페", placeholder: "카페 링크나 글 제목을 입력하세요 (선택)", type: "text" };
      case "naver-blog":
        return { show: true, label: "네이버 블로그", placeholder: "네이버 블로그 주소를 입력하세요 (선택)", type: "url" };
      case "naver-search":
        return { show: true, label: "네이버 검색", placeholder: "검색어를 입력하세요 (선택)", type: "text" };
      case "google-search":
        return { show: true, label: "구글 검색", placeholder: "검색어를 입력하세요 (선택)", type: "text" };
      case "youtube":
        return { show: true, label: "유튜브", placeholder: "유튜브 링크를 입력하세요 (선택)", type: "url" };
      case "instagram":
        return { show: true, label: "인스타그램", placeholder: "인스타그램 링크를 입력하세요 (선택)", type: "url" };
      case "wedding-planner":
        return { show: true, label: "웨딩홀 및 플래너 소개", placeholder: "업체명을 입력하세요 (선택)", type: "text" };
      case "other-site":
        return { show: true, label: "그 외 사이트", placeholder: "사이트 주소를 입력하세요 (선택)", type: "url" };
      default:
        return { show: false, label: "", placeholder: "", type: "text" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-muted-foreground">
          <span>HOME</span> <span className="mx-2">&gt;</span> <span>예약문의</span>
        </p>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              예약문의
            </h1>
            <p className="text-muted-foreground">
              문의 전, 예약 확인 담당을 통해 늘봄 사회자들의 진행 가능 여부를 확인해주세요
            </p>
          </div>

          <Card className="card-wedding p-8 shadow-lg bg-white/90 backdrop-blur-sm border-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-lg pointer-events-none"></div>
            <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 2열 레이아웃 폼 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 제목 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="title" className="text-sm font-medium w-20 pt-2 flex-shrink-0">제목 *</Label>
                  <Input
                    id="title"
                    className="form-wedding flex-1"
                    placeholder="예약 문의합니다"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                
                {/* 비밀번호 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="password" className="text-sm font-medium w-20 pt-2 flex-shrink-0">비밀번호 *</Label>
                  <Input
                    id="password"
                    type="password"
                    className="form-wedding flex-1"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                
                {/* 작성자 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="author" className="text-sm font-medium w-20 pt-2 flex-shrink-0">작성자 *</Label>
                  <Input
                    id="author"
                    className="form-wedding flex-1"
                    placeholder="홍길동"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    required
                  />
                </div>
                
                {/* 배우자 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="spouse" className="text-sm font-medium w-20 pt-2 flex-shrink-0">배우자 *</Label>
                  <Input
                    id="spouse"
                    className="form-wedding flex-1"
                    placeholder="홍길순"
                    value={formData.spouse}
                    onChange={(e) => handleInputChange("spouse", e.target.value)}
                    required
                  />
                </div>
                
                {/* 연락처 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="phone" className="text-sm font-medium w-20 pt-2 flex-shrink-0">연락처 *</Label>
                  <Input
                    id="phone"
                    className="form-wedding flex-1"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", formatPhoneNumber(e.target.value))}
                    required
                  />
                </div>
                
                {/* 사회자 선택 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="host" className="text-sm font-medium w-20 pt-2 flex-shrink-0">사회자 *</Label>
                  <Select value={formData.host} onValueChange={(value) => handleInputChange("host", value)}>
                    <SelectTrigger className="form-wedding flex-1">
                      <SelectValue placeholder={hosts.length > 0 ? "사회자 선택" : "등록된 사회자가 없습니다"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {hosts.length > 0 ? (
                        hosts.map((host) => (
                          <SelectItem key={host.id} value={host.id}>
                            {host.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-hosts" disabled>
                          등록된 사회자가 없습니다
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 웨딩홀명 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="venue" className="text-sm font-medium w-20 pt-2 flex-shrink-0">웨딩홀명 *</Label>
                  <Input
                    id="venue"
                    className="form-wedding flex-1"
                    placeholder="강남웨딩홀"
                    value={formData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    required
                  />
                </div>
                
                {/* 예식종류 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="ceremonyType" className="text-sm font-medium w-20 pt-2 flex-shrink-0">예식종류 *</Label>
                  <Select value={formData.ceremonyType} onValueChange={(value) => handleInputChange("ceremonyType", value)}>
                    <SelectTrigger className="form-wedding flex-1">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="with-officiant">주례 있음</SelectItem>
                      <SelectItem value="without-officiant">주례 없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 2부 진행 여부 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="secondPart" className="text-sm font-medium w-20 pt-2 flex-shrink-0">2부 진행<br />여부 *</Label>
                  <Select value={formData.secondPart} onValueChange={(value) => handleInputChange("secondPart", value)}>
                    <SelectTrigger className="form-wedding flex-1">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">있음</SelectItem>
                      <SelectItem value="no">없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 예식날짜 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="weddingDate" className="text-sm font-medium w-20 pt-2 flex-shrink-0">예식날짜 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "form-wedding flex-1 justify-start text-left font-normal",
                          !formData.weddingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.weddingDate ? (
                          format(formData.weddingDate, "yyyy년 MM월 dd일", { locale: ko })
                        ) : (
                          <span>날짜를 선택하세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.weddingDate || undefined}
                        onSelect={(date) => handleInputChange("weddingDate", date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* 예식시간 */}
                <div className="flex items-start space-x-4">
                  <Label htmlFor="weddingTime" className="text-sm font-medium w-20 pt-2 flex-shrink-0">예식시간 *</Label>
                  <Input
                    id="weddingTime"
                    className="form-wedding flex-1"
                    placeholder="예: 오후 1시, 14:00 등"
                    value={formData.weddingTime}
                    onChange={(e) => handleInputChange("weddingTime", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* 처음 접한 경로 */}
              <div className="flex items-start space-x-4">
                <Label htmlFor="howDidYouFind" className="text-sm font-medium w-20 pt-2 flex-shrink-0">처음 접한<br />경로 *</Label>
                <div className="flex-1 space-y-4">
                  <Select value={formData.howDidYouFind} onValueChange={(value) => {
                    handleInputChange("howDidYouFind", value);
                    handleInputChange("additionalInput", ""); // 추가 입력 필드 초기화
                  }}>
                    <SelectTrigger className="form-wedding">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="friend-referral">지인 소개</SelectItem>
                      <SelectItem value="naver-cafe-maekmawe">네이버 카페 - 멕마웨</SelectItem>
                      <SelectItem value="naver-cafe-gwangju">네이버 카페 - 광주결</SelectItem>
                      <SelectItem value="naver-cafe-diet">네이버 카페 - 다이어트 카페</SelectItem>
                      <SelectItem value="naver-blog">네이버 블로그</SelectItem>
                      <SelectItem value="naver-search">네이버 검색</SelectItem>
                      <SelectItem value="google-search">구글 검색</SelectItem>
                      <SelectItem value="instagram">인스타그램</SelectItem>
                      <SelectItem value="youtube">유튜브</SelectItem>
                      <SelectItem value="wedding-planner">웨딩홀 및 플래너 소개</SelectItem>
                      <SelectItem value="other-site">그 외 사이트</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* 추가 입력 필드 */}
                  {(() => {
                    const additionalInfo = getAdditionalInputInfo();
                    return additionalInfo.show && (
                      <Input
                        className="form-wedding"
                        type={additionalInfo.type}
                        placeholder={additionalInfo.placeholder}
                        value={formData.additionalInput}
                        onChange={(e) => handleInputChange("additionalInput", e.target.value)}
                      />
                    );
                  })()}
                </div>
              </div>
              
              <div className="text-sm text-sky-500 pl-24 -mt-2">
                처음 접한 경로를 적으신 분들 중에서 1달마다 세 분을 추첨하여 2만원 할인 쿠폰을 드립니다.
              </div>
              
              {/* 기타 문의 사항 */}
              <div className="space-y-2">
                <Label htmlFor="additionalNotes" className="text-sm font-medium">기타 문의 사항</Label>
                <Textarea
                  id="additionalNotes"
                  className="form-wedding min-h-[120px]"
                  placeholder="기타 문의사항을 적어주세요"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                />
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-center pt-6">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white px-16 py-3 text-lg rounded-lg">
                  문의하기
                </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* 예약 문의 현황 */}
          <ReservationsList />

          {/* 연락처 섹션 */}
          <div className="mt-12 mb-8">
            <div className="flex justify-center space-x-8">
              <a 
                href="tel:010-0000-0000" 
                className="flex flex-col items-center space-y-2 hover:text-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm">전화상담</span>
              </a>
              
              <a 
                href="#" 
                className="flex flex-col items-center space-y-2 hover:text-primary transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-sm">인스타그램</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;