
export enum ActivityType {
  REFERRAL_PRESENTED = 'referral_presented',
  REFERRAL_SCANNED = 'referral_scanned', 
  REFERRAL_PROCESSED = 'referral_processed',
  REDEEM_PRESENTED = 'redeem_presented',
  REDEEM_SCANNED = 'redeem_scanned',
  REDEEM_PROCESSED = 'redeem_processed',
  POINTS_DEDUCTED = 'points_deducted'
}

export enum InviteType {
  RESTAURANT = 'restaurant',
  SERVER = 'server'
}

export enum ReferralStatus {
  ACTIVE = 'active',
  SCANNED = 'scanned',
  PRESENTED = 'presented',
  USED = 'used',
  EXPIRED = 'expired'
}

export enum TokenState {
  CREATED = 'created',
  USER_SCANNED = 'user_scanned',
  PRESENT_AT_RESTAURANT = 'present_at_restaurant',
  PROCESSED = 'processed'
}
