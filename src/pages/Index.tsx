import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Calendar as CalendarIcon, MapPin, Heart, Star, ArrowRight, Users, Trophy, Clock, Phone, Instagram, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalendarComponent from "@/components/Calendar";
import heroImage from "@/assets/hero-banner.jpg";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adminHosts, setAdminHosts] = useState([]);
  
  // 관리자 페이지에서 추가된 배너들을 가져오기 (localStorage 사용)
  const [adminBanners, setAdminBanners] = useState([]);
  
  useEffect(() => {
    const savedBanners = localStorage.getItem('banners');
    console.log('저장된 배너 데이터:', savedBanners); // 디버깅용
    if (savedBanners) {
      const parsedBanners = JSON.parse(savedBanners);
      console.log('파싱된 배너:', parsedBanners); // 디버깅용
      console.log('모든 배너:', parsedBanners); // 모든 배너 확인
      const activeBanners = parsedBanners.filter(banner => banner.isActive);
      console.log('활성 배너:', activeBanners); // 디버깅용
      setAdminBanners(activeBanners);
    }

    // 사회자 데이터 로드
    const savedHosts = localStorage.getItem('hosts');
    if (savedHosts) {
      setAdminHosts(JSON.parse(savedHosts));
    }
  }, []);
  
  // 관리자 배너가 있으면 사용하고, 없으면 기본 배너 사용
  const defaultBanner = {
    id: 'default',
    title: '늘봄 웨딩',
    imagePath: heroImage,
    isActive: true
  };
  
  const displayBanners = adminBanners.length > 0 ? adminBanners : [defaultBanner];
  
  // 10초마다 자동 슬라이드
  useEffect(() => {
    if (displayBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [displayBanners.length]);

  // 화살표 버튼 핸들러
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      {/* Hero Banner Section - 관리자 배너 사용 */}
      {displayBanners.length > 0 && (
        <section className="relative">
          <div className="container mx-auto px-4 py-4">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="aspect-[900/339] overflow-hidden rounded-lg">
                <img
                  src={displayBanners[currentSlide].imagePath}
                  alt={displayBanners[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 화살표 버튼들 */}
              {displayBanners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Slide Indicators */}
              {displayBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {displayBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentSlide === index ? 'bg-primary' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* YouTube Video Section */}
      <section className="py-6 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/GlRLXak-Hsg?start=1253"
                title="늘봄 웨딩 사회자 소개 영상"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">


        {/* Calendar Section */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 fade-in">
              <h2 className="text-4xl font-playfair font-bold text-foreground mb-2">
                예약 확정 달력
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <CalendarComponent hosts={adminHosts} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-8 mb-4">
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
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm">인스타그램</span>
                </a>
              </div>
              
              <Link to="/booking">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                  예약 문의
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer - 화면 바닥에 고정 */}
      <Footer />
    </div>
  );
};

export default Index;
