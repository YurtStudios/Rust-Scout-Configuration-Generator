import { AlertData, Trigger } from "./page"
import { RgbData } from "./rgb-found"
import { WatchlistData } from "./watchlists"

type AlertTrigger = {
    value: TriggerEvent,
    condition: {
        action: LogicOperator,
        value: number
    }
}
export enum LogicOperator {
    GreaterThan = "greater-than",  
    LessThan = "less-than", 
    GreaterThanOrEqual = "greater-than-or-equal", 
    LessThanOrEqual = "less-than-or-equal"
}

export enum TriggerEvent {
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

type CustomAlert = {
    id: string,
    name: string,
    triggers: Array<AlertTrigger>,
    embed: {
        description: string,
        title: string,
        url: string,
        color: number,
        buttons: {
            check: boolean
        }
    }
}

type GeneratedOutput = {
    customs: Array<CustomAlert>
    watchlist: {
        enabled: boolean,
        id?: string,
        name?: string,
        embed?: {
            description: string,
            title: string,
            color: number,
            url: string,
            authorName: string,
            authorIcon: string,
            buttons: {
                check: boolean,
                watchlistRemove: boolean
            }
        }
    },
    rgbFound: {
        enabled: boolean,
        id?: string,
        name?: string,
        embed?: {
            title: string,
            color: number,
            description: string,
            buttons: {
                rgbShowMore: boolean,
                rgbIgnore: boolean
            }
        }
    }
}

function convertName(name: string): string {
    const notAlphaExp = /[^\w]+/g;
    let normalizedName = name.toLowerCase().replace(notAlphaExp, " ");
    let splitName = normalizedName.split(" ");
    let camelCaseParts = splitName.map((nameStr, index) => {
        if (index == 0) return nameStr;
        return nameStr.substring(0, 1).toUpperCase() + nameStr.substring(1)
    });

    return camelCaseParts.join("");
}

export function generateOutput(
    watchlist: WatchlistData | undefined, 
    alertsData: Array<AlertData>,
    rgbData: RgbData | undefined,
): GeneratedOutput {
    
    let prelimOutput = {
        customs: alertsData.map((alertData: AlertData) => {
            return {
                id: convertName(alertData.alertName),
                name: alertData.alertName,
                triggers: alertData.triggers.map((trigger: Trigger) => {
                    return {
                        value: trigger.triggerEvent,
                        condition: {
                            action: trigger.triggerLogicOperator,
                            value: trigger.triggerCount
                        }
                    };
                }),
                embed: {
                    description: alertData.description,
                    title: alertData.title,
                    url: alertData.url,
                    color: alertData.color,
                    buttons: {
                        check: alertData.checkButton
                    }
                }
            }
        }),
        watchlist: {
            enabled: watchlist?.enabled ?? false,
            id: watchlist?.enabled ? convertName(watchlist.watchlistName) : undefined,
            name: watchlist?.enabled ? watchlist.watchlistName : undefined,
            embed: watchlist?.enabled ? {
                description: watchlist.description,
                title: watchlist.title,
                color: watchlist.color,
                url: watchlist.url,
                authorName: watchlist.authorName,
                authorIcon: watchlist.authorIcon,
                buttons: {
                    check: watchlist.checkButton,
                    watchlistRemove: watchlist.removeButton
                }
            } : undefined
        },
        rgbFound: {
            enabled: rgbData?.enabled ?? false,
            id: rgbData?.enabled ? convertName(rgbData?.name) : undefined,
            name: rgbData?.enabled ? rgbData.name : undefined,
            embed: rgbData?.enabled ? {
                title: rgbData.title,
                description: rgbData.description,
                color: rgbData.color,
                buttons: {
                    rgbShowMore: rgbData.rgbShowMore,
                    rgbIgnore: rgbData.rgbIgnore
                }
            } : undefined
        }
    }

    return prelimOutput;
}
