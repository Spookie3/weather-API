const cityElement = document.getElementById("city");

let cities = JSON.parse(localStorage.getItem("cities")) || [];

export async function openSearchModal(){
    const cityName = prompt("Enter city name");

    if(!cityName) return;

    await fetchCoordinates(cityName);
}

async function fetchCoordinates(cityName){
    const API_KEY ="d7d5e9ce027464d47b22372e72cc2b23"; // here i need to write my api-key
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0){
        alert("city not found");
        return;
    }

    const lat = data[0].lat;
    const lon = data[0].lon;

    localStorage.setItem("weatherCity", JSON.stringify({
        name: cityName,
        lat: lat,
        lon: lon
    })
);

    saveCity(cityName, lat, lon);
    return {lat, lon};
    //fetchWeather(lat, lon, unitType);
}

export function saveCity(cityName, lat, lon){
    if(!cities.find((cityObj) => cityObj.name === cityName)){
        cities.push({"name": cityName, "lat": lat, "lon": lon});
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}

export async function fetchWeather(lat, lon, unitType){

    const API_KEY = "d7d5e9ce027464d47b22372e72cc2b23";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unitType}&appid=${API_KEY}`; //missing code for changing units
    const response = await fetch(url);
    const data = await response.json();

    updateUI(data, unitType);
}

function updateUI(data, unitType){

    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("current-temp");

    cityElement.textContent = data.name;

    const unit = unitType === "metric" ? "°C" : "°F";

    tempElement.textContent = Math.round(data.main.temp) + unit;
}