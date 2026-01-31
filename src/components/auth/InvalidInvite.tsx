export const InvalidInvite = () => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
    <div className="w-full max-w-md space-y-4 text-center">
      <h1 className="text-2xl font-bold">Invalid Invite</h1>
      <p className="text-muted-foreground">
        This invite has already been used or has expired. Please request a new invite from the restaurant or user who invited you.
      </p>
    </div>
  </div>
);