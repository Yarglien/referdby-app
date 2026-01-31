
import { Input } from "@/components/ui/input";

interface BillTotalInputProps {
  billTotal: string;
  onBillTotalChange: (value: string) => void;
}

export const BillTotalInput = ({ billTotal, onBillTotalChange }: BillTotalInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-primary">Enter Bill Total</label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={billTotal}
        onChange={(e) => onBillTotalChange(e.target.value)}
        placeholder="0.00"
        className="text-xl"
      />
    </div>
  );
};
