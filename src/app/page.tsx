"use client";

import { Switch } from "@mui/material";
import { Fragment, useEffect, useState } from "react";

export default function Home() {
    const [localData, setLocalData] = useState<Array<CardData>>([
        {
            id: 0, 
            alertName: "Test Alert",
            triggerEvent: TriggerEvent.RecentKills,
            triggerCount: 2,
            triggerLogicOperator: LogicOperator.GreaterThan,
            title: "Test Title",
            description: "Example Description",
            color: 532,
            checkButton: false,
        }
    ]);

    function addNewAlert() {
        let newId = localData[localData.length - 1].id + 1;
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
        }])
    }

    return (<div className="h-9/12 flex flex-col dark:border-white border-black ">
        <h2 className="text-3xl font-semibold shrink-0 pb-4">Rust Scout Configuration</h2>
        <p className="inline-block py-1">Custom Alerts: <button className="border p-1 rounded-md" onClick={addNewAlert}>Add new</button></p>
        <div className="w-[600px] border-2 rounded-md grow p-2 pt-4">
            {localData.map((cardData, index) => {
                return <Fragment key={index}>
                    <Card cardIndex={index + 1} 
                        cardData={cardData}
                        key={index}/>
                    {index !== localData.length - 1 && <div className="w-full border-t border-4 my-4 rounded-md"></div>}
                </Fragment>
            })}
        </div>
    </div>);
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
type CardProps = {
    cardData: CardData,
    cardIndex: number,
}
type CardData = {
    id: number,
    alertName: string,
    triggerEvent: TriggerEvent,
    triggerCount: number,
    triggerLogicOperator: LogicOperator,
    title: string,
    description: string,
    color: number,
    checkButton: boolean,
}

export function Card(props: CardProps) {
    const [localCardData, setLocalCardData] = useState<CardData>(props.cardData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        setLocalCardData((prev) => ({
          ...prev,
          [name]: type === "number" ? Number(value) : value,
        }));
    };

    useEffect(() => {
        setLocalCardData(props.cardData);
    }, [props.cardData])

    const sharedInputClasses = "w-full border rounded-md p-1 px-3";
    const logicOperators = Object.entries(LogicOperator);
    const triggerEvents = Object.entries(TriggerEvent);
    return <form className="flex flex-col gap-1">
        <h3 className="inline-block font-bold">
            Alert #{props.cardIndex}: <button className="border rounded-md p-1">Trash</button>
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
                console.log(event.target.value);
                setLocalCardData({
                    ...localCardData, 
                    triggerEvent: TriggerEvent[event.target.value as keyof typeof TriggerEvent]
                })
            }}
        >
            { triggerEvents.map(([triggerEvent, triggerEventValue], index) => {
                return <option 
                    key={index}
                    value={triggerEventValue} 
                    selected={triggerEvent == localCardData.triggerEvent} 
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
                        console.log(event.target.value);
                        setLocalCardData({
                            ...localCardData, 
                            triggerLogicOperator: LogicOperator[event.target.value as keyof typeof LogicOperator]
                        })
                    }}
                >
                    { logicOperators.map(([logicOperator, logicOperatorValue], index) => {
                        return <option 
                            key={index}
                            value={logicOperatorValue} 
                            selected={logicOperator == localCardData.triggerLogicOperator} 
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
            className={sharedInputClasses} 
            placeholder="Title of alert..."
        />
        <label>Description:</label>
        <input 
            className={sharedInputClasses}
            placeholder="Description of alert..."
        />
        <label>Color:</label>
        <input 
            type="number"
            className={sharedInputClasses}
            placeholder="Description of alert..."
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
    </form>;
}
