"use client";

import { createTheme, Switch, ThemeProvider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { WatchlistDisplay } from "./watchlists";

const localStorageIdentifier = "localAlertsData";


//TODO: Undo Functionality
// Just save localData states somewhere, go backwards/forwards when needed
//
const sharedInputClasses = "w-full border rounded-md p-1 px-3";
type DisplaySelection = "alerts" | "watchlist" | "rgb-found"
export default function Home() {
    const [display, setDisplay] = useState("alerts");

    return <ThemeProvider theme={theme}>
        <div className="h-9/12 flex flex-col dark:border-white border-black ">
            <h2 className="text-3xl font-semibold shrink-0 pb-4 ">Rust Scout Configuration 
            </h2>
            <div className="w-full flex items-center justify-center dark:text-white dark:border-white mb-4">
            <ToggleButtonGroup 
                    color="primary"
                exclusive
                value={display}
                onChange={(event,newAlignment) => {
                        setDisplay(newAlignment)
                    }}>

                <ToggleButton value="alerts">Alerts</ToggleButton>
                <ToggleButton value="watchlist">Watchlist</ToggleButton>
                <ToggleButton value="rgb-found">RGB Found</ToggleButton>
            </ToggleButtonGroup>
            </div>
            <div className={display == "alerts" ? "" : "hidden" }>
                <AlertsDisplay />
            </div>
            <div className={display == "watchlist" ? "" : "hidden"}>
                <WatchlistDisplay />
            </div>
        </div>
    </ThemeProvider>
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function AlertsDisplay() {
    const [localData, setLocalData] = useState<Array<AlertData>>([]);

    useEffect(() => {
        let storedData = localStorage.getItem(localStorageIdentifier);
        if (storedData)
            setLocalData(JSON.parse(storedData))
        else
            setLocalData([])
    }, [])


    function saveData(alertData: Array<AlertData>) {
        localStorage.setItem(localStorageIdentifier, JSON.stringify(localData));
    }
    useEffect(() => {
        console.log(JSON.stringify(localData));
        localStorage.setItem(localStorageIdentifier, JSON.stringify(localData));
    }, [localData])

    function addNewAlert() {
        let newId = localData.length == 0 ? 1 : (localData[localData.length - 1].id + 1);
        setLocalData([...localData, {
            id: newId,
            alertName: "",
            triggers: [],
            title: "",
            description: "",
            color: 0,
            checkButton: false,
            url: ""
        }])
    }


    function cardDeleteHandler(deletedCardId: number) {
        setLocalData(localData.filter(cardData => cardData.id != deletedCardId));
    }

    function cardSaveHandler(savedCard: AlertData) {
        let tempCards = localData;
        let savedCardIndex = localData.findIndex(card => card.id == savedCard.id);
        tempCards[savedCardIndex] = savedCard;
        console.log(savedCard, tempCards)
        saveData(tempCards);
        setLocalData(tempCards);
    }

    return (
    <Fragment>
        <p className="inline-block py-1">Custom Alerts: <button className="border p-1 rounded-md" onClick={addNewAlert}>Add new</button></p>
        <div className="w-[600px] border-2 rounded-md grow p-2 pt-4 mb-4">
            {localData.map((cardData, index) => {
                return <Fragment key={index}>
                    <AlertCard cardIndex={index + 1} 
                        onSave={cardSaveHandler}
                        onDelete={cardDeleteHandler}
                        alertData={cardData}
                        key={index}/>
                    {index !== localData.length - 1 && <div className="w-full border-t border-4 my-4 rounded-md"></div>}
                </Fragment>
            })}
        </div>
    </Fragment>);
}

enum TriggerEvent {
    RecentKills = "recentKills", 
    RecentDeaths = "recentDeaths", 
    RecentKd = "recentKd", 
    RecentUniqueKills = "recentUniqueKills", 
    RecentUniqueDeaths = "recentUniqueDeaths", 
    RecentCheatReports = "recentCheatReports", 
    RecentAbusiveReports = "recentAbusiveReports", 
    RecentUniqueCheatReports = "recentUniqueCheatReports", 
    RecentUniqueAbusiveReports = "recentUniqueAbusiveReports",
}

enum LogicOperator {
    GreaterThan = "greater-than",  
    LessThan = "less-than", 
    GreaterThanOrEqual = "greater-than-or-equal", 
    LessThanOrEqual = "less-than-or-equal"
}
type AlertCardProps = {
    onDelete: (id: number) => void,
    onSave: (cardData: AlertData) => void,
    alertData: AlertData,
    cardIndex: number,
}
type AlertData = {
    id: number,
    alertName: string,
    triggers: Array<Trigger>
    title: string,
    description: string,
    color: number,
    checkButton: boolean,
    url: string,
}

export function AlertCard(props: AlertCardProps) {
    const [localCardData, setLocalCardData] = useState<AlertData>(props.alertData);
    const [localDataChanged, setLocalDataChanged] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if(!localDataChanged) setLocalDataChanged(true);

        setLocalCardData((prev) => ({
          ...prev,
          [name]: type === "number" ? Number(value) : value,
        }));
    };

    useEffect(() => {
        setLocalCardData(props.alertData);
    }, [props.alertData])

    return <div className="flex flex-col gap-1">
        <h3 className="flex flex-row gap-2 items-center font-bold text-lg">
            Alert #{props.cardIndex}:&nbsp;
            <button 
                className="border rounded-md p-1" 
                onClick={() => {
                    props.onDelete(props.alertData.id)
                }}>
                Trash
            </button>
            <button
                className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                onClick={() => {
                    props.onSave(localCardData);
                    setLocalDataChanged(false);
                }}>
                Save
            </button>
            <button
                className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                onClick={() => { 
                    setLocalCardData(props.alertData); 
                    setLocalDataChanged(false);
                }}
                >
                Cancel
            </button>
        </h3>
        <label>Alert Name:</label>
        <input 
            className={sharedInputClasses} 
            placeholder="The name of your alert"
            onChange={handleChange}
            name="alertName"
            value={localCardData.alertName}
            />
        <TriggerList 
            triggers={localCardData.triggers}
            updateTriggerList={(triggers) => {
                setLocalDataChanged(true);
                setLocalCardData({
                    ...localCardData,
                    triggers: triggers
                })
            }}
        />
        <h3 className="inline-block font-bold">
            Embed Information:
        </h3>
        <label>Title:</label>
        <input 
            name="title"
            onChange={handleChange}
            value={localCardData.title}
            className={sharedInputClasses} 
            placeholder="Title of alert..."
        />
        <label>Description:</label>
        <input 
            name="description"
            onChange={handleChange}
            value={localCardData.description}
            className={sharedInputClasses}
            placeholder="Description of alert..."
        />
        <label>Color:</label>
        <input 
            name="color"
            type="number"
            onChange={handleChange}
            value={localCardData.color}
            className={sharedInputClasses}
            placeholder="Description of alert..."
        />
        <label>URL:</label>
        <input
            name="url"
            onChange={handleChange}
            value={localCardData.url}
            className={sharedInputClasses}
            placeholder="http://example.com"
        />
        <div className="flex flex-wrap gap-2 items-center">
            <label>Include a 'Check' button?</label>
            <Switch 
                checked={localCardData.checkButton} 
                onChange={
                    (val) => setLocalCardData({ ...localCardData, checkButton: val.target.checked })
                }
            />
        </div>
    </div>;
}

type Trigger = {
    triggerEvent: TriggerEvent,
    triggerCount: number,
    triggerLogicOperator: LogicOperator
}

type TriggerListProps = {
    triggers: Array<Trigger>
    updateTriggerList: (triggers: Array<Trigger>) => void,
}
const logicOperators = Object.entries(LogicOperator);
const triggerEvents = Object.entries(TriggerEvent);
function TriggerList(props: TriggerListProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value, type } = e.target;

        let triggersCopy = props.triggers;
        (triggersCopy[index] as any)[name] = type === "number" ? Number(value) : value;
        
        props.updateTriggerList(triggersCopy);
    };

    return <div className="border m-2 rounded-md p-2 flex flex-col gap-2">
        <h3 className="font-semibold flex gap-2 items-center">
            Trigger List
            <button 
                className="border rounded-md p-1"
                onClick={() => props.updateTriggerList([...props.triggers, { triggerLogicOperator: LogicOperator.LessThan, triggerCount: 0, triggerEvent: TriggerEvent.RecentKills}])}
            >
                Add Trigger
            </button>
        </h3>
        {
            props.triggers.map((trigger, index) => {
                return <Fragment key={index}>
                    <div className="w-full flex flex-row gap-2">
                        <button className="border rounded-md p-2">Trash</button>
                        <select className={sharedInputClasses}
                            onChange={(event) => {
                                let triggersCopy = props.triggers;
                                triggersCopy[index].triggerEvent = TriggerEvent[event.target.value as keyof typeof TriggerEvent]
                                props.updateTriggerList(triggersCopy)
                            }}
                            value={trigger.triggerEvent}
                        >
                            { triggerEvents.map(([triggerEvent, triggerEventValue], index) => {
                                return <option 
                                    key={index}
                                    value={triggerEventValue} 
                                    className="dark:bg-neutral-800 ">
                                    {triggerEvent.toString()}
                                </option>
                            })}
                        </select>
                    </div>
                    <div className="w-full flex flex-row gap-4">
                        <div className="w-1/2">
                            <label className="">Trigger Count:</label>
                            <input 
                                className={sharedInputClasses} 
                                placeholder="How many trigger events...?"
                                onChange={(e) => { handleChange(e, index)}}
                                type="number"
                                name="triggerCount"
                                value={trigger.triggerCount}
                            />
                        </div>
                        <div className="w-1/2">
                            <label>Trigger Logic Operator</label>
                            <select className={sharedInputClasses}
                                onChange={(event) => {
                                    let triggersCopy = props.triggers;
                                    triggersCopy[index].triggerLogicOperator = LogicOperator[event.target.value as keyof typeof LogicOperator];
                                    props.updateTriggerList(triggersCopy);
                                }}
                                value={trigger.triggerLogicOperator}
                            >
                                { logicOperators.map(([logicOperator, logicOperatorValue], index) => {
                                    return <option 
                                        key={index}
                                        value={logicOperatorValue} 
                                        className="dark:bg-neutral-800 ">
                                        {logicOperator.toString()}
                                    </option>
                                })}
                            </select>
                        </div>
                    </div>
                </Fragment>
            })
        }
    </div>
}
