import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

interface PromotionPost {
  id: string;
  title: string;
  content: string;
  date: string;
  views: number;
  image?: string;
}

const Promotion = () => {
  const [promotions, setPromotions] = useState<PromotionPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage에서 관리자가 등록한 프로모션 데이터 가져오기
    const savedPromotions = localStorage.getItem('wedding-promotions');
    if (savedPromotions) {
      const parsedPromotions = JSON.parse(savedPromotions);
      // content가 HTML인 경우 텍스트만 추출하여 미리보기용으로 사용
      const processedPromotions = parsedPromotions.map((promo: any) => ({
        id: promo.id,
        title: promo.title,
        content: promo.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...', // HTML 태그 제거하고 200자로 제한
        date: promo.date,
        views: promo.views || 0,
        image: promo.imagePath
      }));
      setPromotions(processedPromotions);
    }
  }, []);

  const handlePromotionClick = (promotionId: string) => {
    navigate(`/promotion/${promotionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            프로모션
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            늘봄의 다양한 이벤트와 특별 혜택을 확인해보세요.
          </p>
        </div>

        {/* Promotions List */}
        <div className="max-w-4xl mx-auto space-y-8">
          {promotions.map((promotion, index) => (
            <Card 
              key={promotion.id} 
              className="card-wedding hover-lift slide-up shadow-lg border border-gray-200 cursor-pointer"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => handlePromotionClick(promotion.id)}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                {promotion.image && (
                  <div className="lg:w-1/3">
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="w-full h-48 lg:h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className={`${promotion.image ? 'lg:w-2/3' : 'w-full'} space-y-4`}>
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-playfair font-semibold text-foreground pr-4">
                      {promotion.title}
                    </h2>
                    <Heart className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {promotion.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No promotions message */}
        {promotions.length === 0 && (
          <Card className="card-wedding text-center p-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              진행 중인 프로모션이 없습니다
            </h3>
            <p className="text-muted-foreground">
              새로운 프로모션 소식을 기다려주세요!
            </p>
          </Card>
        )}

        {/* Pagination would go here */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>이전</Button>
            <Button className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">다음</Button>
          </div>
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Promotion;