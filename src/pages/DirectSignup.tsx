import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

const DirectSignup = () => {
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteData, setInviteData] = useState<any>(null);

  useEffect(() => {
    console.log('DirectSignup component mounted!');
    console.log('Current URL:', window.location.href);
    console.log('DirectSignup page loaded with invite:', inviteId);
    
    if (inviteId) {
      checkInvite();
    } else {
      setMessage("No invite code provided. Please use a valid invite link.");
    }
  }, [inviteId]);

  const checkInvite = async () => {
    try {
      console.log('Checking invite:', inviteId);
      const { data, error } = await supabase
        .from('invites')
        .select('invite_type, restaurant_id, created_by')
        .eq('id', inviteId)
        .single();
      
      if (error || !data) {
        setMessage("Invalid invite link.");
        return;
      }
      
      setInviteData(data);
      setMessage(`You've been invited to join as a ${data.invite_type}!`);
      console.log('Invite data:', data);
    } catch (error) {
      console.error('Invite check error:', error);
      setMessage("Error checking invite.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData) {
      setMessage("Please use a valid invite link.");
      return;
    }

    setLoading(true);
    setMessage("Creating account...");

    try {
      console.log('Starting signup with data:', {
        email,
        invite_id: inviteId,
        invite_type: inviteData.invite_type,
        restaurant_id: inviteData.restaurant_id,
        created_by: inviteData.created_by
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            invite_id: inviteId,
            invite_type: inviteData.invite_type,
            restaurant_id: inviteData.restaurant_id,
            created_by: inviteData.created_by
          }
        }
      });

      if (error) throw error;

      console.log('Signup successful:', data);
      setMessage(`Account created successfully as ${inviteData.invite_type}! Redirecting...`);
      
      // Redirect to main app after successful signup
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      console.error('Signup error:', error);
      setMessage(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Sign Up for ReferdBy
        </h1>
        
        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            background: message.includes('Error') || message.includes('Invalid') 
              ? '#fef2f2' : message.includes('invited') || message.includes('successful')
              ? '#dcfce7' : '#fef3c7',
            color: message.includes('Error') || message.includes('Invalid')
              ? '#dc2626' : message.includes('invited') || message.includes('successful')
              ? '#166534' : '#92400e',
            border: `1px solid ${message.includes('Error') || message.includes('Invalid')
              ? '#fecaca' : message.includes('invited') || message.includes('successful')
              ? '#bbf7d0' : '#fed7aa'}`
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !inviteData}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || !inviteData ? '#9ca3af' : '#DB5D27',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading || !inviteData ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectSignup;