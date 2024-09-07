import {Route, Routes} from "react-router-dom";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import * as React from "react";
import {Notes} from "@/pages/notes/notes.tsx";
import {Sessions} from "@/pages/sessions/sessions.tsx";
import {Top} from "@/components/layout/top.tsx";

const NoMatch = () => {
    return (<p>There's nothing here: 404!</p>);
};

function Main() {
    return (
        <TooltipProvider delayDuration={0}>
            <Routes>
                <Route index element={<Notes/>}/>
                <Route path="notes" element={<Notes/>}/>
                <Route path="sessions" element={<Sessions/>}/>
                <Route path="*" element={<NoMatch/>}/>
            </Routes>
        </TooltipProvider>
    )
}

export default Main;