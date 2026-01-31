
export const ActiveRollersEmptyState = () => {
  return (
    <div className="text-center py-8 border rounded-lg bg-muted/20">
      <p className="text-muted-foreground font-medium">No active roll tokens currently</p>
      <p className="text-sm text-muted-foreground mt-2">
        When customers scan and present their roll tokens, they'll appear here for processing
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        To get started, have a customer scan a roll token QR code, then have them present it at your restaurant
      </p>
    </div>
  );
};
