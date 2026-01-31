import { useSearchParams } from "react-router-dom";
import { SimpleSignup } from "@/components/simple-auth/SimpleSignup";

const SimpleSignupPage = () => {
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get("invite");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SimpleSignup inviteId={inviteId || undefined} />
    </div>
  );
};

export default SimpleSignupPage;