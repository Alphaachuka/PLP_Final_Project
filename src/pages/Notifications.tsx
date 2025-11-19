import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Trash2, Check, CheckCheck, ArrowLeft } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.referenceType === "job" && notification.referenceId) {
      navigate(`/jobs/${notification.referenceId}`);
    } else if (notification.referenceType === "course" && notification.referenceId) {
      navigate(`/courses/${notification.referenceId}`);
    } else if (notification.referenceType === "application") {
      navigate("/applications");
    } else {
      navigate("/dashboard");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_posted":
        return "💼";
      case "job_application":
        return "📋";
      case "application_status":
        return "✅";
      case "course_enrollment":
        return "📚";
      case "course_published":
        return "🎓";
      case "rating_received":
        return "⭐";
      case "payment_received":
        return "💰";
      default:
        return "🔔";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-10 w-10 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              You'll see notifications here when there's activity on your account
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge className="h-6 w-6 flex items-center justify-center p-0">
                    {unreadNotifications.length}
                  </Badge>
                  Unread
                </h2>
                <div className="space-y-3">
                  {unreadNotifications.map((notification) => (
                    <Card
                      key={notification._id}
                      className="p-4 bg-primary/5 border-primary/20 hover:shadow-card transition-all cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Earlier</h2>
                <div className="space-y-3">
                  {readNotifications.map((notification) => (
                    <Card
                      key={notification._id}
                      className="p-4 hover:shadow-card transition-all cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl opacity-50 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-muted-foreground">
                              {notification.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;