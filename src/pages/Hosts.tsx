import { useState, useEffect } from "react";
import { Star, Award, Clock, Heart, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Host {
  id: string;
  name: string;
  image: string;
  experience?: string;
  specialty?: string[];
  rating?: number;
  reviews?: number;
  description?: string;
  career?: string[];
  price?: string;
  region?: string;
  photoPath?: string;
  biography?: string[];
  color?: string;
}

const Hosts = () => {
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("서울/경기");
  const [adminHosts, setAdminHosts] = useState<Host[]>([]);

  // localStorage에서 관리자가 추가한 사회자 데이터 불러오기
  useEffect(() => {
    const savedHosts = localStorage.getItem('hosts');
    console.log('Raw saved hosts data:', savedHosts);
    if (savedHosts) {
      const parsedHosts = JSON.parse(savedHosts);
      console.log('Parsed hosts data:', parsedHosts);
      setAdminHosts(parsedHosts);
    }
  }, []);

  // 지역별 탭 목록 - 고정된 3개 지역
  const regions = ["서울/경기", "광주/전남", "대전"];

  // 현재 선택된 지역의 사회자들만 표시
  const currentHosts = adminHosts.filter(host => host.region === selectedRegion);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            사회자 소개
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            사회자 사진을 클릭하시면 약력/진행 영상/비용 등을 확인하실 수 있습니다. (가나다 순)
          </p>
        </div>

        {/* Region Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-secondary/30 rounded-lg p-1">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Hosts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentHosts.map((host, index) => (
            <Card 
              key={host.id} 
              className="card-wedding hover-lift group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedHost({
                id: host.id,
                name: host.name,
                image: host.photoPath || "/api/placeholder/300/400",
                experience: "전문 사회자",
                specialty: ["전문 진행", "맞춤 서비스"],
                rating: 4.8,
                reviews: 0,
                description: host.biography ? host.biography.join(' ') : "전문 사회자입니다.",
                career: host.biography || ["전문 사회자"],
                price: "문의",
                region: host.region,
                photoPath: host.photoPath,
                biography: host.biography,
                color: host.color
              })}
            >
              <div className="space-y-4">
                 {/* Host Image */}
                <div className="relative overflow-hidden rounded-lg w-[333px] h-[410px] mx-auto">
                  <img
                    src={host.photoPath || "/api/placeholder/300/400"}
                    alt={host.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log('Image failed to load:', host.photoPath);
                      e.currentTarget.src = "/api/placeholder/300/400";
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', host.photoPath);
                    }}
                  />
                </div>

                {/* Host Info */}
                <div className="space-y-2 text-center border-t border-border/20 pt-3">
                  <h3 className="text-sm text-muted-foreground">{host.name} 사회자</h3>

                  {/* Reviews - 가운데 정렬 */}
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>리뷰 0개</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 선택된 지역에 사회자가 없는 경우 */}
        {currentHosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">해당 지역에 등록된 사회자가 없습니다.</p>
          </div>
        )}

        {/* Host Detail Dialog - 4번째 이미지 스타일로 변경 */}
        <Dialog open={!!selectedHost} onOpenChange={(open) => !open && setSelectedHost(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedHost?.name} 사회자 정보</DialogTitle>
              <DialogDescription>사회자의 상세 정보와 약력을 확인하실 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="relative">
              <button
                onClick={() => setSelectedHost(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                ✕
              </button>
              
              {selectedHost && (
                <div className="text-center space-y-6 p-6">
                  {/* 큰 프로필 사진 */}
                  <div className="relative">
                    <img
                      src={selectedHost.photoPath || "/api/placeholder/300/400"}
                      alt={selectedHost.name}
                      className="w-80 h-96 object-cover rounded-lg mx-auto"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-full">
                        후기 보러가기
                      </Button>
                    </div>
                  </div>

                  {/* 이름 */}
                  <h2 className="text-2xl font-bold">{selectedHost.name} 사회자</h2>

                  {/* 약력 섹션 */}
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-semibold text-center">약력</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedHost.biography && selectedHost.biography.map((bio, index) => {
                        // HTML 태그가 포함된 경우 제거하고 텍스트만 표시
                        const cleanBio = bio.replace(/<[^>]*>/g, '').trim();
                        return cleanBio ? <p key={index}>{cleanBio}</p> : null;
                      }).filter(Boolean)}
                    </div>
                  </div>

                  {/* 예약 문의 버튼 */}
                  <div className="pt-4">
                    <Button className="w-full bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-lg">
                      💖 예약 문의하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Hosts;