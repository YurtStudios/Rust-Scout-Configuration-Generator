"use client";
import { useEffect, useState } from "react";

type WatchlistData = {
    id: number,
    watchlistName: string,
    title: string,
    description: string,
    color: number,
    checkButton: boolean,
    removeButton: boolean,
    url: string,
}

const localStorageIdentifier = "localWatchlistData";

export function WatchlistDisplay() {

    const [localWatchlistData, setLocalWatchlistData] = useState<WatchlistData>({
        id: 0,
        watchlistName: "",
        title: "",
        description: "",
        color: 0,
        checkButton: false,
        removeButton: false,
        url: ""
    });
    const [localDataChanged, setLocalDataChanged] = useState<boolean>(false);

    useEffect(() => {
        localStorage.setItem(localStorageIdentifier, JSON.stringify(localWatchlistData));
    }, [localWatchlistData])

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
        </div>
    );
}
