let API_key = "";
let hourlyCards = document.getElementById("hourlyForecast");


async function getHourlyForecastData(lat, lon, API_key) {
    let forecast_API = `https://api.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_key}`;
    const data = await fetch(forecast_API);
    const weatherData = await data.json();
    const hourlyData = weatherData.list;
    for(i=0; i < 24; i++) {
        hourlyCards.innerHTML += `
            <div class="forecast-card">
                <p>${hourlyData[i].dt}</p>
                <img src="https://openweathermap.org/img/wn/${hourlyData[i].weather.icon}.png" alt="current weather: ${hourlyData[i].weather.description}">
                <p>${hourlyData[i].main.temp} &deg;C</p>
            </div>
        `;
    }
}
