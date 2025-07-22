import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";

const BulkUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "오류",
        description: "CSV 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // CSV 헤더 검증
      const requiredHeaders = ['title', 'bride', 'groom', 'contact', 'venue', 'ceremony_type', 'ceremony_date', 'ceremony_time'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "CSV 형식 오류",
          description: `필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // 데이터 파싱
      const reservations = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length < headers.length) continue;

        const reservation: any = {};
        headers.forEach((header, index) => {
          reservation[header] = values[index] || '';
        });

        // 필수 필드 검증
        if (!reservation.title || !reservation.bride || !reservation.groom || 
            !reservation.contact || !reservation.venue || !reservation.ceremony_date) {
          continue;
        }

        // 기본값 설정
        reservations.push({
          title: reservation.title,
          bride: reservation.bride,
          groom: reservation.groom,
          contact: reservation.contact,
          venue: reservation.venue,
          ceremony_type: reservation.ceremony_type || '주례있음',
          second_party: reservation.second_party || '없음',
          ceremony_date: reservation.ceremony_date,
          ceremony_time: reservation.ceremony_time || '14:00',
          referral_source: reservation.referral_source || '기타',
          additional_input: reservation.additional_input || '',
          notes: reservation.notes || '',
          status: 'pending',
          password: reservation.password || 'default123',
          host_id: reservation.host_id || null
        });
      }

      if (reservations.length === 0) {
        toast({
          title: "오류",
          description: "유효한 데이터가 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // 배치로 삽입 (1000개씩)
      const batchSize = 1000;
      let successCount = 0;
      
      for (let i = 0; i < reservations.length; i += batchSize) {
        const batch = reservations.slice(i, i + batchSize);
        const { error } = await supabase
          .from('reservations')
          .insert(batch);

        if (error) {
          console.error(`배치 ${Math.floor(i/batchSize) + 1} 삽입 실패:`, error);
          toast({
            title: "부분 실패",
            description: `${i}번째부터 오류가 발생했습니다: ${error.message}`,
            variant: "destructive",
          });
          break;
        }
        
        successCount += batch.length;
        
        // 진행상황 표시
        toast({
          title: "진행중",
          description: `${successCount}/${reservations.length} 건 업로드 완료`,
        });
      }

      toast({
        title: "업로드 완료",
        description: `총 ${successCount}건의 예약 문의가 성공적으로 업로드되었습니다.`,
      });
      
      setShowModal(false);
      
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      toast({
        title: "오류",
        description: "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  const csvTemplate = `title,bride,groom,contact,venue,ceremony_type,second_party,ceremony_date,ceremony_time,referral_source,additional_input,notes,password
예약 문의합니다,홍길동,김영희,010-1234-5678,강남웨딩홀,주례있음,없음,2024-06-15,14:00,네이버 검색,,비용이 궁금합니다,password123
두 번째 문의,이민수,박소영,010-9876-5432,서울웨딩홀,주례없음,있음,2024-07-20,16:00,인스타그램,,문의드립니다,mypass456`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reservation_template.csv';
    link.click();
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          대량 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>예약 문의 대량 업로드</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              CSV 파일을 사용하여 예약 문의를 대량으로 업로드할 수 있습니다.
              최대 8000건까지 한 번에 처리 가능합니다.
            </AlertDescription>
          </Alert>
          
          <div>
            <Button variant="outline" onClick={downloadTemplate} className="w-full mb-2">
              CSV 템플릿 다운로드
            </Button>
            <p className="text-xs text-gray-500">
              템플릿을 다운로드하여 형식을 확인하세요.
            </p>
          </div>

          <div>
            <Label htmlFor="csvFile">CSV 파일 선택</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <Alert>
              <AlertDescription>
                업로드 중입니다... 잠시만 기다려주세요.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>필수 필드:</strong></p>
            <p>title, bride, groom, contact, venue, ceremony_date</p>
            <p><strong>선택 필드:</strong></p>
            <p>ceremony_type, second_party, ceremony_time, referral_source, notes, password</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpload;