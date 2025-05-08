"use client";
import { Switch } from "@mui/material"
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type RgbData = {
    enabled: boolean,
    name: string,
    description: string,
    title: string,
    color: number,
    rgbShowMore: boolean,
    rgbIgnore: boolean,

}
const localStorageIdentifier = "localRgbData";
    const sharedInputClasses = "w-full border rounded-md p-1 px-3";

export function RgbDisplay(props: {
    savedRgbData: RgbData | undefined,
    setSavedRgbData: Dispatch<SetStateAction<RgbData | undefined>>
}) {
    const [localRgbData, setLocalRgbData] = useState<RgbData>({
        enabled: true,
        name: "",
        description: "",
        title: "",
        color: 0,
        rgbShowMore: true,
        rgbIgnore: true,
    });

    useEffect(() => {
        let jsonStr = localStorage.getItem((localStorageIdentifier))
        if (jsonStr) {
            let tempData: RgbData = JSON.parse(jsonStr);
            setLocalRgbData(tempData)
            props.setSavedRgbData(tempData)
        }
        
    }, [])
    const [localDataChanged, setLocalDataChanged] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if(!localDataChanged) setLocalDataChanged(true);

        setLocalRgbData((prev) => ({
          ...prev,
          [name]: type === "number" ? Number(value) : value,
        }));
    };

    return (
        <div className="w-[600px] border-2 rounded-md grow p-2 pt-4 mb-4">
            <h3 className="w-full flex flex-row gap-2 text-lg font-bold items-center">
                RGB Found: 
                <Switch checked={localRgbData.enabled} onChange={(val) => {
                    setLocalRgbData({...localRgbData, enabled: val.target.checked})
                    setLocalDataChanged(true);
                }}/>
                <button
                    className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                    onClick={() => {
                        props.setSavedRgbData(localRgbData);
                        localStorage.setItem(localStorageIdentifier, JSON.stringify(localRgbData));
                        setLocalDataChanged(false);
                    }}>
                    Save
                </button>
                <button
                    className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                    onClick={() => { 
                        if (props.savedRgbData!= null) setLocalRgbData(props.savedRgbData);
                        else {
                            setLocalRgbData({
                                enabled: true,
                                name: "",
                                description: "",
                                title: "",
                                color: 0,
                                rgbShowMore: true,
                                rgbIgnore: true,
                            })
                        }
                        setLocalDataChanged(false);
                    }}
                    >
                    Cancel
                </button>
            </h3>
            <div className={localRgbData.enabled ? "" : "hidden"}>
                <label>RGB Name:</label>
                <input 
                    className={sharedInputClasses}
                    placeholder="RGB name"
                    onChange={handleChange}
                    name="name"
                    value={localRgbData.name}
                    />
                <h3 className="text-lg font-bold">
                    Embed Information:
                </h3>
                <label>Title:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="RGB title"
                    onChange={handleChange}
                    name="title"
                    value={localRgbData.title}
                    />
                <label>Description:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="RGB description"
                    onChange={handleChange}
                    name="description"
                    value={localRgbData.description}
                    />
                <label>Color:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Accent color for watchlist"
                    onChange={handleChange}
                    name="color"
                    type="number"
                    value={localRgbData.color}
                    />
                <div className="flex flex-wrap gap-2 items-center">
                    <label>Include a 'Check' button?</label>
                    <Switch 
                        checked={localRgbData.rgbShowMore} 
                        onChange={
                            (val) => {
                            setLocalDataChanged(true);
                            setLocalRgbData({ ...localRgbData, rgbShowMore: val.target.checked })
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <label>Include an 'Ignore' button?</label>
                    <Switch 
                        checked={localRgbData.rgbIgnore} 
                        onChange={
                            (val) => {
                            setLocalRgbData({ ...localRgbData, rgbIgnore: val.target.checked })
                            setLocalDataChanged(true);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
