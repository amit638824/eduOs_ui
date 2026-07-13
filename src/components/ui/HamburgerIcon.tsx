interface HamburgerIconProps {
  open?: boolean;
}

/** Modern 3-line hamburger (animates to X when open) */
export default function HamburgerIcon({ open = false }: HamburgerIconProps) {
  return (
    <span className={`sca-hamburger${open ? ' sca-hamburger--open' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
