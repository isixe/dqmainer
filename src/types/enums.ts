import {
  Search,
  Globe,
  Clock,
  Shield,
  Server,
  Zap,
  CheckCircle,
  BarChart3,
  Users,
  Award,
  AlertCircle,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";

// View mode for results display
export enum ViewMode {
  CARD = "card",
  LIST = "list",
}

// Sort options for results
export enum SortBy {
  EXPIRES_ASC = "expiresAsc",
  EXPIRES_DESC = "expiresDesc",
  DOMAIN = "domain",
}

// Expiration status types
export enum ExpirationStatusType {
  CRITICAL = "critical", // <= 30 days
  WARNING = "warning", // <= 60 days
  SAFE = "safe", // > 60 days
}

// Feature items for home page
export interface FeatureItem {
  icon: LucideIcon;
  key: string;
}

export const FEATURES: FeatureItem[] = [
  { icon: Search, key: "feature1" },
  { icon: Globe, key: "feature2" },
  { icon: Clock, key: "feature3" },
  { icon: Shield, key: "feature4" },
];

// Why choose us items
export const WHY_CHOOSE_US: FeatureItem[] = [
  { icon: Zap, key: "why1" },
  { icon: BarChart3, key: "why2" },
  { icon: CheckCircle, key: "why3" },
  { icon: Users, key: "why4" },
];

// Testimonial items
export interface TestimonialItem {
  name: string;
  role: string;
  key: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  { name: "Sarah Chen", role: "SEO Manager", key: "testimonial1" },
  { name: "Mike Rodriguez", role: "Web Developer", key: "testimonial2" },
  { name: "Emma Watson", role: "Domain Investor", key: "testimonial3" },
];

// Example domains
export const EXAMPLE_DOMAINS = ["google.com", "github.com", "cloudflare.com"];

// Expiration thresholds (in days)
export const EXPIRATION_THRESHOLDS = {
  CRITICAL: 30,
  WARNING: 60,
} as const;

// Expiration status colors and icons
export const EXPIRATION_STATUS_CONFIG = {
  [ExpirationStatusType.CRITICAL]: {
    color: "text-red-600",
    icon: AlertCircle,
  },
  [ExpirationStatusType.WARNING]: {
    color: "text-yellow-600",
    icon: AlertTriangle,
  },
  [ExpirationStatusType.SAFE]: {
    color: "text-green-600",
    icon: Info,
  },
} as const;

// Stats data
export const STATS_DATA = [
  { value: "99.9%", key: "stat1" },
  { value: "<1s", key: "stat2" },
  { value: "1000+", key: "stat3" },
  { value: "24/7", key: "stat4" },
];

// Professional features
export const PRO_FEATURES = [
  { icon: Server, key: "proFeature1" },
  { icon: Award, key: "proFeature2" },
];
