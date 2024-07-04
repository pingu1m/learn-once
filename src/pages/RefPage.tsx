// import { cookies } from "next/headers"
// import Image from "next/image"
import {accounts, mails} from "@/data.tsx";
import {Notes} from "@/pages/notes/notes.tsx";

// import { Mail } from "@/app/(app)/examples/mail/components/mail"
// import { accounts, mails } from "@/app/(app)/examples/mail/data"

export default function RefPage() {
    // const layout = cookies().get("react-resizable-panels:layout")
    // const collapsed = cookies().get("react-resizable-panels:collapsed")

    // const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    // const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
    const defaultLayout = undefined
    const defaultCollapsed = undefined

    return (
        <Notes
            accounts={accounts}
            mails={mails}
            defaultLayout={defaultLayout}
            defaultCollapsed={defaultCollapsed}
            navCollapsedSize={4}
        />
    )
}