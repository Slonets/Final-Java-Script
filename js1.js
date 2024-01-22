//виводимо сьогоднішню дату

// Отримати поточну дату
var today = new Date();

// Отримати день, місяць і рік
var day = today.getDate();
var month = today.getMonth() + 1; // Місяці в JavaScript починаються з 0, тому додаємо 1
var year = today.getFullYear();

// Форматування для виведення у вигляді "день, місяць, рік"
var formattedDate = day + '.' + month + '.' + year;

var todatDate = document.querySelector(".currentDay");
todatDate.textContent = formattedDate;

//ключ для API
const appid = "bc01f1279b34c31768ef242a8a26630f";

//змінні для пошуку довготи й широти
let lat, lon;

//url для сайту
const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${appid}&lang=ua`;

//прогноз погоди погодинно
const url2 = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${appid}&lang=ua`;

//зміння для пошуку геолокації користувача
let seachUrl;

//змінна для пошуку погоди погодинно по геолокації
let seachHour;

let city;

//Показ div

function showInfo1() {
    document.getElementById('info1').style.display = 'block';
    document.getElementById('info2').style.display = 'none';
}

function showInfo2() {
    document.getElementById('info1').style.display = 'none';
    document.getElementById('info2').style.display = 'block';
}

showInfo2();

showInfo1();

document.getElementById("buttonSeach").addEventListener("click", function (e) {
    e.preventDefault(); //Скасовуємо стандартну повідінку для кнопки в формі
    performSearch();
});

function performSearch() {

    let value = document.getElementById("cityInput").value;


    city = value;
    console.log("Data input", value);

    //Якщо введено імя міста, то заповнює дані
    if (city.trim() !== "") {
        searchByCity(city);
        searchByCity2(city);
        nearbyCities2(url, city);
        
        //Заповнення прогнозу на другому мейні. Першої секції
        WheatherDayOfWeek(seachHour);
    }
    else {
        //знаходимо геолокацію користувача
        navigator.geolocation.getCurrentPosition(post => {
            console.log(`My location: ${post.coords.latitude}: ${post.coords.longitude}`);
            lat = post.coords.latitude;
            lon = post.coords.longitude;

            //зберігатиємо геолокацію користувача в змінну
            seachUrl = `${url}&lat=${lat}&lon=${lon}`;

            //зберігатиємо геолокацію користувача в змінну для пошуку погоди погодинно
            seachHour = `${url2}&lat=${lat}&lon=${lon}`;

            //отримуємо дані погоди
            getRequest(seachUrl);
            console.log(seachUrl);

            getRequest2(seachHour);
            console.log(seachHour);

            nearbyCities(url, lat, lon);

            //Заповнення прогнозу на другому мейні. Першої секції
            WheatherDayOfWeek(seachHour);

        }, () => {
            console.log("Cannot get your location");
        });
    }
}


function getRequest(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(`Div1 = ${data}`);
            //Заповнення даними першого div
            currentWheather(data);
        });
}

//Тут погода приходить по годинах для одного міста
function getRequest2(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(`Div2 = ${data}`);

            //заповнення даними погоди div2
            weatherByHourDay(data);
        });
}

//формуємо перший div погоди
function currentWheather(data) {
    let curentIcon = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    let img = document.getElementById("myImage");
    img.src = `${curentIcon}`;

    let textImg = document.getElementById("myImageText");
    let text = data.weather[0].description;
    //Робимо, щоб перша буква була з великої
    let newText = text.charAt(0).toUpperCase() + text.slice(1);
    textImg.textContent = newText;

    //записую у поле пошуку в плейсхолдер назву міста
    let city = document.getElementById("cityInput");
    city.setAttribute("placeholder", data.name);

    //виводимо градуси
    let gradus = document.getElementById("gradus");
    let currenGradus = Math.floor(data.main.temp);
    gradus.textContent = currenGradus + '\u00B0C';

    //виводимо реально відчувається
    let Fellgradus = document.getElementById("fellGradus");
    let fellGradus = Math.floor(data.main.feels_like);
    Fellgradus.textContent = "Відчувається як: " + fellGradus + '\u00B0C';

    //Виведення даних, коли Сонце встане і ляже

    let sunriseTimestamp = data.sys.sunrise;
    let sunsetTimestamp = data.sys.sunset;

    let a = convertTimestampToTime(sunriseTimestamp);
    let b = convertTimestampToTime(sunsetTimestamp);
    let c = calculateDayDuration(sunriseTimestamp, sunsetTimestamp);

    let sunRise = document.getElementById("sunRise");
    sunRise.textContent = "Sunrise: " + a;

    let sunSet = document.getElementById("sunSet");
    sunSet.textContent = "Sunset: " + b;

    let duration = document.getElementById("Duration");
    duration.textContent = "Duration: " + c;
}

// Функція для конвертації UNIX timestamp у формат година:хвилина AM/PM
function convertTimestampToTime(timestamp) {
    const date = new Date(timestamp * 1000); // UNIX timestamp в мілісекундах
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Форматування годин та хвилин
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Функція для обчислення тривалості світлового дня
function calculateDayDuration(sunriseTimestamp, sunsetTimestamp) {
    const daylightDuration = sunsetTimestamp - sunriseTimestamp;
    const hours = Math.floor(daylightDuration / 3600);
    const minutes = Math.floor((daylightDuration % 3600) / 60);

    return `${hours} годин ${minutes} хвилини`;
}

//Функція для пошуку погоди за сіty
//https:api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

//поле введення


function searchByCity(city) {
    let urlByCity = url + "&q=" + city;
    console.log(urlByCity);

    fetch(urlByCity)
        .then(respons => respons.json())
        .then(data => {
            console.log(data);

            //Заповнення div1
            currentWheather(data);

        })
        .catch(eror => console.log(eror));
}

function searchByCity2(city) {
    let urlByCity = url2 + "&q=" + city;
    console.log(urlByCity);

    fetch(urlByCity)
        .then(respons => respons.json())
        .then(data => {
            console.log(data);

            //Заповнення div2
            weatherByHourDay(data);
        })
        .catch(eror => console.log(eror));
}

//Формуємо функцію погодинної погоди
function weatherByHourDay(data) {
    // Отримуємо список прогнозів
    let forecasts = data.list;

    // Цикл для обробки кожного елемента прогнозу
    for (let i = 0; i < 6; i++) {
        let forecast = forecasts[i];

        // Отримуємо дату та час прогнозу
        let dt_txt = forecast.dt_txt;

        // Отримуємо години за допомогою вашої функції pasrHour
        let hours = pasrHour(dt_txt);

        // Оновлюємо відповідний елемент hX
        let timeElement = document.getElementById(`h${i + 1}`);

        if (hours == 0) {
            hours = "00:00";
            timeElement.textContent = hours;
        }
        else {
            timeElement.textContent = hours + " год.";
        }

        //витягую фото
        let imgSeach = forecast.weather[0].icon;

        // Формуємо URL до зображення на основі значення "icon"
        let imageUrl = `https://openweathermap.org/img/w/${imgSeach}.png`;

        // Оновлюємо відповідний елемент hX
        let imgElement = document.getElementById(`img${i + 1}`);
        imgElement.src = imageUrl;

        //виймаємо назву погоди
        let weatherHour = forecast.weather[0].description;

        //Робимо першу букву з великої
        let newweatherHour = weatherHour.charAt(0).toUpperCase() + weatherHour.slice(1);

        let forecastElm = document.getElementById(`f${i + 1}`);

        forecastElm.textContent = newweatherHour;

        //Записуємо градуси
        let temp0 = document.getElementById(`t0`);
        temp0.textContent = "Temp (" + '\u00B0C' + ")";

        let temp = Math.floor(forecast.main.temp);

        let tempElm = document.getElementById(`t${i + 1}`);
        tempElm.textContent = temp + '\u00B0C';

        //заповнення RealFeel
        let realFeel = Math.floor(forecast.main.feels_like);
        let realFeelElm = document.getElementById(`r${i + 1}`);
        realFeelElm.textContent = realFeel + '\u00B0';

        //вітер
        let wind_speed = Math.floor(forecast.wind.speed);
        let wind_deg = degrees_to_direction(forecast.wind.deg);

        let windElm = document.getElementById(`w${i + 1}`);
        windElm.textContent = wind_speed + wind_deg;
    }

}

//функція, щоб відрізати від годин хвилини
function pasrHour(dateTimeString) {
    // Ваш код для вилучення годин із рядка дати та часу
    // Приклад: "2024-01-14 18:00:00" -> "18"
    let dateObj = new Date(dateTimeString);
    let hours = dateObj.getHours();
    return hours; // Перетворюємо години в рядок
}

//Функція перетворення градусів у напрям
function degrees_to_direction(degrees) {
    // Отримати напрямок за градусами

    if (22.5 <= degrees && degrees < 67.5) {
        return "ESE";
    }
    else if (67.5 <= degrees && degrees < 112.5) {
        return "E";
    }
    else if (112.5 <= degrees && degrees < 157.5) {
        return "SE";
    }
    else if (157.5 <= degrees && degrees < 202.5) {
        return "SSE";
    }
    else if (202.5 <= degrees && degrees < 247.5) {
        return "S";
    }
    else if (247.5 <= degrees && degrees < 292.5) {
        return "SSW";
    }
    else if (292.5 <= degrees && degrees < 337.5) {
        return "SW";
    }
    else {
        return "W";
    }

}

//Отримуємо міста, що поблизу за геолокацією
async function nearbyCities(url, lat, lon) {
    // Створюємо обіцянки для кожного міста
    const promise1 = await fetch(`${url}&lat=${lat + 0.1}&lon=${lon + 0.1}`);
    const promise2 = await fetch(`${url}&lat=${lat - 0.1}&lon=${lon - 0.1}`);
    const promise3 = await fetch(`${url}&lat=${lat + 0.2}&lon=${lon - 0.2}`);
    const promise4 = await fetch(`${url}&lat=${lat - 0.2}&lon=${lon + 0.2}`);

    console.log(`2 місто:`, `${url}&lat=${lat - 0.1}&lon=${lon - 0.1}`);

    const city1 = await promise1.json();
    let city1Name = document.getElementById(`nearCityName1`);
    city1Name.textContent = city1.name;

    //витягую фото
    let imgSeach = city1.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl = `https://openweathermap.org/img/w/${imgSeach}.png`;

    let city1Img = document.getElementById(`nearCityImg1`);
    city1Img.src = imageUrl;

    let nearCityTemp1 = document.getElementById(`nearCityTemp1`);
    nearCityTemp1.textContent = Math.floor(city1.main.temp) + '\u00B0C';


    const city2 = await promise2.json();
    let city2Name = document.getElementById(`nearCityName2`);
    city2Name.textContent = city2.name;

    //витягую фото
    let imgSeach2 = city2.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl2 = `https://openweathermap.org/img/w/${imgSeach2}.png`;

    let city2Img = document.getElementById(`nearCityImg2`);
    city2Img.src = imageUrl;

    let nearCityTemp2 = document.getElementById(`nearCityTemp2`);
    nearCityTemp2.textContent = Math.floor(city2.main.temp) + '\u00B0C';


    const city3 = await promise3.json();

    let city3Name = document.getElementById(`nearCityName3`);
    city3Name.textContent = city3.name;

    //витягую фото
    let imgSeach3 = city3.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl3 = `https://openweathermap.org/img/w/${imgSeach3}.png`;

    let city3Img = document.getElementById(`nearCityImg3`);
    city3Img.src = imageUrl3;

    let nearCityTemp3 = document.getElementById(`nearCityTemp3`);
    nearCityTemp3.textContent = Math.floor(city3.main.temp) + '\u00B0C';

    const city4 = await promise4.json();

    let city4Name = document.getElementById(`nearCityName4`);
    city4Name.textContent = city4.name;

    //витягую фото
    let imgSeach4 = city4.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl4 = `https://openweathermap.org/img/w/${imgSeach4}.png`;

    let city4Img = document.getElementById(`nearCityImg4`);
    city4Img.src = imageUrl4;

    let nearCityTemp4 = document.getElementById(`nearCityTemp4`);
    nearCityTemp4.textContent = Math.floor(city4.main.temp) + '\u00B0C';

}

//Отримуємо ближні міста за назвою міста
async function nearbyCities2(url, city) 
{
    console.log(`Урл:`, url)

    console.log(`Місто:`, city);

    let urlByCity = url + "&q=" + city;

    console.log(`Пошуковий рядок:`, urlByCity);

    const seach = await fetch(urlByCity);

    const data = await seach.json();

    console.log(`Обєкт:`, data);

    let lat = data.coord.lat;
    let lon = data.coord.lon;

    // Створюємо обіцянки для кожного міста
    const promise1 = await fetch(`${url}&lat=${lat + 0.1}&lon=${lon + 0.1}`);
    const promise2 = await fetch(`${url}&lat=${lat - 0.1}&lon=${lon - 0.1}`);
    const promise3 = await fetch(`${url}&lat=${lat + 0.2}&lon=${lon - 0.2}`);
    const promise4 = await fetch(`${url}&lat=${lat - 0.2}&lon=${lon + 0.2}`);

    const city1 = await promise1.json();
    let city1Name = document.getElementById(`nearCityName1`);
    city1Name.textContent = city1.name;

    //витягую фото
    let imgSeach = city1.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl = `https://openweathermap.org/img/w/${imgSeach}.png`;

    let city1Img = document.getElementById(`nearCityImg1`);
    city1Img.src = imageUrl;

    let nearCityTemp1 = document.getElementById(`nearCityTemp1`);
    nearCityTemp1.textContent = Math.floor(city1.main.temp) + '\u00B0C';


    const city2 = await promise2.json();
    let city2Name = document.getElementById(`nearCityName2`);
    city2Name.textContent = city2.name;

    //витягую фото
    let imgSeach2 = city2.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl2 = `https://openweathermap.org/img/w/${imgSeach2}.png`;

    let city2Img = document.getElementById(`nearCityImg2`);
    city2Img.src = imageUrl;

    let nearCityTemp2 = document.getElementById(`nearCityTemp2`);
    nearCityTemp2.textContent = Math.floor(city2.main.temp) + '\u00B0C';


    const city3 = await promise3.json();

    let city3Name = document.getElementById(`nearCityName3`);
    city3Name.textContent = city3.name;

    //витягую фото
    let imgSeach3 = city3.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl3 = `https://openweathermap.org/img/w/${imgSeach3}.png`;

    let city3Img = document.getElementById(`nearCityImg3`);
    city3Img.src = imageUrl3;

    let nearCityTemp3 = document.getElementById(`nearCityTemp3`);
    nearCityTemp3.textContent = Math.floor(city3.main.temp) + '\u00B0C';

    const city4 = await promise4.json();

    let city4Name = document.getElementById(`nearCityName4`);
    city4Name.textContent = city4.name;

    //витягую фото
    let imgSeach4 = city4.weather[0].icon;

    // Формуємо URL до зображення на основі значення "icon"
    let imageUrl4 = `https://openweathermap.org/img/w/${imgSeach4}.png`;

    let city4Img = document.getElementById(`nearCityImg4`);
    city4Img.src = imageUrl4;

    let nearCityTemp4 = document.getElementById(`nearCityTemp4`);
    nearCityTemp4.textContent = Math.floor(city4.main.temp) + '\u00B0C';
}

async function WheatherDayOfWeek(url) 
{
    const response = await fetch(url);

    const data = await response.json();

    // Виведення інформації про погоду на 5 днів
    for (let i = 0; i < 5; i++) {
        // Отримання часу (timestamp) погоди для кожного з 5 днів
        const timestamp = data.list[i * 8].dt;

        // Створення об'єкту дати для подальшого використання
        const date = new Date(timestamp * 1000);

        // Отримання короткого назви дня тижня (наприклад, "Mun" для понеділка)
        const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
        let nameDay = document.getElementById(`hDay${i + 1}`);
        nameDay.textContent = dayOfWeek;

        const longDayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

        // Отримання короткого назви місяця (наприклад, "Jan" для січня)
        const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

        // Отримання числа місяця (наприклад, 1 для 1 січня)
        const day = date.getDate();

        let numberDayAndnameMounth = document.getElementById(`h3Day${i + 1}`);
        numberDayAndnameMounth.textContent = month + ' ' + day;

        // Отримання іконки, що представляє стан погоди
        const iconCode = data.list[i * 8].weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
        let IconDayWheather = document.getElementById(`imgDay${i + 1}`);
        IconDayWheather.src = iconUrl;

        // Отримання температури для кожного дня
        const temperature = Math.floor(data.list[i * 8].main.temp);
        let temperatureDayWheather = document.getElementById(`pDay${i + 1}`);
        temperatureDayWheather.textContent = temperature + " °C ";

        const nameWheather = data.list[i * 8].weather[0].description;
        let NameWheather = document.getElementById(`h32Day${i + 1}`);
        NameWheather.textContent = nameWheather;

        //картки для виведення погоди
        const weatherCard = document.getElementById(`weatherCard${i + 1}`);

        // Додавання обробника подій для відображення погодинної інформації в weatherDetails
        // Створення замикання для збереження значення i в контексті обробника подій
        weatherCard.addEventListener('click', createShowHourlyWeatherHandler(data.list, i, longDayOfWeek));

        document.getElementById('oneHourCityWeather_2').style.display='none';
    }
}

function createShowHourlyWeatherHandler(data, index, dayOfWeek) {
    // Замикання для збереження значення i та довгого назви дня тижня в контексті обробника подій
    return function () {
        showHourlyWeather(data, index * 8, dayOfWeek);
    };
}

function showHourlyWeather(data, startIndex, dayOfWeek) 
{
    document.getElementById('oneHourCityWeather_2').style.display='block';

    // Очистка попередніх даних
    let nameDay = document.getElementById(`dayName`);
    nameDay.textContent = dayOfWeek;

    // Виведення погодинної інформації
    for (let j = 0; j < 6; j++) 
    {
        const hourTimestamp = data[startIndex + j].dt;

        const hourDate = new Date(hourTimestamp * 1000);
        
        const hour = hourDate.getHours();
        const hourTemperature = data[startIndex + j].main.temp;

        // Отримання іконки, що представляє стан погоди
        const iconCode = data[startIndex + j].weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
        let IconDayWheather = document.getElementById(`foto${j + 1}`);
        IconDayWheather.src = iconUrl;        

        // Отримуємо дату та час прогнозу
        let dt_txt = data[startIndex + j].dt_txt;

        // Отримуємо години за допомогою вашої функції pasrHour
        let hours = pasrHour(dt_txt);

        // Оновлюємо відповідний елемент hX
        let timeElement = document.getElementById(`hod${j + 1}`);

        if (hours == 0) 
        {
            hours = "00:00";
            timeElement.textContent = hours;
        }
        else 
        {
            timeElement.textContent = hours + " год.";
        }

        //виймаємо назву погоди
        let weatherHour = data[startIndex + j].weather[0].description;

        //Робимо першу букву з великої
        let newweatherHour = weatherHour.charAt(0).toUpperCase() + weatherHour.slice(1);

        let forecastElm = document.getElementById(`forecast${j + 1}`);

        forecastElm.textContent = newweatherHour;

        
        //Записуємо градуси
        let temp0 = document.getElementById(`temp0`);
        temp0.textContent = "Temp (" + '\u00B0C' + ")";

        let temp = Math.floor(data[startIndex + j].main.temp);

        let tempElm = document.getElementById(`temp${j + 1}`);
        tempElm.textContent = temp + '\u00B0C';

        //заповнення RealFeel
        let realFeel = Math.floor(data[startIndex + j].main.feels_like);
        let realFeelElm = document.getElementById(`real${j + 1}`);
        realFeelElm.textContent = realFeel + '\u00B0';

        //вітер
        let wind_speed = Math.floor(data[startIndex + j].wind.speed);
        let wind_deg = degrees_to_direction(data[startIndex + j].wind.deg);

        let windElm = document.getElementById(`wind${j + 1}`);
        windElm.textContent = wind_speed + wind_deg;
    }
}

performSearch();


