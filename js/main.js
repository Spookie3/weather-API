import { openSearchModal, fetchWeather, saveCity } from "./citySearch.js";
import { getHourlyForecastData } from "./hourlyForecast.js";

document.addEventListener("DOMContentLoaded", function () {

    const daysList = document.getElementById("days-list");
    const temperatureEl = document.getElementById("temperature");
    const selectedDayEl = document.getElementById("selected-day");
    const weatherIconEl = document.getElementById("weather-icon");

    const prevHistory = document.querySelector("#prevCitiesList");

    const celsiusBtn = document.getElementById("celsiusBtn");
    const fahrenheitBtn = document.getElementById("fahrenheitBtn");

    const menuBtn = document.getElementById("menuIcon");
    const menuList = document.getElementById("menuList");

    const city = document.getElementById("city");
    const locationOn = document.getElementById("location-on");
    const mapContainer = document.getElementById("map-container");

    let map;
    let toggle = 0;

    let currentUnit = "C";
    let unitType = "metric";
    let activeIndex = 0;

    let dailyTemps = [];

    localStorage.setItem("day", 0);
    let selectedDay = Number(localStorage.getItem("day")) * 24;

    const weekDays = ["Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag","Söndag"];
    const fakeWeather = [];

    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    function generateNextTenDays() {

        const today = new Date();
        fakeWeather.length = 0;

        for (let i = 0; i < 10; i++) {

            const date = new Date(today);
            date.setDate(today.getDate() + i);

            fakeWeather.push({
                day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1],
                date: date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })
            });

        }

    }

    function renderDays() {

        daysList.innerHTML = "";

        fakeWeather.forEach((data, index) => {

            const div = document.createElement("div");
            div.classList.add("day-item");

            if (index === 0) div.classList.add("active");

            div.innerHTML = `
                <strong>${data.day}</strong>
                <span>${data.date}</span>
                <img class="day-icon" src="">
                <span class="day-temp">--</span>
            `;

            div.addEventListener("click", function () {

                document.querySelectorAll(".day-item")
                .forEach(d => d.classList.remove("active"));

                div.classList.add("active");

                activeIndex = index;

                localStorage.setItem("day", index);

                showWeather(index);

            });

            daysList.appendChild(div);

        });

    }

    function showWeather(index){

        const data = fakeWeather[index];

        selectedDayEl.textContent = data.day + " - " + data.date;

        if(dailyTemps[index]){

            const temp = Math.round(dailyTemps[index].temp);

            temperatureEl.textContent = temp + "°C";

            weatherIconEl.innerHTML =
            `<img src="https://openweathermap.org/img/wn/${dailyTemps[index].icon}@2x.png">`;

        }else{

            temperatureEl.textContent = "--";

        }

    }

    function renderCityList(cityString, divId){

        divId.innerHTML = "";

        for(let i = 0; i < cityString.length; i++){

            divId.innerHTML += `<span class="city">${cityString[i].name}</span>`;

        }

    }

    async function loadDailyWeather(lat, lon){

        const apiKey = "80948121ac889b120dca64a6c7e5f24c";

        const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unitType}&appid=${apiKey}`
        );

        const data = await response.json();

        dailyTemps = [];

        for(let i = 0; i < data.list.length; i += 8){

            dailyTemps.push({
                temp: data.list[i].main.temp,
                icon: data.list[i].weather[0].icon
            });

        }

        updateDailyUI();
        showWeather(activeIndex);

    }

    function updateDailyUI(){

        const items = document.querySelectorAll(".day-item");

        items.forEach((item, index) => {

            const tempSpan = item.querySelector(".day-temp");
            const iconImg = item.querySelector(".day-icon");

            if(dailyTemps[index]){

                const temp = Math.round(dailyTemps[index].temp);

                tempSpan.textContent = temp + "°";

                iconImg.src =
                `https://openweathermap.org/img/wn/${dailyTemps[index].icon}.png`;

            }else{

                tempSpan.textContent = "--";
                iconImg.src = "";

            }

        });

    }

    async function updateWeatherForLocation(lat, lon, name){

        document.getElementById("city").textContent = name;

        activeIndex = 0;
        selectedDay = 0;
        localStorage.setItem("day",0);

        await fetchWeather(lat, lon);

        await loadDailyWeather(lat, lon);

        getHourlyForecastData(
            lat,
            lon,
            "80948121ac889b120dca64a6c7e5f24c",
            unitType,
            selectedDay
        );

        showWeather(0);

    }

    window.updateWeatherForLocation = updateWeatherForLocation;

    const arrow = document.getElementById("arrow-down");

    arrow.addEventListener("click", () => {

        daysList.classList.toggle("expanded");
        arrow.classList.toggle("rotate");

    });

    generateNextTenDays();
    renderDays();
    showWeather(0);

    renderCityList(cities, prevHistory);

    const savedCity = JSON.parse(localStorage.getItem("weatherCity"));

    if(savedCity){

        updateWeatherForLocation(savedCity.lat, savedCity.lon, savedCity.name);

    }

    city.addEventListener("click", () => {

        openSearchModal();

    });

    locationOn.addEventListener("click", () => {

        mapContainer.style.display = "block";

        if(!map){

            map = L.map('map').setView([51.505, -0.09], 5);

            L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { attribution: '© OpenStreetMap' }
            ).addTo(map);

            map.on("click", async function(e){

                const lat = e.latlng.lat;
                const lon = e.latlng.lng;

                const newCity = {
                    name:"Selected location",
                    lat:lat,
                    lon:lon
                };

                localStorage.setItem("weatherCity", JSON.stringify(newCity));

                await updateWeatherForLocation(lat, lon, newCity.name);

                mapContainer.style.display = "none";

            });

        }

    });

});