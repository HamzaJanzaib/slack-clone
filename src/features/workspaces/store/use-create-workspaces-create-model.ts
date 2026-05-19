import { atom, useAtom } from "jotai";

const modalState = atom(false);

export const useCreateWorkspaceModel = () => {
    const [isOpen, setIsOpen] = useAtom(modalState);

    return { isOpen, setIsOpen: (value: boolean) => setIsOpen(value) };
};
