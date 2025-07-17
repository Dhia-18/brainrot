document.addEventListener("DOMContentLoaded", async ()=>{
    const brainImage = document.getElementById("brain");
    const health = document.getElementById("health-amount");
    const screenTime = document.getElementById("screen-time");
    const pickups = document.getElementById("pickups");
    const offendersList = document.getElementById("offenders-list");

    // Get all stored values
    const data = await chrome.storage.local.get(null);
    const totalScreenTime = data.totalScreenTime || 0;
    const totalPickups = data.pickups || 0;

    const hours = Math.floor(totalScreenTime / (1000 * 60 * 60));
    const minutes = Math.floor(totalScreenTime / (1000 * 60)) % 60;

    function findTime(time){
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor(time / (1000 * 60)) % 60;

        return(`${hours}h ${minutes}m`);
    }

    if (hours <= 1){
        brainImage.src = "assets/images/Brain_Good_Health.png";
    }else if (hours <= 2){
        brainImage.src= "assets/images/Brain_Medium_Health.png";
    }else if (hours <= 3){
        brainImage.src= "assets/images/Brain_Bad_Health.png";
    }else{
        brainImage.src= "assets/images/Brain_Very_Bad_Health.png";
    }

    health.textContent = `${Math.max(0, 100 - Math.floor(((totalScreenTime / (1000 * 60)) / 240) * 100))}`;
    // Change the health bar width
    document.documentElement.style.setProperty('--health', `${health.textContent}%`);
    screenTime.textContent = `${hours}h ${minutes}m`
    pickups.textContent = totalPickups;

    // Rendering each website's screen time
    const entries = Object.entries(data);
    entries.sort((termA, termB) => termB[1] - termA[1]).slice(0, 5);
    let html = "";
    for(const [key, value] of entries){
        if(["pickups", "totalScreenTime"].includes(key)){
            continue;
        }

        html += `   
                <li class="website">
                    <img class="website-icon" src="https://www.google.com/s2/favicons?sz=32&domain=${key}" alt="Favicon">
                    <p class="website-name">${key}</p>
                    <p class="time-spent">${findTime(value)}</p>
                </li>
            `
    }
    offendersList.innerHTML = html;
});
