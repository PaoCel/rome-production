import type { CSSProperties, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
type AppIconProps = {
  name: AppIconName;
  className?: string;
  style?: CSSProperties;
};

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const icons = {
  dashboard: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 13.5V19h6v-5.5H4Z" />
      <path d="M14 5v14h6V5h-6Z" />
      <path d="M4 5v4.5h6V5H4Z" />
    </Svg>
  ),
  tasks: (props: IconProps) => (
    <Svg {...props}>
      <path d="M9 6h10" />
      <path d="M9 12h10" />
      <path d="M9 18h10" />
      <path d="m4 6 1 1 2-2" />
      <path d="m4 12 1 1 2-2" />
      <path d="m4 18 1 1 2-2" />
    </Svg>
  ),
  budget: (props: IconProps) => (
    <Svg {...props}>
      <path d="M6 7h10.5A3.5 3.5 0 0 1 20 10.5v0A3.5 3.5 0 0 1 16.5 14H8" />
      <path d="M6 11h9" />
      <path d="M6 7c-1.5 1.1-2.3 2.8-2.3 5s.8 3.9 2.3 5" />
      <path d="M17 18.5c-1.4.7-3 .9-4.7.5-2.7-.6-4.8-2.5-5.9-5" />
    </Svg>
  ),
  invoices: (props: IconProps) => (
    <Svg {...props}>
      <path d="M7 3.5h10a1 1 0 0 1 1 1V20l-3-1.5-3 1.5-3-1.5L6 20V4.5a1 1 0 0 1 1-1Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </Svg>
  ),
  locations: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  ),
  casting: (props: IconProps) => (
    <Svg {...props}>
      <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z" />
      <path d="m7 8 2-4" />
      <path d="m12 8 2-4" />
      <path d="m17 8 2-4" />
      <path d="M5 12h14" />
      <path d="m10.5 15 3 2-3 2v-4Z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  crew: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h7A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 15.5v-7Z" />
      <path d="m16 10 4-2.5v9L16 14" />
      <circle cx="8.2" cy="10.2" r="1.2" />
    </Svg>
  ),
  props: (props: IconProps) => (
    <Svg {...props}>
      <path d="M7 4.5c3.2 0 5 1.6 5 4.7 0 3.8-2.4 6.2-5 6.2s-5-2.4-5-6.2c0-3.1 1.8-4.7 5-4.7Z" />
      <path d="M17 6c3 0 4.5 1.5 4.5 4.3 0 3.3-2.1 5.5-4.5 5.5-1.3 0-2.5-.7-3.3-1.8" />
      <path d="M4.8 10.5c.7.7 1.5 1 2.2 1s1.5-.3 2.2-1" />
      <path d="M15.2 11.2c.6.5 1.2.8 1.8.8s1.2-.3 1.8-.8" />
    </Svg>
  ),
  production: (props: IconProps) => (
    <Svg {...props}>
      <path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3L12 3Z" />
      <path d="m4.5 7.6 7.5 4 7.5-4" />
      <path d="M12 12v8.5" />
    </Svg>
  ),
  risks: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 4 21 20H3L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  settings: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M18.6 13.8a7 7 0 0 0 .1-1.8l2-1.4-2-3.5-2.4 1a7.1 7.1 0 0 0-1.6-.9L14.4 4h-4.8l-.4 3.2a7.1 7.1 0 0 0-1.6.9l-2.4-1-2 3.5 2 1.4a7 7 0 0 0 0 1.8l-2 1.4 2 3.5 2.4-1c.5.4 1 .7 1.6.9l.4 3.2h4.8l.4-3.2c.6-.2 1.1-.5 1.6-.9l2.4 1 2-3.5-2.2-1.4Z" />
    </Svg>
  ),
  decisions: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 6.5V12l3.5 2" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
    </Svg>
  ),
  document: (props: IconProps) => (
    <Svg {...props}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </Svg>
  ),
  pdf: (props: IconProps) => (
    <Svg {...props}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 15h7" />
      <path d="M8.5 12h7" />
      <path d="M8.5 18h4" />
    </Svg>
  ),
  play: (props: IconProps) => (
    <Svg {...props}>
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  close: (props: IconProps) => (
    <Svg {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  ),
  check: (props: IconProps) => (
    <Svg {...props}>
      <path d="m5 12.5 4 4L19 7" />
    </Svg>
  ),
  more: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  ),
  pin: (props: IconProps) => (
    <Svg {...props}>
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  ),
};

export type AppIconName = keyof typeof icons;

const rasterIcons = new Set<AppIconName>([
  'dashboard',
  'tasks',
  'budget',
  'invoices',
  'locations',
  'casting',
  'crew',
  'props',
  'production',
  'risks',
  'settings',
  'decisions',
  'document',
  'pdf',
]);

export default function AppIcon({ name, className, style }: AppIconProps) {
  if (rasterIcons.has(name)) {
    return (
      <img
        src={`/icons/ai/${name}.png`}
        alt=""
        aria-hidden="true"
        className={className}
        style={style}
        draggable={false}
      />
    );
  }

  const Icon = icons[name];
  return <Icon className={className} style={style} />;
}
