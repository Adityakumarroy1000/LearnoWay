import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SkillBot({ period, onDone }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-dashed p-4 rounded-xl my-6">
      <Button onClick={() => setOpen(!open)}>Practice Bot</Button>

      {open && (
        <div className="mt-4 animate-pulse">
          <p>Bot for this period: {period.title}</p>
          <Button onClick={onDone}>Mark Done</Button>
        </div>
      )}
    </div>
  );
}
