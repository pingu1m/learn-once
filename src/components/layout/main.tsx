import {Route, Routes} from "react-router-dom";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import * as React from "react";
import {Notes} from "@/pages/notes/notes.tsx";
import {Sessions} from "@/pages/sessions/sessions.tsx";
import {ToastContainer} from "react-toastify";

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
            <ToastContainer />
            {/*<ToastContainer*/}
            {/*    position="bottom-right"*/}
            {/*    autoClose={5000}*/}
            {/*    hideProgressBar={false}*/}
            {/*    newestOnTop*/}
            {/*    closeOnClick*/}
            {/*    pauseOnFocusLoss={false}*/}
            {/*    draggable*/}
            {/*    pauseOnHover*/}
            {/*/>*/}
        </TooltipProvider>
    )
}

export default Main;