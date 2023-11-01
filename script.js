'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
  //   countriesContainer.style.opacity = 1;
};

const renderCountry = function (data, className = '') {
  const html = `
          <article class="country ${className}">
            <img class="country__img" src="${data.flag}" />
            <div class="country__data">
              <h3 class="country__name">${data.name}</h3>
              <h4 class="country__region">${data.region}</h4>
              <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)} people</p>
              <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
              <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
            </div>
          </article>
    `;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  //   countriesContainer.style.opacity = 1;
};

/****************** method 1 XMLHttpRequest & callback hell ******************/

// const getCountryAndNeighbour = function (country) {
//   // AJAX call for first country
//   const request = new XMLHttpRequest();
//   request.open('GET', `https://restcountries.com/v2/name/${country}`);
//   request.send();

//   request.addEventListener('load', function () {
//     const [data] = JSON.parse(this.responseText);
//     console.log(data);
//     // render for first country
//     renderCountry(data);

//     // get neighbour country after getting the first country
//     const [neighbour] = data.borders;
//     if (!neighbour) return;
//     // AJAX call for second country
//     const request2 = new XMLHttpRequest();
//     request2.open('GET', `https://restcountries.com/v2/alpha/${neighbour}`);
//     request2.send();

//     request2.addEventListener('load', function () {
//       const data2 = JSON.parse(this.responseText);
//       console.log(data2);
//       renderCountry(data2, 'neighbour');
//     });
//   });
// };

// getCountryAndNeighbour('usa');

/*************** method 2 fetch API and promises **************/

/**fetch() 回傳的 promise 不會 reject HTTP 的 error status，就算是 HTTP 404 或 500 也一樣。相反地，它會正常地 resolve，並把 ok status 設為 false。會讓它發生 reject 的只有網路錯誤或其他會中斷 request 的情況。 */

/***** method 2.1 without Encapsulation (fetch + then(error handle + parse to JSON))******/
// const getCountryData = function (country) {
//   fetch(`https://restcountries.com/v2/name/${country}`)
//     .then(response => {
//       /*** reject promise (throwing errors) manually ***/
//       if (!response.ok) throw new Error(`Country not found! (${response.status})`);

//       return response.json();
//     })
//     .then(data => {
//       renderCountry(data[0]);
//       const neighbour = data[0].borders[0];

//       if (!neighbour) return;
//       return fetch(`https://restcountries.com/v2/alpha/${neighbour}`);
//     })
//     .then(response => {
//       /*** reject promise (throwing errors) manually ***/
//       if (!response.ok) throw new Error(`Country not found! (${response.status})`);
//       response.json();
//     })
//     .then(data => renderCountry(data, 'neighbour'))
//     .catch(err => renderError(`Somthing went wrong: ${err.message}. Try again!`))
//     .finally(() => {
//       countriesContainer.style.opacity = 1;
//     });
// };

/***** method 2.1 with Encapsulation (fetch + then(error handle + parse to JSON))******/

const getJSON = function (url, errorMsg = 'Somthing went wrong') {
  return fetch(url).then(response => {
    /*** reject promise (throwing errors) manually ***/
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
    /*** return data if fulfilled ***/
    return response.json();
  });
};

const getCountryData = function (country) {
  getJSON(`https://restcountries.com/v2/name/${country}`, 'Country not found')
    .then(data => {
      renderCountry(data[0]);
      if (!('borders' in data[0])) throw new Error(`No neighbour found!`);
      const neighbour = data[0].borders[0];
      return getJSON(`https://restcountries.com/v2/alpha/${neighbour}`, 'Country not found');
    })
    .then(data => renderCountry(data, 'neighbour'))
    .catch(err => {
      console.log(err);
      renderError(`Somthing went wrong: ${err.message}. Try again!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

/***** example 2  Where am I ? ******/

btn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    console.log(pos.coords.latitude, pos.coords.longitude);
    fetch(`https://geocode.xyz/${pos.coords.latitude},${pos.coords.longitude}?geoit=JSON`)
      .then(geoResponse => geoResponse.json())
      .then(data => {
        if (data.distance == 'Throttled! See geocode.xyz/pricing') {
          throw new Error(`Throttled...`);
        }
        console.log(data);
        return fetch(`https://restcountries.com/v2/name/${data.country}`);
      })
      .then(response => {
        /*** reject promise (throwing errors) manually ***/
        if (!response.ok) throw new Error(`Country not found! (${response.status})`);

        return response.json();
      })
      .then(data => renderCountry(data[0]))
      .catch(err => alert(`Somthing went wrong: ${err.message}. Try again!`))
      .finally(() => {
        countriesContainer.style.opacity = 1;
      });
  });
});
