import { atom, useAtom } from "jotai"
import {Note, notes} from "@/data.tsx";

// import { Mail, mails } from "@/app/(app)/examples/mail/data"

type Config = {
    selected: Note["id"] | null
}

const configAtom = atom<Config>({
    selected: notes[0].id,
})

export function useMail() {
    return useAtom(configAtom)
}