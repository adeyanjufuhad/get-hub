"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";

export function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "GH"
  );
}

/**
 * The user's profile photo, or their initials on their avatar colour when there is
 * no photo (or it fails to load).
 */
export function UserAvatar({
  user,
  className,
}: {
  user: Pick<User, "full_name" | "avatar_color" | "avatar_url">;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = user.avatar_url && user.avatar_url !== failedUrl ? user.avatar_url : "";

  return (
    <span
      translate="no"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden font-bold text-white",
        className
      )}
      style={{ backgroundColor: user.avatar_color || "#EA580C" }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          width={256}
          height={256}
          decoding="async"
          onError={() => setFailedUrl(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsOf(user.full_name)
      )}
    </span>
  );
}
