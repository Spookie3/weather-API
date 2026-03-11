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
        hourlyCards.innerHTML = "";
        for(let i=0; i < 24; i++) {
            let unixTimeConvert = new Date((hourlyData[i].dt + timeZone) * 1000);
            let timeH = unixTimeConvert.getUTCHours().toString().padStart(2,0);
            let timeM = unixTimeConvert.getUTCMinutes().toString().padStart(2,0);
            let roundTemp = Math.floor(hourlyData[i].main.temp);
            hourlyCards.innerHTML += `
                <div class="forecast-card">
                    <p>${timeH}:${timeM}</p>
                    <img src="https://openweathermap.org/img/w/${hourlyData[i].weather[0].icon}.png" alt="current weather: ${hourlyData[i].weather.description}">
                    <p>${roundTemp} &deg;${tempUnit}</p>
                </div>
            `;
        }
    } catch (error) {
        console.log(error);
    }
    
}