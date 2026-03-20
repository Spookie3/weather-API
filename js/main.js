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

    let currentUnit = localStorage.getItem("currentUnit");
    if (currentUnit === null) {
        currentUnit = "C";
        localStorage.setItem("currentUnit", currentUnit);
    }
    let unitType = localStorage.getItem("unitType") || "metric";
    let activeIndex = 0;

    let dailyTemps = [];

    const weekDays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
    const fakeWeather = [];
    const popularCitiesArr = [
        { "name": "London", "lat": 51.5072, "lon": -0.1276 },
        { "name": "Paris", "lat": 48.8575, "lon": 2.3514 },
        { "name": "Stockholm", "lat": 59.3293, "lon": 18.0686 }
    ];
    localStorage.setItem("popCityString", JSON.stringify(popularCitiesArr));
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    let currentLocation = JSON.parse(localStorage.getItem("weatherCity"));
    if (currentLocation === null) {
        currentLocation = popularCitiesArr[0];
        localStorage.setItem("weatherCity", JSON.stringify(currentLocation));
    }

    // ===== GENERATE DAYS =====
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

        localStorage.setItem("weatherDates", JSON.stringify(fakeWeather));
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
                <img class="day-icon" src="" alt="">
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
        let temp = 0;

        selectedDayEl.textContent = data.day + " - " + data.date;

        if(dailyTemps[index]){

            temp = Math.round(dailyTemps[index].temp);

            temperatureEl.textContent = temp + "°" + currentUnit;

            weatherIconEl.innerHTML =
            `<img src="https://openweathermap.org/img/wn/${dailyTemps[index].icon}@2x.png">`;

        }
    }

    
    //Renders all cities in a specific div based on the provided array and element ID
    function renderCityList(cityString, divId) {
        divId.textContent = "";
        for(let i = 0; i < cityString.length; i++){
            const span = document.createElement("span");
            span.classList.add("city");
            span.textContent = cityString[i].name;
            divId.appendChild(span);
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
            renderAll();
        }
    });

    // ===== UNIT SWITCH ===== 
    // Changes variables for the current unit to celsius
    celsiusBtn.addEventListener("click", function () {

        currentUnit = "C";
        unitType = "metric";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        localStorage.setItem("currentUnit", "C");
        localStorage.setItem("unitType", unitType); 
        renderAll();
    });

    // Changes variables for the current unit to farenheit
    fahrenheitBtn.addEventListener("click", function () {

        currentUnit = "F";
        unitType = "imperial";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        localStorage.setItem("currentUnit", "F");
        localStorage.setItem("unitType", unitType);
        renderAll();
    });

    // Allows you to keep the selected temperature on refresh
    function activeTempUnit() {
        if(currentUnit === "C") {
            celsiusBtn.classList.add("active");
            fahrenheitBtn.classList.remove("active");
        } else {
            fahrenheitBtn.classList.add("active");
            celsiusBtn.classList.remove("active");
        }
    }
    
    // Opens and closes the menu
    menuBtn.addEventListener("click", function () {
        if (toggle===1){
            toggle = 0;
            menuList.classList.remove("activeMenu");
        } else {
            toggle = 1;
            menuList.classList.add("activeMenu");
        }
        
    });

    // ===== FETCH DAILY WEATHER FROM OPENWEATHER =====
    async function loadDailyWeather(lat, lon, unitType) {

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

        // 🔥 NYTT: uppdatera huvudkortet efter ny stad
        showWeather(activeIndex);

    }

    // ===== UPDATE UI WITH DAILY TEMPS =====
    function updateDailyUI() {

        const items = document.querySelectorAll(".day-item");

        items.forEach((item, index) => {

            const tempSpan = item.querySelector(".day-temp");
            const iconImg = item.querySelector(".day-icon");

            if (dailyTemps[index]) {

                const temp = Math.round(dailyTemps[index].temp);
                tempSpan.textContent = temp + "°";

                iconImg.src =
                `https://openweathermap.org/img/wn/${dailyTemps[index].icon}.png`;

            } else {

                tempSpan.textContent = "--";
                iconImg.src = "";

            }

        });

    }

    async function updateWeatherForLocation(lat, lon, name){

        document.getElementById("city").textContent = name;

        activeIndex = 0;
        localStorage.setItem("day",0);

        await fetchWeather(lat, lon, unitType);

        await loadDailyWeather(lat, lon, unitType);

        getHourlyForecastData(
            lat,
            lon,
            "80948121ac889b120dca64a6c7e5f24c",
            unitType
        );

        showWeather(0);

    }

    window.updateWeatherForLocation = updateWeatherForLocation;

    const arrow = document.getElementById("arrow-down");

    arrow.addEventListener("click", () => {

        daysList.classList.toggle("expanded");
        arrow.classList.toggle("rotate");

    });

    // ===== INITIAL LOAD =====
    function renderAll() {
        currentLocation = JSON.parse(localStorage.getItem("weatherCity")) || [];
        cities = JSON.parse(localStorage.getItem("cities")) || [];
        getHourlyForecastData(currentLocation.lat, currentLocation.lon, "80948121ac889b120dca64a6c7e5f24c", unitType);
        renderCityList(cities, prevHistory);
        fetchWeather(currentLocation.lat, currentLocation.lon, unitType);
        showWeather(activeIndex);
        loadDailyWeather(currentLocation.lat, currentLocation.lon, unitType);
    }
  
    generateNextTenDays();
    renderDays();
    showWeather(activeIndex);
    renderAll();
    renderCityList(cities, prevHistory);
    activeTempUnit();

    if (currentLocation) {

        updateWeatherForLocation(currentLocation.lat, currentLocation.lon, currentLocation.name);

    }

    // ===== CITY SELECT =====

    // GET UI elements

    city.addEventListener("click", async() => {     //to prevent renderall() to act first
        await openSearchModal();
        renderAll(); 
    });


    // When clicking location icon > open map
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
                localStorage.setItem(
                    "weatherCity",
                    JSON.stringify(newCity)
                );
                // Save to history
                saveCity("new City", lat, lon);

                // Update UI
                renderAll();
                await updateWeatherForLocation(lat, lon, newCity.name);

                mapContainer.style.display = "none";

            });

        }

    });

});