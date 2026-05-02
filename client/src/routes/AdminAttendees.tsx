import { useState } from "react";
import {
  useAllAttendees,
  useCreateAttendee,
  useSetAttendeeActive,
} from "../lib/hooks";
import { useToast } from "../components/Toast";

export function AdminAttendees() {
  const list = useAllAttendees();
  const createA = useCreateAttendee();
  const setActive = useSetAttendeeActive();
  const toast = useToast();
  const [name, setName] = useState("");

  const add = () => {
    const n = name.trim();
    if (!n || createA.isPending) return;
    if (list.data?.some((a) => a.name.toLowerCase() === n.toLowerCase())) {
      toast(`${n} is already on the list`);
      return;
    }
    createA.mutate(n, {
      onSuccess: () => {
        setName("");
        toast("Added");
      },
      onError: (e: any) => toast(e?.message ?? "Couldn't add"),
    });
  };

  const attendees = list.data ?? [];

  return (
    <div className="animate-slide-up">
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add person…"
          maxLength={40}
          className="flex-1 px-[14px] py-[11px] text-[14px] bg-white text-fg outline-none"
          style={{ border: "1px solid var(--border)", borderRadius: 10 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--fg)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim() || createA.isPending}
          className="px-4 py-[11px] text-[14px] font-bold cursor-pointer min-h-[44px]"
          style={{
            background: "var(--fg)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 10,
          }}
        >
          Add
        </button>
      </div>
      <div className="text-[11px] text-fg3 font-mono mb-2 tabular">
        {attendees.length} attendees · {attendees.filter((a) => a.active).length} active
      </div>
      <div className="flex flex-col gap-[6px]">
        {attendees.length === 0 && (
          <div className="text-[13px] text-fg3 text-center py-10">
            No one in the Disch yet.
          </div>
        )}
        {attendees.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between bg-white px-[14px] py-3"
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              opacity: a.active ? 1 : 0.55,
            }}
          >
            <span className="text-[14px] font-medium">{a.name}</span>
            <button
              type="button"
              onClick={() =>
                setActive.mutate({ id: a.id, active: !a.active })
              }
              className="bg-transparent text-[11px] cursor-pointer min-h-[32px] px-[10px]"
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: a.active ? "var(--fg2)" : "var(--accent)",
                fontWeight: 600,
              }}
            >
              {a.active ? "Set inactive" : "Reactivate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
