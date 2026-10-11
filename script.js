const STORAGE_KEY = 'weather-saved-cities';
const defaultCity = { name: 'Detroit', country: 'US', latitude: 42.33, longitude: -83.05 };

const tempValue = document.getElementById('tempValue');
const feelsLike = document.getElementById('feelsLike');
const conditionText = document.getElementById('weatherCondition');
const weatherIcon = document.getElementById('weatherIcon');
const outfitTitle = document.getElementById('outfitTitle');
const outfitList = document.getElementById('outfitList');
const refreshButton = document.getElementById('refreshButton');
const cityName = document.getElementById('cityName');
const cityInput = document.getElementById('cityInput');
const saveCityButton = document.getElementById('saveCityButton');
const savedCitiesList = document.getElementById('savedCitiesList');
const unitButtons = document.querySelectorAll('.unit-btn');

let currentTempC = 0;
let currentUnit = 'C';
let savedCities = loadSavedCities();
let currentCity = savedCities[0] || defaultCity;

const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌦️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Heavy rain showers', icon: '🌧️' },
  82: { label: 'Violent rain showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' },
};

function loadSavedCities() {
  try {
    const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(storedCities) ? storedCities : [];
  } catch (error) {
    console.error('Could not load saved cities:', error);
    return [];
  }
}

function saveCities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCities));
}

function formatCityLabel(city) {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

function setCurrentCity(city) {
  currentCity = city;
  cityName.textContent = formatCityLabel(city);
}

function renderSavedCities() {
  if (!savedCities.length) {
    savedCitiesList.innerHTML = '<li><span class="meta">No cities saved yet.</span></li>';
    return;
  }

  savedCitiesList.innerHTML = savedCities
    .map(
      (city) => `
        <li>
          <button class="saved-city-btn ${city.name === currentCity.name && city.country === currentCity.country ? 'active' : ''}" data-city-name="${city.name}" data-city-country="${city.country || ''}" type="button">
            ${formatCityLabel(city)}
          </button>
          <button class="remove-city-btn" data-remove-city="${city.name}" data-remove-country="${city.country || ''}" type="button" aria-label="Remove ${formatCityLabel(city)}">×</button>
        </li>
      `,
    )
    .join('');
}

function celsiusToFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

function formatTemperature(value) {
  if (currentUnit === 'C') {
    return `${Math.round(value)}°C`;
  }
  return `${Math.round(celsiusToFahrenheit(value))}°F`;
}

function getWeatherSummary(code) {
  return weatherCodeMap[code] || { label: 'Conditions vary', icon: '🌤️' };
}

function getOutfitAdvice(tempC) {
  if (tempC <= 5) {
    return {
      title: 'Bundle up!',
      items: [
        'Wear a heavy winter coat.',
        'Add a scarf, gloves, and warm boots.',
        'Layer with a sweater or fleece underneath.',
      ],
    };
  }

  if (tempC <= 12) {
    return {
      title: 'Cool but manageable',
      items: [
        'A light jacket or trench works well.',
        'Use a sweater or hoodie for warmth.',
        'Closed-toe shoes are a smart choice.',
      ],
    };
  }

  if (tempC <= 18) {
    return {
      title: 'Mild and comfortable',
      items: [
        'Choose a light sweater or long-sleeve shirt.',
        'A hoodie is a good option for cooler evenings.',
        'Jeans or casual pants will feel right.',
      ],
    };
  }

  if (tempC <= 24) {
    return {
      title: 'Springtime feel',
      items: [
        'A T-shirt or light polo is ideal.',
        'Bring a light layer for the evening.',
        'Sneakers or casual shoes are perfect.',
      ],
    };
  }

  if (tempC <= 30) {
    return {
      title: 'Warm day ahead',
      items: [
        'Wear shorts, a tank top, or a breathable T-shirt.',
        'Sunglasses and sunscreen will help.',
        'Keep a light jacket nearby for cooler air.',
      ],
    };
  }

  return {
    title: 'Hot weather alert',
    items: [
      'Choose light, breathable clothing like cotton or linen.',
      'Stay hydrated and protect yourself from the sun.',
      'Avoid heavy layers and wear comfortable sandals or sneakers.',
    ],
  };
}

function renderWeather(data) {
  const current = data.current;
  currentTempC = current.temperature_2m;
  const feelsLikeC = current.apparent_temperature;
  const weather = getWeatherSummary(current.weather_code);

  tempValue.textContent = formatTemperature(currentTempC);
  feelsLike.textContent = `Feels like ${formatTemperature(feelsLikeC)}`;
  conditionText.textContent = weather.label;
  weatherIcon.textContent = weather.icon;

  const advice = getOutfitAdvice(currentTempC);
  outfitTitle.textContent = advice.title;
  outfitList.innerHTML = advice.items.map((item) => `<li>${item}</li>`).join('');
}

async function geocodeCity(cityNameInput) {
  const encodedCity = encodeURIComponent(cityNameInput.trim());
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1&language=en&format=json`;

  const response = await fetch(geocodeUrl);

  if (!response.ok) {
    throw new Error('City lookup failed');
  }

  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error('City not found');
  }

  const location = data.results[0];
  return {
    name: location.name,
    country: location.country || location.admin1 || 'Unknown',
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

async function fetchWeatherForCity(city) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;

  try {
    conditionText.textContent = 'Loading...';
    tempValue.textContent = '--';
    feelsLike.textContent = 'Feels like --';
    setCurrentCity(city);

    const response = await fetch(forecastUrl);

    if (!response.ok) {
      throw new Error('Weather request failed');
    }

    const data = await response.json();
    renderWeather(data);
  } catch (error) {
    conditionText.textContent = 'Weather unavailable';
    tempValue.textContent = '—';
    feelsLike.textContent = 'Please try again later';
    outfitTitle.textContent = 'No outfit advice available';
    outfitList.innerHTML = '<li>Check your internet connection and refresh.</li>';
    weatherIcon.textContent = '⚠️';
    console.error(error);
  }
}

async function saveCity() {
  const cityText = cityInput.value.trim();

  if (!cityText) {
    return;
  }

  try {
    const city = await geocodeCity(cityText);

    const existingCity = savedCities.find(
      (savedCity) => savedCity.name.toLowerCase() === city.name.toLowerCase() && (savedCity.country || '').toLowerCase() === city.country.toLowerCase(),
    );

    if (!existingCity) {
      savedCities.push(city);
      saveCities();
    }

    renderSavedCities();
    setCurrentCity(city);
    cityInput.value = '';
    await fetchWeatherForCity(city);
  } catch (error) {
    conditionText.textContent = 'City not found';
    tempValue.textContent = '—';
    feelsLike.textContent = 'Try another city';
    outfitTitle.textContent = 'No outfit advice available';
    outfitList.innerHTML = '<li>Check the city name and try again.</li>';
    weatherIcon.textContent = '⚠️';
    console.error(error);
  }
}

unitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentUnit = button.dataset.unit;

    unitButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });

    tempValue.textContent = formatTemperature(currentTempC);
    feelsLike.textContent = `Feels like ${formatTemperature(currentTempC)}`;

    if (outfitTitle.textContent !== 'Getting your look ready...') {
      const advice = getOutfitAdvice(currentTempC);
      outfitTitle.textContent = advice.title;
      outfitList.innerHTML = advice.items.map((item) => `<li>${item}</li>`).join('');
    }
  });
});

saveCityButton.addEventListener('click', saveCity);
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveCity();
  }
});

savedCitiesList.addEventListener('click', async (event) => {
  const cityButton = event.target.closest('.saved-city-btn');
  if (cityButton) {
    const selectedCity = savedCities.find(
      (city) => city.name === cityButton.dataset.cityName && (city.country || '') === cityButton.dataset.cityCountry,
    );

    if (selectedCity) {
      setCurrentCity(selectedCity);
      renderSavedCities();
      await fetchWeatherForCity(selectedCity);
    }
    return;
  }

  const removeButton = event.target.closest('.remove-city-btn');
  if (removeButton) {
    const cityNameValue = removeButton.dataset.removeCity;
    const cityCountryValue = removeButton.dataset.removeCountry;

    savedCities = savedCities.filter(
      (city) => !(city.name === cityNameValue && (city.country || '') === cityCountryValue),
    );
    saveCities();
    renderSavedCities();

    if (savedCities.length) {
      const firstCity = savedCities[0];
      setCurrentCity(firstCity);
      fetchWeatherForCity(firstCity);
      return;
    }

    setCurrentCity(defaultCity);
    fetchWeatherForCity(defaultCity);
  }
});

refreshButton.addEventListener('click', () => fetchWeatherForCity(currentCity));

setCurrentCity(currentCity);
renderSavedCities();
fetchWeatherForCity(currentCity);
