import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function MdImage({ src, alt, title, ...rest }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span
        className="my-3 inline-flex items-center gap-2 rounded border border-dashed border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
        role="img"
        aria-label={alt || "Broken image"}
      >
        <ImageOff size={14} />
        {alt || "image unavailable"}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      title={title || alt || undefined}
      loading="lazy"
      onError={() => setBroken(true)}
      {...rest}
    />
  );
}
