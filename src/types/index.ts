/**
 * ResourceLoop - Domain Types and Interfaces
 */

export type UserRole = 'student' | 'owner' | 'manager' | 'admin';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  institutionId?: string;
  institutionName?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  department?: string;
  phone?: string;
  bio?: string;
  completedTrainings?: string[]; // e.g. ["3D Printing Safety", "High Voltage Electronics"]
  approvedQualifications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  verificationStatus: 'verified' | 'pending';
  resourceSharingPolicy: string;
  createdAt: string;
}

export type ResourceCategory =
  | 'Electronics'
  | 'Laboratory'
  | 'Computing'
  | 'Fabrication'
  | 'Audio & Video'
  | 'Robotics'
  | 'Engineering Tools'
  | 'Workspaces'
  | 'Specialized';

export type ResourceAvailability = 'available' | 'booked' | 'maintenance' | 'restricted';

export type ResourceCondition = 'excellent' | 'good' | 'fair' | 'needs_service';

export type MaintenanceStatus = 'operational' | 'scheduled' | 'in_repair';

export interface Resource {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  institutionId?: string;
  institutionName?: string;
  name: string;
  category: ResourceCategory;
  description: string;
  specifications: string;
  imageUrl: string;
  location: string;
  rentalPricePerDay: number; // in INR (₹)
  securityDeposit: number;   // in INR (₹)
  availability: ResourceAvailability;
  condition: ResourceCondition;
  maintenanceStatus: MaintenanceStatus;
  trainingRequired: boolean;
  trainingCourseName?: string;
  approvalRequired: boolean;
  fairShareMaxDays?: number; // Maximum consecutive days allowed
  includedAccessories?: string[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type RequestStatus =
  | 'open'
  | 'potential_match'
  | 'awaiting_provider'
  | 'matched'
  | 'fulfilled'
  | 'closed';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EquipmentRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  equipmentName: string;
  category: ResourceCategory;
  technicalRequirements: string;
  purpose: string;
  quantity: number;
  startDate: string;
  endDate: string;
  maxBudget: number; // in INR
  preferredLocation: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  matchedResourceId?: string;
  matchedResourceName?: string;
  providerResponse?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'checked_out'
  | 'returned_pending_inspection'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceCategory?: string;
  resourceImageUrl?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  ownerId: string;
  ownerName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalDays: number;
  rentalCost: number;     // in INR
  securityDeposit: number; // in INR
  purpose: string;
  status: BookingStatus;
  rejectionReason?: string;
  checkInAt?: string;
  checkOutAt?: string;
  returnedAt?: string;
  initialCondition?: string;
  returnCondition?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ConditionReport {
  id: string;
  bookingId: string;
  resourceId: string;
  resourceName?: string;
  submittedBy: string;
  submitterName: string;
  reportType: 'check_out' | 'return';
  overallCondition: 'pristine' | 'good' | 'wear_and_tear' | 'damaged';
  notes: string;
  accessoriesConfirmed: boolean;
  discrepancies?: string;
  photoUrls?: string;
  createdAt: string;
}

export type IncidentType =
  | 'damage'
  | 'malfunction'
  | 'missing_accessory'
  | 'late_return'
  | 'dispute';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'under_review'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface Incident {
  id: string;
  bookingId?: string;
  resourceId: string;
  resourceName: string;
  reportedBy: string;
  reporterName: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  reviewStatus: IncidentStatus;
  ownerResponse?: string;
  resolution?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  resourceId: string;
  resourceName: string;
  issueDescription: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  technician?: string;
  serviceCost?: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'booking'
    | 'match'
    | 'approval'
    | 'return_reminder'
    | 'incident'
    | 'maintenance'
    | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
  timestamp: string;
}

export interface AIRecommendation {
  resourceId: string;
  resourceName: string;
  category: string;
  rentalPricePerDay: number;
  matchScore: number;
  matchReason: string;
  isAlternative: boolean;
  alternativeExplanation?: string;
}

export interface AIMatchResponse {
  query: string;
  extractedRequirements: {
    category?: string;
    equipment?: string;
    specifications?: string;
    budget?: number;
    durationDays?: number;
    location?: string;
  };
  recommendations: AIRecommendation[];
  advice: string;
  deterministicFallbackUsed: boolean;
}
