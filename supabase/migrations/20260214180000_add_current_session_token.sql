-- Single-session enforcement: store hash of the active session's refresh token
-- When user logs in on a new device, we update this. Other devices will detect
-- the mismatch and sign out.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_session_token text;
