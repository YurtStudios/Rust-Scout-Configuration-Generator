"use client";

import { createTheme, Switch, ThemeProvider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Fragment, useEffect, useState } from "react";

const localStorageIdentifier = "localAlertsData";


//TODO: Undo Functionality
// Just save localData states somewhere, go backwards/forwards when needed
//
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

    useEffect(() => {
        localStorage.setItem(localStorageIdentifier, JSON.stringify(localData));
    }, [localData])

    function addNewAlert() {
        let newId = localData.length == 0 ? 1 : (localData[localData.length - 1].id + 1);
        setLocalData([...localData, {
            id: newId,
            alertName: "",
            triggerEvent: TriggerEvent.RecentKd,
            triggerCount: 0,
            triggerLogicOperator: LogicOperator.LessThan,
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
    triggerEvent: TriggerEvent,
    triggerCount: number,
    triggerLogicOperator: LogicOperator,
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

    const sharedInputClasses = "w-full border rounded-md p-1 px-3";
    const logicOperators = Object.entries(LogicOperator);
    const triggerEvents = Object.entries(TriggerEvent);
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
        <label>Trigger Event:</label>
        <select className={sharedInputClasses}
            onChange={(event) => {
                setLocalCardData({
                    ...localCardData, 
                    triggerEvent: TriggerEvent[event.target.value as keyof typeof TriggerEvent]
                })
            }}
            value={props.alertData.triggerEvent}
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
        <div className="w-full flex flex-row gap-4">
            <div className="w-1/2">
                <label className="">Trigger Count:</label>
                <input 
                    className={sharedInputClasses} 
                    placeholder="How many trigger events...?"
                    onChange={handleChange}
                    type="number"
                    name="triggerCount"
                    value={localCardData.triggerCount}
                />
            </div>
            <div className="w-1/2">
                <label>Trigger Logic Operator</label>
                <select className={sharedInputClasses}
                    onChange={(event) => {
                        setLocalCardData({
                            ...localCardData, 
                            triggerLogicOperator: LogicOperator[event.target.value as keyof typeof LogicOperator]
                        })
                    }}
                    value={localCardData.triggerLogicOperator}
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
