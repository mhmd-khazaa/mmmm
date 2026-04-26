import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { cn } from "@/lib/utils";

const modalStyles = {
  root: "fixed inset-0 z-[999] overflow-y-auto overflow-x-hidden",
  area: "flex min-h-screen flex-col items-center justify-center",
  overlay:
    "fixed inset-0 cursor-pointer bg-black bg-opacity-60 dark:bg-opacity-80 z-10 duration-300 ease-in-out data-[closed]:opacity-0",
  panel:
    "m-auto w-full break-words bg-background shadow-xl z-20 duration-300 ease-in-out data-[closed]:scale-95 data-[closed]:opacity-0",
  size: {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-[60%]",
    full: "max-w-full min-h-screen",
  },
  rounded: {
    none: "rounded-none",
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
  },
};

export type ModalSize = keyof typeof modalStyles.size;

export type ModalProps = {
  isOpen: boolean;
  onClose(): void;
  size?: ModalSize;
  noGutter?: boolean;
  rounded?: keyof typeof modalStyles.rounded;
  customSize?: number;
  overlayClassName?: string;
  containerClassName?: string;
  className?: string;
};

export function Modal({
  isOpen,
  onClose,
  children,
  noGutter,
  className,
  size = "md",
  rounded = "md",
  customSize,
  overlayClassName,
  containerClassName,
}: React.PropsWithChildren<ModalProps>) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={cn("rizzui-modal-root", modalStyles.root, className)}
    >
      <div
        className={cn(
          "rizzui-modal-area",
          modalStyles.area,
          size !== "full" && [!noGutter && "p-4 sm:p-5"]
        )}
      >
        <DialogBackdrop
          transition
          className={cn(
            "rizzui-modal-overlay",
            modalStyles.overlay,
            overlayClassName
          )}
        />
        <DialogPanel
          transition
          className={cn(
            "rizzui-modal-panel",
            modalStyles.panel,
            size !== "full" && modalStyles.rounded[rounded],
            !customSize && customSize !== 0 && modalStyles.size[size],
            containerClassName
          )}
          {...((customSize || customSize === 0) && {
            style: { maxWidth: `${customSize}px` || "inherit" },
          })}
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
