"use client";

import { atom, useAtom } from "jotai";
import type { ModalSize } from "@/components/ui/modal";

type ModalState = {
  view: React.ReactNode;
  isOpen: boolean;
  customSize?: number;
  size?: ModalSize;
};

const modalAtom = atom<ModalState>({
  isOpen: false,
  view: null,
  customSize: 320,
  size: "sm",
});

export function useModal() {
  const [state, setState] = useAtom(modalAtom);

  const openModal = ({
    view,
    customSize,
    size,
  }: {
    view: React.ReactNode;
    customSize?: number;
    size?: ModalSize;
  }) => {
    setState({ ...state, isOpen: true, view, customSize, size });
  };

  const closeModal = () => setState({ ...state, isOpen: false });

  return { ...state, openModal, closeModal };
}
