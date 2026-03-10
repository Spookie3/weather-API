import { getHourlyForecastData } from "./hourlyForecast.js";

document.addEventListener("DOMContentLoaded", function () {

    const daysList = document.getElementById("days-list");
    const temperatureEl = document.getElementById("temperature");
    const sunriseEl = document.getElementById("sunrise");
    const sunsetEl = document.getElementById("sunset");
    const precipitationEl = document.getElementById("precipitation");
    const selectedDayEl = document.getElementById("selected-day");
    const weatherIconEl = document.getElementById("weather-icon");
    const prevHistory = document.getElementById("prevHistory");
    const city = document.getElementsByClassName("city");

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

    const weekDays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
    const fakeWeather = [];
    const popularCities = [
        {"city": "London", "lon": 0, "lat": 0},
        {"city": "Paris", "lon": 0, "lat": 0},
        {"city": "Stockholm", "lon": 0, "lat": 0}
    ];

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
        let cityArr = JSON.parse(cityString);
        for(let i = 0; i < cityArr.length; i++){
            divId.innerHTML += `
                <span class="city">${cityArr[i].city}</span>               
            `;
        }
    }

    //Updates the current city selected in local storage.
    city.addEventListener("click", function (e) {
            let cityString = localStorage.getItem("cityString");
            let cityArr = JSON.parse(cityString);
            const cityValue = e.target.textContent;
            const clickedCity = cityArr.find((cityName) => {
                return cityName.includes(cityValue);
            });
            localStorage.setItem("currentCityString", JSON.stringify(clickedCity));
        });

    celsiusBtn.addEventListener("click", function () {
        currentUnit = "C";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        showWeather(activeIndex);
        unitType = "metric";
        localStorage.setItem("currentUnit", "C");
        getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
    });

    fahrenheitBtn.addEventListener("click", function () {
        currentUnit = "F";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        showWeather(activeIndex);
        unitType = "imperial";
        localStorage.setItem("currentUnit", "F");
        getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
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

    generateTenDaysFromMonday();
    renderDays();
    showWeather(0);
    getHourlyForecastData(59.609901, 16.544809, "80948121ac889b120dca64a6c7e5f24c", unitType, selectedDay);
    renderCityList(popularCities, prevHistory);
});