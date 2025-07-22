import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalendarComponent from "@/components/Calendar";

const CalendarPage = () => {
  const [adminHosts, setAdminHosts] = useState([]);

  useEffect(() => {
    console.log('CalendarPage - Component mounted, loading hosts...');
    
    // localStorage의 모든 키 확인
    console.log('CalendarPage - All localStorage keys:', Object.keys(localStorage));
    
    // 호스트 데이터 가져오기
    const hostsData = localStorage.getItem('wedding-hosts');
    console.log('CalendarPage - Hosts data from wedding-hosts:', hostsData);
    
    if (hostsData) {
      try {
        const parsedHosts = JSON.parse(hostsData);
        console.log('CalendarPage - Parsed hosts:', parsedHosts);
        setAdminHosts(parsedHosts);
      } catch (error) {
        console.error('Error parsing hosts data:', error);
      }
    } else {
      console.log('CalendarPage - No hosts found in wedding-hosts, checking other keys...');
      
      // 다른 가능한 키들 확인
      const possibleKeys = ['social-hosts', 'hosts', 'admin-hosts'];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        console.log(`CalendarPage - Checking ${key}:`, data);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`CalendarPage - Found hosts in ${key}:`, parsed);
            setAdminHosts(parsed);
            break;
          } catch (error) {
            console.error(`Error parsing ${key}:`, error);
          }
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12 fade-in">
            <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
              예약 현황
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              예약 현황을 확인해보세요.
            </p>
          </div>

          {/* Calendar Section */}
          <div className="max-w-6xl mx-auto">
            {adminHosts.length > 0 ? (
              <CalendarComponent hosts={adminHosts} />
            ) : (
              <CalendarComponent />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalendarPage;