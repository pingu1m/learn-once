import { TopMenu } from "./TopMenu";
import { LeftSidebar } from "./LeftSidebar";
import {Route, Routes} from "react-router-dom";
import NotesPage from "../../pages/NotesPage.tsx";
import CardsPage from "../../pages/CardsPage.tsx";
import RefPage from "@/pages/RefPage.tsx";
// import CardsPage from "../../pages/CardsPage.js";
// import NotesPage from "../../pages/NotesPage.js";
// import {Route, Routes} from "react-router-dom";

const NoMatch = () => {
    return (<p>There's nothing here: 404!</p>);
};

function Dashboard() {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
            <div className="hidden lg:block border-r bg-gray-100/40 dark:bg-gray-800/40">
                <div className="flex h-full flex-col gap-2">
                    <TopMenu/>
                    <LeftSidebar/>
                </div>
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-4 p-4 lg:p-6">
                <Routes>
                    <Route index element={<NotesPage />} />
                    <Route path="notes" element={<NotesPage/>}/>
                    <Route path="cards" element={<CardsPage/>}/>
                    <Route path="ref" element={<RefPage/>}/>
                    <Route path="*" element={<NoMatch />} />
                </Routes>
            </div>
        </div>
    );
}

export default Dashboard;