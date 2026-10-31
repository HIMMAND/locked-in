import { useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowUpRight, LockKeyhole } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export function Astronaut({
  color = "mint",
  size = 44,
  hat = false,
}: {
  color?: string;
  size?: number;
  hat?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 70"
      aria-hidden="true"
      className={`astronaut ${color}`}
    >
      <path
        d="M12 30H9a5 5 0 0 0-5 5v18a5 5 0 0 0 5 5h8"
        fill="var(--suit-dark)"
        stroke="var(--suit-outline)"
        strokeWidth="3"
      />
      <path
        d="M14 62V27C14 13 23 7 35 7s21 9 21 23v32H41V51H29v11Z"
        fill="var(--suit)"
        stroke="var(--suit-outline)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 43v16h10V49h15v10h9V38"
        fill="var(--suit-dark)"
        opacity=".3"
      />
      <rect
        x="29"
        y="21"
        width="30"
        height="18"
        rx="8"
        fill="#dceff4"
        stroke="var(--suit-outline)"
        strokeWidth="3.5"
      />
      <path
        d="M35 25h14"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {hat && (
        <path
          d="m22 10-3-9 11 5 6-6 5 8 10-4-3 10Z"
          fill="#edc469"
          stroke="var(--suit-outline)"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
export function Brand() {
  return (
    <a className="brand" href="#today" aria-label="Locked In home">
      <span className="brand-icon">
        <LockKeyhole size={19} />
      </span>
      <span>
        LOCKED IN<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
export function AvatarStack({ count = 4 }: { count?: number }) {
  return (
    <div className="avatar-stack">
      {["mint", "lilac", "peach", "blue"].slice(0, count).map((c) => (
        <span key={c} className={`avatar ${c}`}>
          <Astronaut color={c} size={29} />
        </span>
      ))}
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal"
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <div className="modal-top">
            <span className="eyebrow">LOCKED IN / CREW SPACE</span>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Title className="display modal-title">{title}</Dialog.Title>
          <Dialog.Description className="muted">
            {description}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function SectionTitle({
  title,
  href,
  action = "View all",
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {href && (
        <a className="text-link" href={href}>
          {action}
          <ArrowUpRight size={15} />
        </a>
      )}
    </div>
  );
}
export function Vault({
  days = 6,
  className = "",
}: {
  days?: number;
  className?: string;
}) {
  return (
    <img
      className={`vault ${className}`}
      src={`/art/vault-${Math.min(7, Math.max(0, days))}.svg`}
      width="640"
      height="390"
      alt={`A seven-slot streak vault with ${Math.min(7, days)} daily tokens filled`}
    />
  );
}
