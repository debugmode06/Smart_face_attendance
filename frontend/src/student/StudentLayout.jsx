// src/student/StudentLayout.jsx
import DashboardLayout from "../components/DashboardLayout";
import FloatingMessageButton from "./components/FloatingMessageButton";
import {
  Home,
  Calendar,
  CheckSquare,
  User,
  BookOpen,
  LineChart,
  MessageCircle,
  MessageSquare,
  BrainCircuit,
  FileEdit,
  Lightbulb,
} from "lucide-react";

export default function StudentLayout() {
  const items = [
    { label: "Dashboard", path: "dashboard", icon: Home },
    { label: "Schedule", path: "schedule", icon: Calendar },
    { label: "Attendance", path: "attendance", icon: CheckSquare },
    { label: "AI Assistant", path: "ai", icon: BrainCircuit },
  ];

  return (
    <>
      <DashboardLayout sidebarItems={items} title="Student Panel" />
      <FloatingMessageButton />
    </>
  );
}

