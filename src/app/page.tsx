"use client";

import { Button, createTheme, Switch, ThemeProvider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ActionDispatch, Fragment, useEffect, useReducer, useState } from "react";
import { WatchlistDisplay, WatchlistData } from "./watchlists";
import { generateOutput, LogicOperator, TriggerEvent } from "./generate-json";
import { RgbData, RgbDisplay } from "./rgb-found";

const localStorageIdentifier = "localAlertsData";


//TODO: Undo Functionality
// Just save localData states somewhere, go backwards/forwards when needed
//
const sharedInputClasses = "w-full border rounded-md p-1 px-3";
type DisplaySelection = "alerts" | "watchlist" | "rgb-found"


type AlertStateTask = {
    type: "add"
} | {
    type: "delete",
    id: number 
} | {
    type: "edit",
    alertData: AlertData
} | {
    type: "set",
    alertsData: Array<AlertData>
}

function alertStateReducer(alertsState: Array<AlertData>, action: AlertStateTask) {
    let newAlertsState: Array<AlertData>;
    switch (action.type) {
        case "add": {
            let newId = alertsState.length == 0 ? 1 : (alertsState[alertsState.length - 1].id + 1);
            newAlertsState = [...alertsState, {
                id: newId,
                alertName: "",
                triggers: [],
                title: "",
                description: "",
                color: 0,
                checkButton: false,
                url: ""
            }]

        } break;
        case "delete": {
            newAlertsState = alertsState.filter(alertData => alertData.id != action.id)
        } break;
        case "edit": {
            newAlertsState = alertsState;
            let alertIndex = alertsState.findIndex(alert => alert.id == action.alertData.id);
            newAlertsState[alertIndex] = action.alertData;
        } break;
        case "set": {
            newAlertsState = action.alertsData;
        }
    }

    return newAlertsState;
}

export default function Home() {
    const [display, setDisplay] = useState("alerts");

    const [watchlist, setWatchlist] = useState<WatchlistData>();
    const [alertsState, dispatch] = useReducer(alertStateReducer, new Array<AlertData>());
    const [rgbState, setRgbState] = useState<RgbData>();
    const [parsedJson, setParsedJson] = useState("");
    const [jsonVisible, setJsonVisible] = useState(false);
    useEffect(() => {
        dispatch({
            type: "set",
            alertsData: getLocalAlertData()
        })
    }, [])

    function getLocalAlertData(): Array<AlertData> {
        let tempJsonStr = localStorage.getItem(localStorageIdentifier);
        if (tempJsonStr) return JSON.parse(tempJsonStr);
        return [];
    }


    return <ThemeProvider theme={theme}>
        <div className="h-9/12 flex flex-col dark:border-white border-black ">
            <h2 className="text-3xl font-semibold shrink-0 pb-4 ">Rust Scout Configuration &nbsp;
                <button 
                    className="border rounded-md p-2 text-2xl"
                    onClick={() => {
                        let jsonStr = JSON.stringify(generateOutput(watchlist, alertsState, rgbState))
                        if (jsonStr) {
                            setJsonVisible(true);
                            setParsedJson(jsonStr);
                        }
                    }}
                >
                    Parse JSON
                </button>
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
                <AlertsDisplay 
                    alertsData={alertsState} 
                    dispatch={dispatch}/>
            </div>
            <div className={display == "watchlist" ? "" : "hidden"}>
                <WatchlistDisplay savedWatchlistData={watchlist} setSavedWatchlistData={setWatchlist}/>
            </div>
            <div className={display == "rgb-found" ? "" : "hidden"}>
                <RgbDisplay savedRgbData={rgbState} setSavedRgbData={setRgbState}/>
            </div>
        </div>
        <div className={ jsonVisible ? "absolute inset-0 flex backdrop-blur-md items-center justify-center" : "hidden"} style={{ backgroundColor: "rgba(0,0,0,0.25)"}}>
            <div className="border rounded-md w-8/12 h-8/12 dark:bg-neutral-900">
                <div className="flex flex-row justify-between dark:bg-neutral-800 p-2 rounded-t-md">
                    <h2 className="text-2xl">JSON Output</h2>
                    <div className="flex">
                        <Button>Download</Button>
                        <Button>Copy</Button>
                        <Button onClick={() => {
                            setJsonVisible(false)
                        }}>Close</Button>
                    </div>
                </div>
                <div>
                    {parsedJson}
                </div>
            </div>
        </div>
    </ThemeProvider>
}

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

type AlertsDisplayProps = {
    alertsData: Array<AlertData>,
    dispatch: ActionDispatch<[AlertStateTask]>
};

function AlertsDisplay(props: AlertsDisplayProps) {

    function saveData(alertData: Array<AlertData>) {
        localStorage.setItem(localStorageIdentifier, JSON.stringify(alertData));
    }

    function addNewAlert() {
        let newId = props.alertsData.length == 0 ? 1 : (props.alertsData[props.alertsData.length - 1].id + 1);
        let addAction: AlertStateTask = { type: "add" };
        props.dispatch(addAction);
    }


    function cardDeleteHandler(deletedCardId: number) {
        props.dispatch({
            type: "delete",
            id: deletedCardId
        })
    }

    function cardSaveHandler(savedCard: AlertData) {
        let tempCards = props.alertsData;
        let savedCardIndex = props.alertsData.findIndex(card => card.id == savedCard.id);
        tempCards[savedCardIndex] = savedCard;
        console.log(savedCard, tempCards)
        saveData(tempCards);
    }

    return (
    <Fragment>
        <p className="inline-block py-1">Custom Alerts: <button className="border p-1 rounded-md" onClick={addNewAlert}>Add new</button></p>
        <div className="w-[600px] border-2 rounded-md grow p-2 pt-4 mb-4">
            {props.alertsData.map((cardData, index) => {
                return <Fragment key={cardData.id}>
                    <AlertCard cardIndex={index + 1} 
                        onSave={cardSaveHandler}
                        onDelete={cardDeleteHandler}
                        alertData={cardData}
                        key={cardData.id}/>
                    {index !== props.alertsData.length - 1 && <div className="w-full border-t border-4 my-4 rounded-md"></div>}
                </Fragment>
            })}
        </div>
    </Fragment>);
}

type AlertCardProps = {
    onDelete: (id: number) => void,
    onSave: (cardData: AlertData) => void,
    alertData: AlertData,
    cardIndex: number,
}
export type AlertData = {
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

export type Trigger = {
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
