// Lightweight inline SVG icon set (stroke-based, consistent 1.7 width).
// Using SVG (never emoji) keeps icons crisp and theme-controlled.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
};

export function IconBag(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
export function IconGlobe(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}
export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
export function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4 0-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  );
}
export function IconSnapchat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2c2.4 0 4.3 1.9 4.4 4.3 0 .6 0 1.3-.1 1.9.3.2.7.3 1 .2.5-.2.8.5.4.9-.4.4-1 .6-1.4.9.4 1.4 1.5 3 3 3.4.4.1.4.6 0 .8-.6.3-1.4.4-1.8.9-.2.3.1.9-.4 1-.6.1-1.2-.3-1.9-.1-.6.2-1 .9-1.7 1.2-1.2.5-2.6.1-3.6-.6-.4-.3-.9-.3-1.3 0-1 .7-2.4 1.1-3.6.6-.7-.3-1.1-1-1.7-1.2-.7-.2-1.3.2-1.9.1-.5-.1-.2-.7-.4-1-.4-.5-1.2-.6-1.8-.9-.4-.2-.4-.7 0-.8 1.5-.4 2.6-2 3-3.4-.4-.3-1-.5-1.4-.9-.4-.4-.1-1.1.4-.9.3.1.7 0 1-.2-.1-.6-.1-1.3-.1-1.9C7.7 3.9 9.6 2 12 2Z" />
    </svg>
  );
}
export function IconFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
export function IconTikTok(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 3c.3 2 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v6.1a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.8Z" />
    </svg>
  );
}
export function IconSparkle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 15l-1.6-4L6 9.4l4.4-1.6L12 3Z" />
      <path d="M18 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </svg>
  );
}
export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}
export function IconHeart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.5-9-9.2C1.8 7.7 3.6 5 6.5 5 8.5 5 11 6.5 12 8c1-1.5 3.5-3 5.5-3 2.9 0 4.7 2.7 3.5 5.8C19 15.5 12 20 12 20Z" />
    </svg>
  );
}
export function IconLeaf(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 14" />
      <path d="M8 16c2-3 4-5 8-7" />
    </svg>
  );
}
export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
export function IconTruck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}
export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
    </svg>
  );
}
export function IconEdit(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h4L18 10l-4-4L4 16v4Z" />
      <path d="M13 5l4 4" />
    </svg>
  );
}
export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function IconEye(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconEyeOff(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3l18 18M10.5 10.7a2 2 0 0 0 2.8 2.8" />
      <path d="M9.4 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3M6.3 6.3A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.3-.6" />
    </svg>
  );
}
export function IconBell(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function IconBox(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l8 4-8 4-8-4 8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}
export function IconGear(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  );
}
export function IconArrow(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function IconBan(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </svg>
  );
}
export function IconKey(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l8 8M16 16l2-2M18.5 18.5l1.5-1.5" />
    </svg>
  );
}
export function IconSpinner(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
