import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Droplet,
  Timer,
  ListChecks,
  Calendar,
  BookOpen,
  Dumbbell,
  Apple,
  Moon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Todo List", url: "/todos", icon: CheckSquare },
  { title: "Water Tracker", url: "/water", icon: Droplet },
  { title: "Pomodoro", url: "/pomodoro", icon: Timer },
  { title: "Habits", url: "/habits", icon: ListChecks },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Workouts", url: "/workouts", icon: Dumbbell },
  { title: "Nutrition", url: "/nutrition", icon: Apple },
  { title: "Sleep", url: "/sleep", icon: Moon },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            LifeTrack
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
