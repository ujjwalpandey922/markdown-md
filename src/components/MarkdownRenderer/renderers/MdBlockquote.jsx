import React from "react";
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

const ALERT_TYPES = {
  NOTE: {
    title: "Note",
    icon: Info,
    borderClass: "border-blue-500",
    titleClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/10",
  },
  TIP: {
    title: "Tip",
    icon: Lightbulb,
    borderClass: "border-emerald-500",
    titleClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/10",
  },
  IMPORTANT: {
    title: "Important",
    icon: AlertCircle,
    borderClass: "border-purple-500",
    titleClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/10",
  },
  WARNING: {
    title: "Warning",
    icon: AlertTriangle,
    borderClass: "border-amber-500",
    titleClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/10",
  },
  CAUTION: {
    title: "Caution",
    icon: ShieldAlert,
    borderClass: "border-red-500",
    titleClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10 dark:bg-red-500/10",
  },
};

function extractAlert(children) {
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0)
    return { alertType: null, cleanedChildren: children };

  const firstRealChildIndex = childrenArray.findIndex(
    (c) => typeof c !== "string" || c.trim().length > 0
  );

  if (firstRealChildIndex === -1)
    return { alertType: null, cleanedChildren: children };

  const firstChild = childrenArray[firstRealChildIndex];

  // Case 1: Direct string child
  if (typeof firstChild === "string") {
    const match = firstChild.match(
      /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n?|\s+)?/i
    );
    if (!match) return { alertType: null, cleanedChildren: children };

    const alertType = match[1].toUpperCase();
    const remainingText = firstChild.slice(match[0].length);
    const cleanedChildren = [
      ...childrenArray.slice(0, firstRealChildIndex),
      remainingText,
      ...childrenArray.slice(firstRealChildIndex + 1),
    ].filter((c) => typeof c !== "string" || c.length > 0);

    return { alertType, cleanedChildren };
  }

  // Case 2: React Element child (e.g., <p>)
  if (React.isValidElement(firstChild)) {
    const paraChildren = React.Children.toArray(firstChild.props.children);
    const firstTextIndex = paraChildren.findIndex(
      (c) => typeof c === "string" && c.trim().length > 0
    );

    if (firstTextIndex === -1)
      return { alertType: null, cleanedChildren: children };

    const firstTextNode = paraChildren[firstTextIndex];
    const match = firstTextNode.match(
      /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n?|\s+)?/i
    );
    if (!match) return { alertType: null, cleanedChildren: children };

    const alertType = match[1].toUpperCase();
    const remainingText = firstTextNode.slice(match[0].length);

    const newParaChildren = [
      ...paraChildren.slice(0, firstTextIndex),
      remainingText,
      ...paraChildren.slice(firstTextIndex + 1),
    ].filter((c) => typeof c !== "string" || c.length > 0);

    const newFirstChild = React.cloneElement(
      firstChild,
      firstChild.props,
      newParaChildren.length === 1
        ? newParaChildren[0]
        : newParaChildren.length === 0
        ? null
        : newParaChildren
    );

    const cleanedChildren = [
      ...childrenArray.slice(0, firstRealChildIndex),
      newFirstChild,
      ...childrenArray.slice(firstRealChildIndex + 1),
    ];

    return { alertType, cleanedChildren };
  }

  return { alertType: null, cleanedChildren: children };
}

/**
 * Custom blockquote renderer that detects GitHub-flavored callout alerts
 * (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])
 * and renders them with modern alert styling and icons.
 */
export default function MdBlockquote({ children, ...rest }) {
  const { alertType, cleanedChildren } = extractAlert(children);

  if (!alertType) {
    return <blockquote {...rest}>{children}</blockquote>;
  }

  const config = ALERT_TYPES[alertType];
  const Icon = config.icon;

  return (
    <div
      className={`my-4 border-l-4 ${config.borderClass} ${config.bgClass} rounded-r-md p-4 not-italic`}
      data-testid={`alert-${alertType.toLowerCase()}`}
    >
      <div
        className={`flex items-center gap-2 font-semibold text-sm ${config.titleClass} mb-2`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{config.title}</span>
      </div>
      <div className="text-foreground text-sm space-y-2 [&>p]:m-0 [&>p+p]:mt-2">
        {cleanedChildren}
      </div>
    </div>
  );
}
