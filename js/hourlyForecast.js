let hourlyCards = document.getElementById("hourlyForecast");
let API_key = "80948121ac889b120dca64a6c7e5f24c";
let latitude = "";
let longitude = "";
let srcelectedDay = 0 * 24;
let tempUnit = "C";
const day = localStorage.getItem("day");


async function getHourlyForecastData(lat, lon, API_key, tempSelector, selectedDay) {
    let forecast_API = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_key}&units=${tempSelector}`;
    try {
        const response = await fetch(forecast_API);
        if (!response.ok) {
            throw new Error("Server issue: " + response.status);
        }
        console.log("forecast data was retrieved")
        const weatherData = await response.json();
        const hourlyData = weatherData.list;
        if(tempSelector==="imperial"){
            tempUnit = "F";
        } else {
            tempUnit = "C";
        }
        for(i=0+selectedDay; i < 24+selectedDay; i++) {
            hourlyCards.innerHTML += `
                <div class="forecast-card">
                    <p>${hourlyData[i].dt}</p>
                    <img src="https://openweathermap.org/img/wn/${hourlyData[i].weather.icon}.png" alt="current weather: ${hourlyData[i].weather.description}">
                    <p>${hourlyData[i].main.temp} &deg;${tempUnit}</p>
                </div>
            `;
        }
    } catch (error) {
        console.log(error);
    }
    
}

getHourlyForecastData(59.609901, 16.544809, API_key, "metric", 0);