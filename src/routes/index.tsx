
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Activity from "@/pages/Activity";
import MyReferrals from "@/pages/MyReferrals";
import MakeReferral from "@/pages/MakeReferral";
import RedeemPoints from "@/pages/RedeemPoints";
import BillEntry from "@/pages/BillEntry";
import RestaurantListing from "@/pages/RestaurantListing";
import InviteOthers from "@/pages/InviteOthers";
import RestaurantManager from "@/pages/RestaurantManager";
import RestaurantProfile from "@/pages/RestaurantProfile";
import RestaurantImages from "@/pages/RestaurantImages";
import RestaurantAmenities from "@/pages/RestaurantAmenities";
import OpeningHours from "@/pages/OpeningHours";
import RedemptionSchedule from "@/pages/RedemptionSchedule";
import RestaurantActivity from "@/pages/RestaurantActivity";
import ServerHome from "@/pages/ServerHome";
import ServerProfile from "@/pages/ServerProfile";
import ServerActivity from "@/pages/ServerActivity";
import ServerAdministration from "@/pages/ServerAdministration";
import ScanCustomerCode from "@/pages/ScanCustomerCode";
import ActiveRedeemers from "@/pages/ActiveRedeemers";
import ActiveReferrals from "@/pages/ActiveReferrals";
import RedeemEntry from "@/pages/RedeemEntry";
import Admin from "@/pages/Admin";
import RestaurantDetails from "@/pages/RestaurantDetails";
import TermsAndConditions from "@/pages/TermsAndConditions";
import RollToken from "@/pages/RollToken";
import ActiveRollers from "@/pages/ActiveRollers";
import UserHome from "@/pages/UserHome";
import Settings from "@/pages/Settings";
import SimpleSignupPage from "@/pages/SimpleSignupPage";
import ScanMessage from "@/pages/ScanMessage";
import ReferralAuth from "@/pages/ReferralAuth";
import ReferralQR from "@/pages/ReferralQR";
import SharePoints from "@/pages/SharePoints";
 
import { CreateInvite } from "@/components/simple-auth/CreateInvite";
 
import { StandalonePasswordReset } from "@/components/auth/StandalonePasswordReset";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<StandalonePasswordReset />} />
      <Route path="/user-home" element={<UserHome />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/my-referrals" element={<MyReferrals />} />
      <Route path="/make-referral" element={<MakeReferral />} />
      <Route path="/redeem-points" element={<RedeemPoints />} />
      <Route path="/bill-entry" element={<BillEntry />} />
      <Route path="/restaurant-listing/:id" element={<RestaurantListing />} />
      <Route path="/invite-others" element={<InviteOthers />} />
      <Route path="/restaurant-manager" element={<RestaurantManager />} />
      <Route path="/restaurant-profile" element={<RestaurantProfile />} />
      <Route path="/restaurant-images" element={<RestaurantImages />} />
      <Route path="/restaurant-amenities" element={<RestaurantAmenities />} />
      <Route path="/opening-hours" element={<OpeningHours />} />
      <Route path="/redemption-schedule" element={<RedemptionSchedule />} />
      <Route path="/restaurant-activity" element={<RestaurantActivity />} />
      <Route path="/server-home" element={<ServerHome />} />
      <Route path="/server-profile" element={<ServerProfile />} />
      <Route path="/server-activity" element={<ServerActivity />} />
      <Route path="/server-administration" element={<ServerAdministration />} />
      <Route path="/scan-customer-code" element={<ScanCustomerCode />} />
      <Route path="/active-redeemers" element={<ActiveRedeemers />} />
      <Route path="/active-referrals" element={<ActiveReferrals />} />
      <Route path="/redeem-entry/:id" element={<RedeemEntry />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/restaurant-details" element={<RestaurantDetails />} />
      <Route path="/restaurant-details/:restaurantId" element={<RestaurantDetails />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/roll-token" element={<RollToken />} />
      <Route path="/active-rollers" element={<ActiveRollers />} />
      <Route path="/signup" element={<SimpleSignupPage />} />
      <Route path="/scan" element={<ScanMessage />} />
      <Route path="/referral-auth" element={<ReferralAuth />} />
      <Route path="/referral-qr/:id" element={<ReferralQR />} />
      <Route path="/share-points" element={<SharePoints />} />
      
      <Route path="/create-invite" element={<div className="min-h-screen flex items-center justify-center bg-background p-4"><CreateInvite /></div>} />
    </Routes>
  );
};

export default AppRoutes;
