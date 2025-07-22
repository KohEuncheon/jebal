-- 사회자 테이블 생성
CREATE TABLE public.hosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 예약 문의 테이블 생성
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  bride TEXT NOT NULL,
  groom TEXT NOT NULL,
  contact TEXT NOT NULL,
  host_id UUID REFERENCES public.hosts(id),
  venue TEXT NOT NULL,
  ceremony_type TEXT NOT NULL CHECK (ceremony_type IN ('주례있음', '주례없음')),
  second_party TEXT NOT NULL CHECK (second_party IN ('있음', '없음')),
  ceremony_date DATE NOT NULL,
  ceremony_time TEXT NOT NULL,
  referral_source TEXT NOT NULL,
  additional_input TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Row Level Security 활성화
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 사회자 테이블 정책 (누구나 조회 가능, 관리자만 수정 가능)
CREATE POLICY "Everyone can view hosts" 
ON public.hosts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert hosts" 
ON public.hosts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update hosts" 
ON public.hosts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete hosts" 
ON public.hosts 
FOR DELETE 
USING (true);

-- 예약 문의 테이블 정책 (누구나 삽입 및 조회 가능)
CREATE POLICY "Everyone can view reservations" 
ON public.reservations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reservations" 
ON public.reservations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reservations" 
ON public.reservations 
FOR DELETE 
USING (true);

-- 자동 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 추가
CREATE TRIGGER update_hosts_updated_at
  BEFORE UPDATE ON public.hosts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();