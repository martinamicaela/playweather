const MapLocationDiv = document.getElementById("map");

const mainWeatherSection = document.querySelector("#weatherSection");
const mainWeatherSection2 = document.querySelector("#weatherSection2");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-btn");
const userLocationButton = document.querySelector("#userlocation-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const daysForecastDiv = document.querySelector(".days-forecast");
var searchHistoryDiv = document.getElementById("searchHistory");
const API_KEY = "2e8632aaf4cafb36fca28129a00dbda7"; //Ellis' API KEY use for TESTING ONLY



// Create weather card HTML based on weather data
const createWeatherCard = (cityName, weatherItem, index) => {
    var description = weatherItem.weather[0].description
    description = description.charAt(0).toUpperCase() + description.slice(1);
    var dateText = new Date(weatherItem.dt_txt).toDateString(); //use dateText for date formatting options instead of dt_txt returned from API

    if(index === 0) {
        return `<div class="mt-3 d-flex justify-content-between">
                    <div>
                        <h3 class="fw-bold text-center">${cityName} (${dateText})</h3>
                        <h6 class="my-3 mt-3 text-center">Temperature: ${((weatherItem.main.temp - 273.15).toFixed(2))}°C</h6>
                        <h6 class="my-3 text-center">Wind: ${weatherItem.wind.speed} M/S</h6>
                        <h6 class="my-3 text-center">Humidity: ${weatherItem.main.humidity}%</h6>
                    </div>
                    <div class="text-center me-lg-5">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather icon">
                        <h6>${weatherItem.weather[0].description}</h6>
                    </div>
                </div>`;
    } else {
        return `<div class="col mb-3">
                    <div class="card border-0 bg-secondary text-white forecast-wrap">
                        <div class="card-body p-3 text-white">
                            <h5 class="card-title fw-semibold text-center">(${dateText})</h5>
                            <h6 class="card-text text-center">${description}</h6>
                            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" class="rounded mx-auto d-block" alt="weather icon">
                        </div>
                        <div class="card-body p-3 text-white"> 
                            <h6 class="card-text my-3 mt-3 text-center">Temp: ${((weatherItem.main.temp - 273.15).toFixed(2))}°C</h6>
                            <h6 class="card-text my-3 text-center">Wind: ${weatherItem.wind.speed} M/S</h6>
                            <h6 class="card-text my-3 text-center">Humidity: ${weatherItem.main.humidity}%</h6>
                        </div>
                    </div>
                </div>`;
    }
}

// Get weather details of passed latitude and longitude
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const forecastArray = data.list;
        const uniqueForecastDays = new Set();
        const fiveDaysForecast = forecastArray.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 6) {
                uniqueForecastDays.add(forecastDate);
                return true;
            }
            return false;
        });
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        daysForecastDiv.innerHTML = "";
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                daysForecastDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

// Get coordinates of entered city name
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}, please check you spelling and try again.`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
        MapLocationDiv.innerHTML = "";
        addMapCoord (lat,lon);
        addCityToList(name);

    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
   
    removeHome()
}
// Gets User coords using built in navigator.geolocation.getCurrentPosition and uses the location information to call the API and add to the other relevant functions
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
                addCityToList(name);
                var lat = latitude;
                var lon = longitude;
                MapLocationDiv.innerHTML = "";
                addMapCoord (lat,lon);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });

    removeHome()
}

// Function to add city to the list
function addCityToList(name) {
    // Get the text from the city search box
    var list = document.querySelectorAll(".list-group-item");


    // Check if the input is not empty
    if (name.trim() !== "") {
        
       
        // Create a new list item
        var newListItem = document.createElement("li");
        newListItem.className = "list-group-item card border-0 bg-secondary text-white mt-3";
       // Create capitalised version of the city name
        var lowerName = name.toLowerCase();
        var capName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
        newListItem.textContent = capName;
        
        // Create an empty array to be filled with list items innerHTML
        var listArray=[];
        // Check if list item array
        if(listArray !== "") {
            for (var i=0;i<list.length;i++){
                listArray.push(list[i].innerHTML);
        }
        
        // Get reference to the existing ul
        var searchListUl = document.getElementById("searchList");

        // Append the new list item to the existing ul
        if(!listArray.includes(capName)) {
            searchListUl.appendChild(newListItem);
            searchListUl.classList.add("text-center");
        }
        }
    }
}

// A function that removes or adds the d-none class to hide the homepage section and reveal  the weather section

const removeHome = () => {
    mainWeatherSection.classList.remove('d-none');
    mainWeatherSection2.classList.remove('d-none');
    searchHistoryContainer.classList.remove('d-none');
    homePage.classList.add('d-none');
}

// Add function that takes the relevant city latitude and longitude coordinates 
// and passes them into a template literal that is then inserted into the innerhtml or the map div.

function addMapCoord (lat,lon) {
    const mapHTML= `<gmp-map center="${lat},${lon}" zoom="14" map-id="DEMO_MAP_ID">
        <gmp-advanced-marker position="${lat},${lon}" title="My location"></gmp-advanced-marker>
        </gmp-map>`;
        MapLocationDiv.innerHTML=mapHTML;
}

//Add event listener


userLocationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());





