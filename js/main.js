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
    let activeIndex = 0;

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
    });

    fahrenheitBtn.addEventListener("click", function () {
        currentUnit = "F";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        showWeather(activeIndex);
    });

    generateTenDaysFromMonday();
    renderDays();
    showWeather(0);
});