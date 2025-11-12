import { LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface LogoutButtonProps {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLogout}
      className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm hover:bg-white"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Выйти
    </Button>
  );
}
