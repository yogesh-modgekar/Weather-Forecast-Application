
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCardsDiv = document.getElementById("weatherCardsDiv");
const currentWeather = document.getElementById("weather");
const locationBtn = document.getElementById("locationBtn");

//API KEY FOR OPENWEATHERMAP API
const apiKey = "8875a6127c2072987d918fd97b342396";

const createWeatherCard = (cityName, weatherItem,index)=>{
    if(index === 0){
        return`<div class="flex justify-center items-center">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" class=" w-52 mt-3 items-center" id="weatherIcon" alt="not found">
                    <div>
                         <p>Date : ${weatherItem.dt_txt.split(" ")[0]}</p>
                        <h1 id="temp" class="font-bold text-3xl mt-5">${(weatherItem.main.temp-273.15).toFixed(2)}°C</h1>
                         <h2 id="city" class="font-bold text-2xl mt-5">${cityName}</h2>
                    </div>
                </div>

                      <div id="details" class="w-full flex flex-col items-center justify-center gap-x-14 border">
                          <div id="col" class="flex items-center">
                               <img src="images/humidity.png" alt="not found" class="w-10 ">
                               <div>
                                   <p class="font-bold text-xl" id="humidity">${weatherItem.main.humidity}</p>
                                   <p class="font-semibold text-l px-2">Humidity</p>
                               </div>
                          </div>

                          <div id="col" class="flex items-center">
                            <img src="images/wind.png" alt="not found" class="w-10">
                            <div>
                                <p class="font-bold text-xl" id="wind">${weatherItem.wind.speed} Km/h</p>
                                <p class="font-semibold text-l px-2">Wind Speed</p>
                            </div>
                       </div>
                      </div>`
    }
    return` <li class="p-5 border border-white">
                        <p>Date : ${weatherItem.dt_txt.split(" ")[0]}</p>
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png " class="text-center">
                        <p>Temp : ${(weatherItem.main.temp-273.15).toFixed(2)}°C</p>
                        <p>Wind : ${weatherItem.wind.speed}km/h</p>
                        <p>Huminity : ${weatherItem.main.humidity}%</p>
            </li>`
}

const getWeatherDetails = (cityName, lat, lon)=>{
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`

    fetch(WEATHER_API_URL)
    .then(res=>res.json())
    .then(data=>{
        
        //FILTER THE FORECAST TO GET ONLY  ONE FORECAST PER DAY
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(e=>{
            const forecastDate = new Date(e.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        })
        // CLEARING PREVIOUS WEATHER DATA
         searchInput.value = "";
         currentWeather.innerHTML = "";
         weatherCardsDiv.innerHTML = "";

        console.log(fiveDaysForecast);
           
        fiveDaysForecast.forEach((weatherItem,index) => {
            if(index === 0){
                currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }else{
           weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
            }
        });
    })
    // ERROR HANDELING USING .THEN() & .CATCH() METHOD
    .catch((Error)=>{
        console.log(Error);
        alert("Aan Error Occured while fetching the weather forecast!");
    });
}

const getCityCordinates = () =>{
    let cityName = searchInput.value.trim();
    if(!cityName) return;
    // GET CITY COORDINATES FROM OPENWEATHER API
    const API_URL =  `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
    fetch(API_URL)
    .then(res=>res.json())
    .then(data =>{
        console.log(data)
        if(!data.length) return alert(`No Coordinates found for ${cityName}`)  
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    })
    .catch((Error)=>{
        console.log(Error);
        alert("Aan Error Occured while fetching the coordinates");
    })
}

const getUserCordinates = ()=>{
    navigator.geolocation.getCurrentPosition(position =>{
        const {latitude,longitude} = position.coords
        const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
        
        // GET USER CURRENT LOCATION
        fetch(REVERSE_GEOCODING_URL)
        .then(res=>res.json())
        .then(data=>{
            const {name} = data[0];
            getWeatherDetails(name, latitude, longitude);
        }).catch(()=>{
            alert("Error ocured while fetching user location");
        })
    },
    error =>{
        if(error.code === error.PERMISSION_DENIED){ // ERROR HANDELING WHEN USER DENIED REQUEST
            alert("Geolocation Request Denied");
        }
    });
}
searchBtn.addEventListener("click",getCityCordinates);
locationBtn.addEventListener("click",getUserCordinates);