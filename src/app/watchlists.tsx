"use client";
import { Switch } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type WatchlistData = {
    enabled: boolean,
    watchlistName: string,
    title: string,
    description: string,
    color: number,
    authorName: string,
    authorIcon: string,
    checkButton: boolean,
    removeButton: boolean,
    url: string,
}

const localStorageIdentifier = "localWatchlistData";

export function WatchlistDisplay(props: {
    savedWatchlistData: WatchlistData | undefined, 
    setSavedWatchlistData: Dispatch<SetStateAction<WatchlistData | undefined>>,
}) {

    const [localWatchlistData, setLocalWatchlistData] = useState<WatchlistData>({
        enabled: true,
        watchlistName: "",
        title: "",
        description: "",
        authorName: "",
        authorIcon:"",
        color: 0,
        checkButton: false,
        removeButton: false,
        url: ""
    });
    const [localDataChanged, setLocalDataChanged] = useState<boolean>(false);
    const sharedInputClasses = "w-full border rounded-md p-1 px-3";


    useEffect(() => {
        let jsonString = localStorage.getItem(localStorageIdentifier) 
        if (jsonString != null) {
            let watchlistData : WatchlistData = JSON.parse(jsonString);
            setLocalWatchlistData(watchlistData)
        }
        else {
            localStorage.setItem(localStorageIdentifier, JSON.stringify(localWatchlistData))
        }
        props.setSavedWatchlistData(localWatchlistData)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if(!localDataChanged) setLocalDataChanged(true);

        setLocalWatchlistData((prev) => ({
          ...prev,
          [name]: type === "number" ? Number(value) : value,
        }));
    };

    return (
        <div className="w-[600px] border-2 rounded-md grow p-2 pt-4 mb-4">
            <h3 className="w-full flex flex-row gap-2 text-lg font-bold items-center">
                Watchlist: 
                <Switch checked={localWatchlistData.enabled} onChange={
                    (val) => {
                        setLocalDataChanged(true)
                        setLocalWatchlistData({...localWatchlistData, enabled: val.target.checked})
                    }
                }/>
                <button
                    className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                    onClick={() => {
                        props.setSavedWatchlistData(localWatchlistData);
                        localStorage.setItem(localStorageIdentifier, JSON.stringify(localWatchlistData));
                        setLocalDataChanged(false);
                    }}>
                    Save
                </button>
                <button
                    className={ localDataChanged ? "border rounded-md p-1" : " hidden"} 
                    onClick={() => { 
                        if (props.savedWatchlistData != null) setLocalWatchlistData(props.savedWatchlistData);
                        setLocalDataChanged(false);
                    }}
                    >
                    Cancel
                </button>
            </h3>
            <div className={localWatchlistData.enabled ? "" : "hidden"}>
                <label>Watchlist Name:</label>
                <input 
                    className={sharedInputClasses}
                    placeholder="The name of the watchlist"
                    onChange={handleChange}
                    name="watchlistName"
                    value={localWatchlistData.watchlistName}
                    />
                <h3 className="text-lg font-bold">
                    Embed Information:
                </h3>
                <label>Title:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Watchlist title"
                    onChange={handleChange}
                    name="title"
                    value={localWatchlistData.title}
                    />
                <label>Description:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Watchlist description"
                    onChange={handleChange}
                    name="description"
                    value={localWatchlistData.description}
                    />
                <label>Author Name:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Author Name"
                    onChange={handleChange}
                    name="authorName"
                    value={localWatchlistData.authorName}
                    />
                <label>Author Icon:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Author Icon"
                    onChange={handleChange}
                    name="authorIcon"
                    value={localWatchlistData.authorIcon}
                    />
                <label>Color:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="Accent color for watchlist"
                    onChange={handleChange}
                    name="color"
                    type="number"
                    value={localWatchlistData.color}
                    />
                <label>URL:</label>
                <input
                    className={sharedInputClasses}
                    placeholder="http://example.com"
                    onChange={handleChange}
                    name="url"
                    value={localWatchlistData.url}
                    />
                <div className="flex flex-wrap gap-2 items-center">
                    <label>Include a 'Check' button?</label>
                    <Switch 
                        checked={localWatchlistData.checkButton} 
                        onChange={
                            (val) => setLocalWatchlistData({ ...localWatchlistData, checkButton: val.target.checked })
                        }
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <label>Include a 'Remove' button?</label>
                    <Switch 
                        checked={localWatchlistData.removeButton} 
                        onChange={
                            (val) => setLocalWatchlistData({ ...localWatchlistData, removeButton: val.target.checked })
                        }
                    />
                </div>
            </div>
        </div>
    );
}
