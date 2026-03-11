import { openSearchModal, fetchWeather, saveCity } from "./citySearch.js";
import { getHourlyForecastData } from "./hourlyForecast.js";

document.addEventListener("DOMContentLoaded", function () {

    const daysList = document.getElementById("days-list");
    const temperatureEl = document.getElementById("temperature");
    const sunriseEl = document.getElementById("sunrise");
    const sunsetEl = document.getElementById("sunset");
    const precipitationEl = document.getElementById("precipitation");
    const selectedDayEl = document.getElementById("selected-day");
    const weatherIconEl = document.getElementById("weather-icon");
    const prevHistory = document.querySelector("#prevCitiesList");
    const popCitiesList = document.querySelector("#popCitiesList");

    const celsiusBtn = document.getElementById("celsiusBtn");
    const fahrenheitBtn = document.getElementById("fahrenheitBtn");
    const menuBtn = document.getElementById("menuIcon");
    const menuList = document.getElementById("menuList");

    let currentUnit = "C";
    let unitType = "metric";
    let activeIndex = 0;
    let toggle = 0;

    localStorage.setItem("day", 0);
    let selectedDay = localStorage.getItem("day") * 24;
    let currentLocation = JSON.parse(localStorage.getItem("weatherCity")) || [];

    const weekDays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
    const fakeWeather = [];
    const popularCitiesArr = [
        {"name": "London", "lon": 0, "lat": 0},
        {"name": "Paris", "lon": 0, "lat": 0},
        {"name": "Stockholm", "lon": 18.0686, "lat": 59.3293}
    ];
    localStorage.setItem("popCityString", JSON.stringify(popularCitiesArr));
    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    function generateTenDaysFromMonday() {
        const today = new Date();
        const dayIndex = today.getDay();
        const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;

        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        for (let i = 0; i < 10; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            fakeWeather.push({
                day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1],
                date: date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }),
                tempC: Math.floor(Math.random() * 15) + 5,
                sunrise: "06:" + (30 + i),
                sunset: "17:" + (40 + i),
                precipitation: Math.floor(Math.random() * 10) + " mm",
                icon: "☀️"
            });
        }
    }

    function renderDays() {
        fakeWeather.forEach((data, index) => {
            const div = document.createElement("div");
            div.classList.add("day-item");
            if (index === 0) div.classList.add("active");

            div.innerHTML = `
                <strong>${data.day}</strong>
                <span>${data.date}</span>
            `;

            div.addEventListener("click", function () {
                document.querySelectorAll(".day-item").forEach(d => d.classList.remove("active"));
                div.classList.add("active");
                activeIndex = index;
                showWeather(index);
            });

            daysList.appendChild(div);
        });
    }

    function showWeather(index) {
        const data = fakeWeather[index];

        selectedDayEl.textContent = data.day + " - " + data.date;
        updateTemperature(data.tempC);
        sunriseEl.textContent = "Soluppgång: " + data.sunrise;
        sunsetEl.textContent = "Solnedgång: " + data.sunset;
        precipitationEl.textContent = "Nederbörd: " + data.precipitation;
        weatherIconEl.textContent = data.icon;
    }

    function updateTemperature(tempC) {
        if (currentUnit === "C") {
            temperatureEl.textContent = tempC + "°C";
        } else {
            const tempF = (tempC * 9/5) + 32;
            temperatureEl.textContent = Math.round(tempF) + "°F";
        }
    }

    //Renders all cities in a specific div based on the provided array and element ID
    function renderCityList(cityString, divId) {
        divId.innerHTML = "";
        for(let i = 0; i < cityString.length; i++){
            divId.innerHTML += `
                <span class="city">${cityString[i].name}</span>               
            `;
        }
    }

    //Updates the current city selected in local storage.
    menuList.addEventListener("click", function (e) {
        if (!e.target.classList.contains("city")) return;
        const cityValue = e.target.textContent;
        let storageKey = null;

        if (e.target.closest("#popCitiesList")){
            storageKey = "popCityString";
        }
        if (e.target.closest("#prevCitiesList")){
            storageKey = "cities";
        }
        if (!storageKey) return;

        let cityArr = JSON.parse(localStorage.getItem(storageKey)) || [];
        const clickedCity = cityArr.find((cityObj) => cityObj.name === cityValue);
        
        if(clickedCity) {
            localStorage.setItem("weatherCity", JSON.stringify(clickedCity));
            //update all render functions relying on weatherCity  
            renderAll();
        }
    });

    celsiusBtn.addEventListener("click", function () {
        currentUnit = "C";
        unitType = "metric";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        localStorage.setItem("currentUnit", "C");
        renderAll();
    });

    fahrenheitBtn.addEventListener("click", function () {
        currentUnit = "F";
        unitType = "imperial";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        localStorage.setItem("currentUnit", "F");
        renderAll();
    });

    menuBtn.addEventListener("click", function () {
        if (toggle===1){
            toggle = 0;
            menuList.classList.remove("activeMenu");
        } else {
            toggle = 1;
            menuList.classList.add("activeMenu");
        }
        
    });

    function renderAll() {
        currentLocation = JSON.parse(localStorage.getItem("weatherCity")) || [];
        cities = JSON.parse(localStorage.getItem("cities")) || [];
        getHourlyForecastData(currentLocation.lat, currentLocation.lon, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
        renderCityList(cities, prevHistory);
        fetchWeather(currentLocation.lat, currentLocation.lon);
        showWeather(activeIndex);
    }

    generateTenDaysFromMonday();
    renderDays();
    showWeather(0);
    getHourlyForecastData(currentLocation.lat, currentLocation.lon, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
    renderCityList(cities, prevHistory);

    const savedCity = JSON.parse(localStorage.getItem("weatherCity"));

        if(savedCity){
             document.getElementById("city").textContent = savedCity.name;
            fetchWeather(savedCity.lat, savedCity.lon);
}

    //selectCity section

    const city = document.getElementById("city");
    const locationOn = document.getElementById("location-on");

    city.addEventListener("click", () => {
        openSearchModal();
        renderAll(); //trying to render all features again after a city has been selected
    });

    const mapContainer = document.getElementById("map-container");

    let map;

    locationOn.addEventListener("click", () => {

        mapContainer.style.display = "block";

        if(!map){

            map = L.map('map').setView([51.505, -0.09], 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            map.on("click", function(e){

                const lat = e.latlng.lat;
                const lon = e.latlng.lng;

                localStorage.setItem(
                    "weatherCity",
                    JSON.stringify({
                        name: "Selected location", //Invalid City name, needs to be the actual city name for it to used by others
                        lat: lat,
                        lon: lon
                    })
                );
                saveCity("new City", lat, lon);
                //fetchWeather(lat, lon); removed and replaced by an all function for rendering
                renderAll();
                mapContainer.style.display = "none";
            });
        }
    });

});

