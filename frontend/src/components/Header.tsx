import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
// ✅ Importar o hook de notificação
import { useNotification } from "@/context/NotificationContext";

export const Header = () => {
  const { user, logout } = useAuth();
  // ✅ Usar o hook
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/"; 
  };

  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            <img src="/Logotipo.svg" alt="Logo" className="w-130 h-10" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de Materiais
          </p>
        </div>

        <div className="flex items-center gap-4">
          
          {/* ✅ DROPDOWN DE NOTIFICAÇÕES */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                        {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notificações
                    {unreadCount > 0 && (
                        <span className="text-xs text-blue-500 cursor-pointer font-normal hover:underline" onClick={markAllAsRead}>
                            Marcar lidas
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma notificação recente.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className={`p-3 border-b text-sm ${notif.read ? 'opacity-60' : 'bg-blue-50/50'}`}>
                                <p className="font-semibold text-indigo-900">{notif.title}</p>
                                <p className="text-gray-600 text-xs mt-1 leading-snug">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 text-right">
                                    {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.email || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Operador
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};