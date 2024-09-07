import {AccountSwitcher} from "@/components/layout/account-switcher.tsx";
import * as React from "react";
import {Menu} from "@/components/layout/menu.tsx";

export const Top = () => {
    return (
        <div className="grid gap-2 grid-cols-2 p-2 pl-0">
            <div className="col-span-2">
                {/*<AppSettings />*/}
                <Menu/>
            </div>
        </div>
    )
}