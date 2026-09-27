const apiUrl =
  'https://api.open-meteo.com/v1/forecast?latitude=42.33&longitude=-83.05&current=temperature_2m,apparent_temperature,weather_code&timezone=auto';

const tempValue = document.getElementById('tempValue');
const feelsLike = document.getElementById('feelsLike');
const conditionText = document.getElementById('weatherCondition');
const weatherIcon = document.getElementById('weatherIcon');
const outfitTitle = document.getElementById('outfitTitle');
const outfitList = document.getElementById('outfitList');
const refreshButton = document.getElementById('refreshButton');
const unitButtons = document.querySelectorAll('.unit-btn');

let currentTempC = 0;
let currentUnit = 'C';

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

async function fetchWeather() {
  try {
    conditionText.textContent = 'Loading...';
    tempValue.textContent = '--';
    feelsLike.textContent = 'Feels like --';

    const response = await fetch(apiUrl);

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

refreshButton.addEventListener('click', fetchWeather);

fetchWeather();
