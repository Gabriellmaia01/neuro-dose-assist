import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--nd-surface)] group-[.toaster]:text-[var(--nd-text)] group-[.toaster]:border-[var(--nd-border)] group-[.toaster]:shadow-[var(--nd-shadow-sm)]",
          description: "group-[.toast]:text-[var(--nd-text-secondary)]",
          actionButton: "group-[.toast]:bg-[var(--nd-primary)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--nd-muted)] group-[.toast]:text-[var(--nd-label)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
