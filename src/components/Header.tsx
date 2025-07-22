import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Heart, Calendar, Users, Gift, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingDropdownOpen, setIsBookingDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // 다른 곳 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setIsBookingDropdownOpen(false);
    };

    if (isBookingDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isBookingDropdownOpen]);

  const navigation = [
    { name: "늘봄소개", href: "/about", icon: Heart },
    { name: "사회자", href: "/hosts", icon: Users },
    { 
      name: "예약", 
      href: "#", 
      icon: Calendar,
      dropdown: [
        { name: "예약 문의", href: "/booking" },
        { name: "예약 현황", href: "/calendar" }
      ]
    },
    { name: "프로모션", href: "/promotion", icon: Gift },
    { name: "안내&TIP", href: "/tips", icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/ebac42b2-3da6-4421-a3da-cd208bcedfb1.png" 
              alt="로고" 
              className="h-10 w-auto rounded-lg object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBookingDropdownOpen(!isBookingDropdownOpen);
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {isBookingDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-2 fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
                            onClick={() => setIsBookingDropdownOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-secondary/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/booking">
              <Button className="btn-wedding">
                지금 예약하기
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border mt-4 fade-in">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <div className="flex items-center space-x-2 py-3 px-4 text-foreground font-medium">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block py-2 px-4 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-secondary/50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-border">
                <Link to="/booking" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-wedding w-full">
                    지금 예약하기
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;