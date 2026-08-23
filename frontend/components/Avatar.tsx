import { avatarColors } from "@/lib/data";

export default function Avatar({
  person,
  name,
  avatar,
  size = 32,
  ring = false,
}: {
  person?: string;
  name?: string;
  avatar?: string | null;
  size?: number;
  ring?: boolean;
}) {
  if (avatar) {
    return (
      <div 
        className={`shrink-0 overflow-hidden rounded-full ${ring ? "ring-2 ring-white" : ""}`}
        style={{ width: size, height: size }}
        title={name}
      >
        <img 
          src={avatar} 
          alt={name || "Avatar"} 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  let initials = "?";
  let color = "bg-gray-400";

  if (person && avatarColors[person]) {
    initials = avatarColors[person].initials;
    color = avatarColors[person].color;
  } else if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = name.substring(0, 2).toUpperCase();
    }
    
    // Generate a consistent color based on name string
    const colors = ["bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"];
    const charCode = name.charCodeAt(0) || 0;
    color = colors[charCode % colors.length];
  }

  return (
    <div
      className={`${color} ${ring ? "ring-2 ring-white" : ""} flex shrink-0 items-center justify-center rounded-full font-medium text-white`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name || initials}
    >
      {initials}
    </div>
  );
}
