
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User, Building, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  host: string;
  hostColor?: string;
  clientName?: string;
  venue: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
}

interface SocialHost {
  id: string;
  name: string;
  region: string;
  photoPath: string;
  biography: string[];
  color: string;
}

interface CalendarProps {
  hosts?: SocialHost[];
}

const Calendar = ({ hosts = [] }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // 2025년 7월
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 예약 데이터를 가져오기 (localStorage에서)
  const getReservations = () => {
    const reservations = localStorage.getItem('reservations');
    return reservations ? JSON.parse(reservations) : [];
  };

  // 이름 마스킹 함수 (가운데 글자를 *로 변경)
  const maskName = (name: string) => {
    if (name.length <= 2) {
      return name;
    }
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    const middleChars = '*'.repeat(name.length - 2);
    return firstChar + middleChars + lastChar;
  };

  // 예약 데이터를 달력 이벤트로 변환
  const convertReservationsToEvents = () => {
    const reservations = getReservations();
    return reservations
      .filter((reservation: any) => reservation.status === 'confirmed')
      .map((reservation: any) => {
        // 사회자 ID로 사회자 정보 찾기
        const assignedHost = hosts.find(h => h.id === reservation.hostId);
        const hostName = assignedHost ? assignedHost.name : '미지정';
        
        return {
          id: reservation.id,
          date: reservation.ceremonyDate,
          time: reservation.ceremonyTime,
          host: hostName,
          hostColor: assignedHost ? assignedHost.color : '#6b7280',
          clientName: maskName(reservation.bride), // 신부 이름 마스킹
          venue: reservation.venue,
          type: reservation.ceremonyType,
          status: 'confirmed' as const
        };
      });
  };

  // Get actual reservation data from localStorage
  const getReservationsFromStorage = (): CalendarEvent[] => {
    try {
      const reservations = localStorage.getItem('reservations');
      console.log('Calendar - Raw localStorage data:', reservations);
      
      if (!reservations) {
        console.log('Calendar - No reservations found in localStorage');
        return [];
      }
      
      const parsedReservations = JSON.parse(reservations);
      console.log('Calendar - Parsed reservations:', parsedReservations);
      
      // 확정된 예약만 표시
      const filteredReservations = parsedReservations.filter((reservation: any) => {
        console.log('Calendar - Checking reservation:', reservation);
        console.log('Calendar - Reservation status:', reservation.status);
        return reservation.status === 'confirmed';
      });
      
      console.log('Calendar - Filtered reservations:', filteredReservations);
      
      const mappedEvents = filteredReservations.map((reservation: any) => {
        console.log('Calendar - Available hosts:', hosts);
        console.log('Calendar - Looking for hostId:', reservation.hostId);
        
        // 사회자 ID로 hosts 배열에서 해당 사회자 찾기
        const hostData = hosts.find((host: any) => host.id === reservation.hostId);
        const hostColor = hostData?.color || "#ef4444"; // 사회자 고유 색상 또는 기본 빨간색
        const hostName = hostData?.name || reservation.hostId; // 사회자 이름 또는 ID
        
        console.log('Calendar - Host data found:', hostData);
        console.log('Calendar - Host color:', hostColor);
        
        const event = {
          id: reservation.id,
          date: reservation.ceremonyDate, // Booking에서는 ceremonyDate로 저장됨
          time: reservation.ceremonyTime, // Booking에서는 ceremonyTime으로 저장됨
          host: hostName, // 실제 사회자 이름
          hostColor: hostColor, // 사회자별 고유 색상
          clientName: maskName(reservation.bride), // 신부 이름을 마스킹
          venue: reservation.venue,
          type: reservation.ceremonyType,
          status: reservation.status
        };
        console.log('Calendar - Mapped event:', event);
        return event;
      });
      
      console.log('Calendar - Final events for calendar:', mappedEvents);
      return mappedEvents;
    } catch (error) {
      console.error('Error parsing reservations from localStorage:', error);
      return [];
    }
  };

  // 실제 예약 데이터만 사용 (localStorage에서 가져온 confirmed 예약만)
  const events = getReservationsFromStorage();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateString: string) => {
    return events.filter(event => event.date === dateString);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 년도 선택 옵션 (현재 년도 기준 ±2년)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentDate.getMonth()));
  };

  const handleMonthChange = (month: string) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(month)));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(dateString);
      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedDate === dateString;

      days.push(
        <div
          key={day}
          className={`calendar-date h-24 p-1 border border-border/20 hover:bg-secondary/20 cursor-pointer transition-colors ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-background'
          }`}
          onClick={() => {
            const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(dateString);
            if (getEventsForDate(dateString).length > 0) {
              setIsDialogOpen(true);
            }
          }}
        >
          <div className="h-full flex flex-col">
            <span className="font-medium text-sm mb-1">{day}</span>
            {hasEvents && (
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, index) => {
                  // 이벤트에서 색상과 이름 정보 가져오기
                  const displayColor = event.hostColor || '#6b7280';
                  const displayName = event.clientName || maskName(event.host);
                  
                  return (
                    <div
                      key={index}
                      className="text-xs px-1 py-0.5 rounded text-white font-medium truncate"
                      style={{ backgroundColor: displayColor }}
                      title={`${event.time} - ${event.host} - ${displayName}`}
                    >
                      {displayName}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Reference Notes */}
      <div className="flex justify-center mb-2">
        <div className="max-w-4xl w-full bg-background p-4 rounded-lg">
          <h3 className="text-lg font-playfair font-semibold mb-3 text-center">참고 사항</h3>
          <div className="space-y-1 text-sm text-center">
            <p className="font-semibold">• 날짜를 클릭하시면 자세한 예약 현황을 확인하실 수 있습니다.</p>
            <p className="font-semibold">• 달력이 비어있더라도 사회자의 개인 일정이 있을 수 있습니다.</p>
            <p className="font-semibold">확실한 가능 여부는 예약 문의 게시판을 이용해주세요.</p>
            <p className="font-semibold">• 홍성혁 사회자는 '일요일' 예약이 불가합니다.</p>
          </div>
        </div>
      </div>

      {/* Host List */}
      <div className="flex justify-center mb-2">
        <div className="max-w-4xl w-full bg-background p-2 rounded-lg">
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center items-center gap-6 max-w-fit">
              {hosts.length > 0 ? hosts.map((host) => (
                <div key={host.id} className="flex flex-col items-center justify-center space-y-2 p-1 rounded-lg hover:bg-secondary/20 transition-colors">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: host.color }}
                  />
                  <span className="text-xs font-medium text-center whitespace-nowrap">{host.name} 사회자</span>
                </div>
              )) : (
                <div className="text-center text-muted-foreground">
                  <span className="text-sm">등록된 사회자가 없습니다</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card className="card-wedding">
        {/* Calendar Header with Year/Month Dropdowns and Navigation */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="hover:bg-secondary/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Year Dropdown */}
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearChange(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            
            {/* Month Dropdown */}
            <select
              value={currentDate.getMonth()}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="hover:bg-secondary/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center font-medium text-muted-foreground bg-secondary/30 border-b-2 border-border"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-6 overflow-hidden">
          {renderCalendarDays()}
        </div>
      </Card>

      {/* Reservation Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {selectedDate} 예약 현황
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div key={event.id} className="border border-border rounded-lg p-4 bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium text-lg">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">{event.host}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{event.venue}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        예식 유형: {event.type}
                      </div>
                      
                      {event.clientName && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">신랑/신부:</span> {event.clientName}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: event.hostColor }}
                        title="사회자 색상"
                      />
                      <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status === 'confirmed' ? '확정' :
                         event.status === 'pending' ? '문의 중' : '완료'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                선택한 날짜에 예약된 일정이 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
