import {
  FileText,
  User,
  Target,
  Settings,
  UserPlus,
  LogIn,
  Heart,
  Award,
  Landmark,
  Calendar,
  Milestone,
  Train,
  Waves,
  TrendingUp,
  CheckCircle2,
  Users2,
  PlayCircle,
  Info,
  PieChart,
  BarChart3,
  Megaphone,
  FileBarChart,
  ScrollText,
  ShieldCheck,
  Bell,
  ListChecks,
  Headset,
  Newspaper,
  MessageSquare,
  FileWarning,
  Shield
} from "lucide-react";

export const aboutMenu = [
  {
    title: "Organization",
    items: [
      { label: "Introduction", icon: FileText, path: "/about" },
      { label: "Leadership", icon: User },
      { label: "Vision & Mission", icon: Target },
      { label: "Technology For Growth", icon: Settings },
    ],
  },
  {
    title: "Career",
    items: [
      { label: "Career Opportunities", icon: UserPlus },
      { label: "Employee Login", icon: LogIn },
    ],
  },
  {
    title: "Corporate & Social",
    items: [
      { label: "Social Responsibilities", icon: Heart },
      { label: "Awards & Recognition", icon: Award },
      { label: "H. G. Foundation", icon: Landmark },
      { label: "Life @ H.G.", icon: Calendar },
    ],
  },
];

export const projectMenu = [
  {
    title: "Sectors",
    items: [
      { label: "Roads & Highways", icon: Milestone, meta: "NHAI & State Projects" },
      { label: "Railways & Metro", icon: Train, meta: "Infrastructure & Tracks" },
      { label: "Water Management", icon: Waves, meta: "Canals & Irrigation" },
    ],
  },
  {
    title: "Status",
    items: [
      { label: "New Projects", icon: TrendingUp },
      { label: "Ongoing Projects", icon: Calendar },
      { label: "Completed Projects", icon: CheckCircle2 },
    ],
  },
  {
    title: "Partners",
    items: [
      { label: "Vendor Registration", icon: Users2 },
      { label: "Vendor Training", icon: PlayCircle },
    ],
  },
];

export const investorMenu = [
  {
    title: "Shareholders",
    items: [
      { label: "Shareholder's Info", icon: Info },
      { label: "Shareholding Pattern", icon: PieChart },
      { label: "Investor Presentation", icon: BarChart3 },
      { label: "Announcements", icon: Megaphone },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Analyst Report", icon: FileText },
      { label: "Annual Reports", icon: FileBarChart },
      { label: "Compliance Report", icon: ScrollText },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Corporate Governance", icon: ShieldCheck },
      { label: "Notices (AGM/EGM)", icon: Bell },
      { label: "Code & Policies", icon: ListChecks },
      { label: "Investor Contact", icon: Headset },
      { label: "Newsroom", icon: Newspaper },
    ],
  },
];
