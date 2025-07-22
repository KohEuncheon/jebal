import { Heart, Award, Users, Clock, Star, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "진심과 정성",
      description: "모든 커플의 특별한 날을 진심으로 축하하며, 정성스럽게 준비합니다."
    },
    {
      icon: Award,
      title: "전문성",
      description: "방송사 출신 아나운서들의 전문적인 진행으로 완벽한 예식을 만들어드립니다."
    },
    {
      icon: Users,
      title: "소통과 배려",
      description: "신랑신부와 가족들의 의견을 충분히 반영하여 맞춤형 예식을 진행합니다."
    }
  ];

  const milestones = [
    { year: "2015", event: "늘봄 설립" },
    { year: "2017", event: "누적 예식 진행 1000건 달성" },
    { year: "2019", event: "웨딩박람회 대상 수상" },
    { year: "2021", event: "고객 만족도 98% 달성" },
    { year: "2023", event: "누적 예식 진행 5000건 돌파" }
  ];

  const certifications = [
    "한국웨딩플래너협회 인증",
    "결혼예식업 우수업체 선정",
    "고객만족도 최우수상 수상",
    "웨딩 트렌드 리더십상 수상"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            늘봄 소개
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            2015년부터 지금까지, 수많은 커플들의 특별한 순간을 함께해온 늘봄의 이야기입니다.
          </p>
        </div>

        {/* Brand Story */}
        <section className="mb-20">
          <Card className="card-wedding p-12 slide-up">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-primary" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-playfair font-bold mb-6">우리의 이야기</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground space-y-6">
                <p>
                  "늘봄"은 '늘 봄처럼 따뜻하고 새로운 시작'이라는 의미를 담고 있습니다. 
                  결혼은 두 사람이 새로운 인생을 함께 시작하는 따뜻하고 아름다운 순간이기에, 
                  저희는 이 특별한 날을 더욱 완벽하게 만들어드리고자 합니다.
                </p>
                <p>
                  2015년 설립 이래, 5000여 커플의 소중한 순간을 함께해왔습니다. 
                  방송사 출신의 전문 아나운서들이 각 커플의 개성과 가족의 특색을 살린 
                  맞춤형 예식을 진행하여, 하객들의 마음에도 오래도록 남는 감동적인 시간을 선사합니다.
                </p>
                <p>
                  늘봄과 함께하는 모든 예식이 신랑신부는 물론 참석하신 모든 분들에게 
                  따뜻한 추억이 되기를 바라며, 앞으로도 최고의 서비스로 보답하겠습니다.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Our Values */}
        <section className="mb-20">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              늘봄의 가치
            </h2>
            <p className="text-lg text-muted-foreground">
              저희가 소중히 여기는 가치들입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-wedding text-center p-8 hover-lift slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-playfair font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section className="mb-20">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              주요 연혁
            </h2>
            <p className="text-lg text-muted-foreground">
              늘봄이 걸어온 발자취를 소개합니다.
            </p>
          </div>
          
          <Card className="card-wedding p-8">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-6 slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold z-10">
                      {milestone.year.slice(-2)}
                    </div>
                    <div className="flex-1 bg-secondary/20 rounded-lg p-4 hover-lift">
                      <div className="font-semibold text-primary text-lg">{milestone.year}</div>
                      <div className="text-foreground">{milestone.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Certifications */}
        <section className="mb-20">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-4">
              인증 및 수상
            </h2>
            <p className="text-lg text-muted-foreground">
              늘봄의 전문성을 인정받은 다양한 인증과 수상 내역입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="card-wedding p-6 hover-lift slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-medium text-foreground">{cert}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section>
          <Card className="card-wedding p-12 text-center">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">
              늘봄과 함께한 소중한 순간들
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="fade-in">
                <div className="text-4xl font-playfair font-bold text-primary mb-2">5000+</div>
                <div className="text-muted-foreground">진행한 예식</div>
              </div>
              <div className="fade-in" style={{ animationDelay: "100ms" }}>
                <div className="text-4xl font-playfair font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">고객 만족도</div>
              </div>
              <div className="fade-in" style={{ animationDelay: "200ms" }}>
                <div className="text-4xl font-playfair font-bold text-primary mb-2">4.9</div>
                <div className="text-muted-foreground">평균 평점</div>
              </div>
              <div className="fade-in" style={{ animationDelay: "300ms" }}>
                <div className="text-4xl font-playfair font-bold text-primary mb-2">8</div>
                <div className="text-muted-foreground">전문 사회자</div>
              </div>
            </div>
          </Card>
        </section>
      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;