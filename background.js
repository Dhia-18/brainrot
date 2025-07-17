let previousDomain = null;
let startTime = Date.now();
const socialSites = ["www.facebook.com", "www.x.com", "www.instagram.com", "www.linkedin.com", "www.discord.com", "www.youtube.com"]

function getDomain(url){
    try{
        return (new URL(url).hostname);
    }catch{
        return null;
    }
}

function handleTabChange(tabId){
    chrome.tabs.get(tabId, (tab)=>{
        if(!tab || !tab.url){
            return;
        }
        const domain = getDomain(tab.url);
        const now = Date.now();
        
        // Save time spent on previous domain
        if(previousDomain){
            const timeSpent = now - startTime;
            updateStats(previousDomain, timeSpent);
        }

        if(socialSites.includes(domain)){
            previousDomain = domain;
            startTime = now;
        } else{
            previousDomain = null;
            startTime = now;
        }
    });
}

async function updateStats(domain, timeSpent){
    const domainData = await chrome.storage.local.get([domain]);
    const pickupsData = await chrome.storage.local.get(["pickups"]);
    const screenTimeData = await chrome.storage.local.get(["totalScreenTime"]);

    await chrome.storage.local.set({
        [domain]: (domainData[domain] || 0) + timeSpent,
        pickups: (pickupsData.pickups || 0) + 1,
        totalScreenTime: (screenTimeData.totalScreenTime || 0) + timeSpent
    });
}

// Listen for active tab changes
chrome.tabs.onActivated.addListener((activeInfo)=>{
    handleTabChange(activeInfo.tabId);
});

// Reset timer when user becomes idle
chrome.idle.onStateChanged.addListener((state)=>{
    if(state === "idle" || state === "locked"){
        previousDomain = null;
    }
});

// Reset the stats every midnight
chrome.runtime.onInstalled.addListener(()=>{
    chrome.alarms.create("midnightReset", {
        delayInMinutes: 1,
        periodInMinutes: 24 * 60
    });
});

// Alarm Listener
chrome.alarms.onAlarm.addListener((alarm)=>{
    if(alarm.name === "midnightReset"){
        chrome.storage.local.clear();
    }
});
