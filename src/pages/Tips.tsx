import { useState } from "react";
import { Calendar as CalendarIcon, Eye, BookOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TipPost {
  id: string;
  title: string;
  content: string;
  date: string;
  views: number;
  category: string;
  image?: string;
}

const Tips = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - 실제로는 API에서 가져올 데이터
  const [tips] = useState<TipPost[]>([
    {
      id: "1",
      title: "결혼식 사회자 선택 시 고려해야 할 5가지 포인트",
      content: "완벽한 결혼식을 위해서는 사회자 선택이 매우 중요합니다. 경험, 진행 스타일, 목소리 톤, 커뮤니케이션 능력, 그리고 예산을 종합적으로 고려해야 합니다.",
      date: "2024-02-20",
      views: 2341,
      category: "사회자 선택",
      image: "/api/placeholder/600/300"
    },
    {
      id: "2",
      title: "예식 당일 준비사항 체크리스트",
      content: "예식 당일 차질없는 진행을 위한 필수 준비사항들을 정리했습니다. 사회자와의 마지막 점검부터 음향 시설 확인까지 빠뜨리지 말아야 할 것들을 알아보세요.",
      date: "2024-02-15",
      views: 1876,
      category: "예식 준비",
      image: "/api/placeholder/600/300"
    },
    {
      id: "3",
      title: "감동적인 결혼식을 위한 진행 순서 가이드",
      content: "하객들의 마음을 움직이는 감동적인 예식 진행 순서에 대해 알아보세요. 입장부터 퇴장까지, 각 순서별 포인트를 자세히 설명드립니다.",
      date: "2024-02-10",
      views: 1654,
      category: "예식 진행",
      image: "/api/placeholder/600/300"
    },
    {
      id: "4",
      title: "웨딩홀별 음향 시설 활용 팁",
      content: "각기 다른 웨딩홀의 음향 시설 특성을 파악하고 최적으로 활용하는 방법을 알려드립니다. 마이크 사용법부터 배경음악 선택까지 상세 가이드입니다.",
      date: "2024-02-05",
      views: 987,
      category: "기술 정보",
      image: "/api/placeholder/600/300"
    }
  ]);

  const categories = [
    { id: "all", name: "전체" },
    { id: "사회자 선택", name: "사회자 선택" },
    { id: "예식 준비", name: "예식 준비" },
    { id: "예식 진행", name: "예식 진행" },
    { id: "기술 정보", name: "기술 정보" }
  ];

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            안내 & TIP
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            완벽한 결혼식을 위한 유용한 정보와 전문가 팁을 확인해보세요.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="card-wedding p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="form-wedding pl-10"
                  placeholder="궁금한 내용을 검색해보세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`${
                      selectedCategory === category.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Tips List */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredTips.map((tip, index) => (
            <Card 
              key={tip.id} 
              className="card-wedding hover-lift slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                {tip.image && (
                  <div className="lg:w-1/3">
                    <img
                      src={tip.image}
                      alt={tip.title}
                      className="w-full h-48 lg:h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className={`${tip.image ? 'lg:w-2/3' : 'w-full'} space-y-4`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {tip.category}
                        </span>
                      </div>
                      <h2 className="text-2xl font-playfair font-semibold text-foreground">
                        {tip.title}
                      </h2>
                    </div>
                    <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {tip.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(tip.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{tip.views.toLocaleString()}회</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="hover:bg-secondary/50">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No results message */}
        {filteredTips.length === 0 && (
          <Card className="card-wedding text-center p-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground">
              다른 검색어나 카테고리를 선택해보세요.
            </p>
          </Card>
        )}

        {/* Pagination */}
        {filteredTips.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" disabled>이전</Button>
              <Button className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">다음</Button>
            </div>
          </div>
        )}
      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tips;