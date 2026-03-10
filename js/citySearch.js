const cityElement = document.getElementById("city");

let cities = JSON.parse(localStorage.getItem("cities")) || [];

export function openSearchModal(){
    const cityName = prompt("Enter city name");

    if(!cityName) return;

    fetchCoordinates(cityName);
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

    saveCity(cityName);
    fetchWeather(lat, lon);
}

function saveCity(cityName){
    if(!cities.includes(cityName)){
        cities.push(cityName);
    }

    localStorage.setItem("cities", JSON.stringify(cities));
}

export async function fetchWeather(lat, lon){

    const API_KEY = "d7d5e9ce027464d47b22372e72cc2b23";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    updateUI(data);
}

function updateUI(data){

    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("current-temp");

    cityElement.textContent = data.name;

    tempElement.textContent = Math.round(data.main.temp) + "°C";
}