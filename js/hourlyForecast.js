// Creates a a card containing the time, type of weather and temperature. Uses parameters for latitude, longitude, API Key and unit for the temperature.
export async function getHourlyForecastData(lat, lon, API_key, tempSelector) {
    let forecast_API = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_key}&units=${tempSelector}`;
    let hourlyCards = document.getElementById("hourlyForecast");
    let tempUnit = localStorage.getItem("currentUnit");
    try {
        const response = await fetch(forecast_API);
        if (!response.ok) {
            throw new Error("Server issue: " + response.status);
        }
        const weatherData = await response.json();
        const hourlyData = weatherData.list;
        const timeZone = weatherData.city.timezone;
        hourlyCards.textContent = "";
        for(let i=0; i < 24; i++) {
            let unixTimeConvert = new Date((hourlyData[i].dt + timeZone) * 1000);
            let timeH = unixTimeConvert.getUTCHours().toString().padStart(2,0);
            let timeM = unixTimeConvert.getUTCMinutes().toString().padStart(2,0);
            let roundTemp = Math.floor(hourlyData[i].main.temp);
            const div = document.createElement("div");
            const p1 = document.createElement("p");
            const p2 = document.createElement("p");
            const img = document.createElement("img");
            div.classList.add("forecast-card");
            p1.innerText = `${timeH}:${timeM}`;
            p2.innerText = `${roundTemp} °${tempUnit}`;
            img.src = `https://openweathermap.org/img/w/${hourlyData[i].weather[0].icon}.png`;
            div.appendChild(p1);
            div.appendChild(img);
            div.appendChild(p2);
            hourlyCards.appendChild(div);
        }
    } catch (error) {
        console.log(error);
    }
    
}