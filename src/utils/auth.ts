export const checkAdminAuth = (): boolean => {
  try {
    const adminData = localStorage.getItem("adminLoggedIn");
    if (!adminData) return false;
    
    const { isLoggedIn, expiry } = JSON.parse(adminData);
    
    // 로그인 상태이고 만료 시간이 지나지 않았으면 true
    if (isLoggedIn && Date.now() < expiry) {
      return true;
    }
    
    // 만료된 경우 localStorage에서 제거
    localStorage.removeItem("adminLoggedIn");
    return false;
  } catch {
    return false;
  }
};