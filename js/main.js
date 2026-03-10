import { openSearchModal, fetchWeather } from "./citySearch.js";
import { getHourlyForecastData } from "./hourlyForecast.js";

document.addEventListener("DOMContentLoaded", function () {

    const daysList = document.getElementById("days-list");
    const temperatureEl = document.getElementById("temperature");
    const sunriseEl = document.getElementById("sunrise");
    const sunsetEl = document.getElementById("sunset");
    const precipitationEl = document.getElementById("precipitation");
    const selectedDayEl = document.getElementById("selected-day");
    const weatherIconEl = document.getElementById("weather-icon");

    const celsiusBtn = document.getElementById("celsiusBtn");
    const fahrenheitBtn = document.getElementById("fahrenheitBtn");

    let currentUnit = "C";
    let unitType = "metric";
    let activeIndex = 0;

    localStorage.setItem("day", 0);
    let selectedDay = localStorage.getItem("day") * 24;

    const weekDays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
    const fakeWeather = [];

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

    celsiusBtn.addEventListener("click", function () {
        currentUnit = "C";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        showWeather(activeIndex);
        let unitType = "metric";
        localStorage.setItem("currentUnit", "C");
        getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
    });

    fahrenheitBtn.addEventListener("click", function () {
        currentUnit = "F";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        showWeather(activeIndex);
        let unitType = "imperial";
        localStorage.setItem("currentUnit", "F");
        getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
    });

    generateTenDaysFromMonday();
    renderDays();
    showWeather(0);
    getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay)

    const savedCity = JSON.parse(localStorage.getItem("weatherCity"));

        if(savedCity){
             document.getElementById("city").textContent = savedCity.name;
            fetchWeather(savedCity.lat, savedCity.lon);
}
});

//selectCity section

const city = document.getElementById("city");
const locationOn = document.getElementById("location-on");

city.addEventListener("click", openSearchModal);

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
            name: "Selected location",
            lat: lat,
            lon: lon
        })
    );
            fetchWeather(lat, lon);
            mapContainer.style.display = "none";
        });
    }
});