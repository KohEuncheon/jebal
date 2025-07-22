import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PromotionPost {
  id: string;
  title: string;
  content: string;
  date: string;
  views: number;
  imagePath?: string;
}

const PromotionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<PromotionPost | null>(null);

  useEffect(() => {
    const savedPromotions = localStorage.getItem('wedding-promotions');
    if (savedPromotions && id) {
      const parsedPromotions = JSON.parse(savedPromotions);
      const foundPromotion = parsedPromotions.find((promo: any) => promo.id === id);
      if (foundPromotion) {
        setPromotion(foundPromotion);
        // 조회수 증가
        const updatedPromotions = parsedPromotions.map((promo: any) =>
          promo.id === id ? { ...promo, views: (promo.views || 0) + 1 } : promo
        );
        localStorage.setItem('wedding-promotions', JSON.stringify(updatedPromotions));
      }
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!promotion) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="card-wedding text-center p-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              프로모션을 찾을 수 없습니다
            </h3>
            <p className="text-muted-foreground mb-4">
              요청하신 프로모션이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => navigate('/promotion')}>
              프로모션 목록으로 돌아가기
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/promotion')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              프로모션 목록으로
            </Button>
          </div>

          {/* Promotion Detail */}
          <Card className="card-wedding max-w-4xl mx-auto">
            {/* Header */}
            <div className="border-b border-border pb-6 mb-6">
              <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
                {promotion.title}
              </h1>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(promotion.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>조회수 {promotion.views}</span>
                  </div>
                </div>
                <Heart className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Image */}
            {promotion.imagePath && (
              <div className="mb-8">
                <img
                  src={promotion.imagePath}
                  alt={promotion.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: promotion.content }}
            />
          </Card>

          {/* Bottom Navigation */}
          <div className="flex justify-center mt-12">
            <Button 
              onClick={() => navigate('/promotion')}
              className="bg-primary text-primary-foreground"
            >
              다른 프로모션 보기
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PromotionDetail;