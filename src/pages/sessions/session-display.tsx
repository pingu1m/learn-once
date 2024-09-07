// @ts-nocheck
import {useDeleteSession, useStartSession} from "@/components/notes/noteApi.ts";
import {Session} from "@/types/Session.ts";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {invoke} from "@tauri-apps/api/core";
import useAppStore from "@/store/useAppStore.ts";

async function endStudySession(session: Session) {
    try {
        await invoke("finish_study_session", {session: session});
        // Optionally, navigate or show a completion message
    } catch (error) {
        console.error("Error ending study session:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
    }
}

const SessionRun: React.FC<{ sessionId: number, setStart: any }> = ({sessionId, setStart}) => {
    const {data: session, isLoading, isError, error} = useStartSession(sessionId);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [cardsBag, setCardsBag] = useState<any[]>([]);
    const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
    const [hasProgress, setHasProgress] = useState(false);


    // Handle card flip
    const handleFlip = () => {
        setShowAnswer(!showAnswer);
    };

    // Handle show hint
    const handleShowHint = () => {
        setShowHint(true);
    }

    useEffect(() => {
        if (session) {
            setCardsBag(session?.cards_bag)
        }
    }, [session]);

    // Handle user confidence selection
    const handleConfidence = async (confidence: string) => {
        setHasProgress(true);
        console.log(confidence);
        // Update card in local state
        const currCard = session.cards_bag[currentCardIndex];
        const updatedCard = {
            ...currCard,
            learn_status: confidence,
            session_count: session.session_count
        }
        console.log("updated card", updatedCard)
        const cardIndexInBag = cardsBag.findIndex(card => card.id === updatedCard.id);
        console.log("card index", cardIndexInBag)
        if (cardIndexInBag !== -1) {
            const updatedCardsBag = [...cardsBag];
            updatedCardsBag[cardIndexInBag] = updatedCard;
            console.log("up card bag", updatedCardsBag);
            setCardsBag(updatedCardsBag);
        } else {
            setCardsBag([...cardsBag, updatedCard]);
        }

        if (currentCardIndex < cardsBag.length - 1) {
            handleSessionUpdate("next")
        } else {
            setShowEndSessionDialog(true);
        }
    };

    useEffect(() => {
        console.log("cards bag", cardsBag);
    }, [cardsBag]);

    if (isLoading) {
        return <div>Loading session details...</div>;
    }

    if (isError) {
        return <div>Error fetching session: {error?.message}</div>;
    }
    /* <div className="group"> */
    // <div className="size-20 bg-red-500 transition-all duration-500 [transform-style:preserve-3d]
    // group-hover:[transform:rotateY(180deg)]">

    const handleSessionUpdate = async (event_type: string) => {
        switch (event_type) {
            case "end":
                // implement session end
                console.log("Ending session")
                setShowEndSessionDialog(false)
                console.log(cardsBag)
                console.log(hasProgress)
                setStart(false)
                if (hasProgress) {
                    let res = await endStudySession({
                        ...session,
                        cards_bag: cardsBag
                    });
                    console.log("finish session res", res)
                }
                break
            case "prev":
                if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                    setShowAnswer(false);
                    setShowHint(false);
                }
                break
            case "next":
                if (currentCardIndex < session.cards_bag.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                    setShowAnswer(false);
                    setShowHint(false);
                }
                break
            case "card-hard":
                handleConfidence("LowConfidence");
                break;
            case "card-medium":
                handleConfidence("MediumConfidence");
                break;
            case "card-easy":
                handleConfidence("HighConfidence");
                break;
            case "card-learned":
                handleConfidence("Learned");
                break;
        }
    }

    return (
        <>
            <div
                className="flex-1 whitespace-pre-wrap p-4 text-sm card flex flex-col items-center justify-center">
                <Card className={`card-content w-[450px] ${showAnswer ? 'flipped' : 'not-flipped'}`}>
                    <div className="front">
                        <CardHeader>
                            <CardTitle
                                className="text-4xl">Card {currentCardIndex + 1} of {session?.cards_bag.length}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                {session?.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label className="font-bold" htmlFor="name">Title</Label>
                                    <h3>{session?.cards_bag[currentCardIndex].title}</h3>
                                </div>
                                <div className="grid gap-3">
                                    {showHint ? <>
                                        <Label className="font-bold" htmlFor="description">Hint</Label>
                                        <p>{session?.cards_bag[currentCardIndex].hint}</p>
                                    </> : ""}
                                    {!showAnswer && <Button size="sm"
                                                            variant="secondary"
                                                            onClick={handleShowHint}
                                                            disabled={showHint}>
                                        Hint - click to reveal
                                    </Button>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center border-t p-4">
                            <Button onClick={handleFlip}>FLIP</Button>
                        </CardFooter>
                    </div>
                    <div className="back">
                        <CardHeader>
                            <CardTitle
                                className="text-4xl">Card {currentCardIndex + 1} of {session?.cards_bag.length}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                {session?.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label className="font-bold" htmlFor="name">Description</Label>
                                    <p>{session?.cards_bag[currentCardIndex].description}</p>
                                </div>
                                <div className="grid gap-3">
                                    <Label className="font-bold" htmlFor="description">Example</Label>
                                    <pre id="gfg"
                                         className="bg-slate-100 p-2">{session?.cards_bag[currentCardIndex].example}</pre>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center border-t p-4">
                            <Button variant="secondary" onClick={handleFlip}>FLIP</Button>
                        </CardFooter>

                    </div>
                </Card>
            </div>
            <Separator className="mt-auto"/>
            <div className="p-4 flex justify-between">
                <div>
                    <Button className="mr-2"
                            size="sm"
                            disabled={currentCardIndex === 0}
                            onClick={() => handleSessionUpdate("prev")}>Prev</Button>
                    <Button
                        size="sm"
                        disabled={currentCardIndex === session?.cards_bag.length - 1}
                        onClick={() => handleSessionUpdate("next")}>Next</Button>
                </div>
                <div className="space-x-2">
                    <Button size="sm" onClick={() => handleSessionUpdate("card-easy")}>Easy</Button>
                    <Button size="sm" onClick={() => handleSessionUpdate("card-medium")}>Medium</Button>
                    <Button size="sm" onClick={() => handleSessionUpdate("card-hard")}>Hard</Button>
                    <Button size="sm" onClick={() => handleSessionUpdate("card-learned")}>Learned</Button>
                </div>
                <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">End Session</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-4xl">You have done it. Congrats</DialogTitle>
                            <DialogDescription>
                                Keep up the hard work.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-start">
                            <Button
                                onClick={() => handleSessionUpdate("end")}
                                type="submit" className="px-3">
                                End study session
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
        ;
};

interface Props {
    editingSession: Session | null
}

export function SessionDisplay({editingSession}: Props) {
    const [start, setStart] = useState<boolean>(false)
    const {mutate: deleteSession} = useDeleteSession()
    const setEditingSession = useAppStore(state => state.setEditingSession);

    const handleDeleteNote = (id: number) => {
        deleteSession(id)
        setEditingSession(null)
    }

    useEffect(() => {
        setStart(false)
    }, [editingSession]);

    let start_els = (
        <div className="flex h-full flex-row justify-center items-center">
            <div className="w-[550px] text-center">
                {editingSession ?
                    <>
                        <Button className="mr-2" variant="default" size="lg" onClick={() => setStart(true)}>
                            Start Session - {editingSession?.id}
                        </Button>
                        <Button className="mr-2" variant="default" size="lg"
                                onClick={() => handleDeleteNote(editingSession?.id)}>
                            Delete Study Session
                        </Button>
                    </>
                    :
                    <span className="text-2xl">No session selected</span>
                }
            </div>
        </div>
    )

    let main_els = (
        <div className="flex h-full flex-col">
            {editingSession ? (
                <div className="flex flex-1 flex-col">
                    {editingSession && <SessionRun setStart={setStart} sessionId={editingSession.id}/>}
                </div>
            ) : (<span>t</span>)}
        </div>
    )

    return start ? main_els : start_els;
}