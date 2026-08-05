export default function MdLink({ href, children, ...rest }) {
  const isExternal = /^https?:\/\//i.test(href || "");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
