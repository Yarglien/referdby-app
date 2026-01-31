
export enum TokenState {
  CREATED = 'created', 
  USER_SCANNED = 'user_scanned',
  PRESENT_AT_RESTAURANT = 'present_at_restaurant',
  PROCESSED = 'processed'
}

export interface ProcessBillParams {
  items?: {
    itemId: string;
    quantity: number;
    price: number;
  }[];
  customerProfileId?: string;
  restaurantProfileId?: string;
  totalBillAmount?: number;
  
  billTotal: number;
  billImage: string;
  activityId: string;
  restaurantId: string;
  customerId: string;
  processedById: string;
  userReferrerId?: string;
  appReferrerId?: string;
  restaurantReferrerId?: string;
}

export interface PointsDistribution {
  customerPoints: number;
  restaurantPoints: number;
  refererPoints?: number;
  
  referrerPoints: number;
  restaurantRecruiterPoints: number;
  appReferrerPoints: number;
  restaurantDeduction: number;
}

export interface CreatePointsMapParams {
  customerId: string;
  userReferrerId?: string;
  appReferrerId?: string;
  restaurantReferrerId?: string;
  referralActivity: any;
  pointsData: PointsDistribution;
}
