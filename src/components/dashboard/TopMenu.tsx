import Link from "../ui/link"
import { StickyNoteIcon, WalletCardsIcon, CheckIcon } from "./icons";

export function TopMenu() {
  return (
    <div className="flex h-16 items-center border-b px-6">
      <div className="flex items-center justify-between w-full">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <StickyNoteIcon className="h-6 w-6" />
        </Link>
        <div className="flex items-center gap-4 border-l pl-4">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <WalletCardsIcon className="h-6 w-6" />
          </Link>
          <div className="h-6 border-l pl-4" />
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <CheckIcon className="h-6 w-6" />
          </Link>
          <div className="h-6 border-l pl-4" />
          {/* <ThemeSwitch />  */}
        </div>
      </div>
    </div>
  )
}