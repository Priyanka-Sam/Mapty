'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map,mapEvent;


if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(function(position){
console.log(position)
const {latitude} = position.coords
const {longitude} = position.coords

const coordsar = [latitude,longitude]
// console.log(coordsar)
// console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`)

 map = L.map('map').setView(coordsar, 15);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker(coordsar).addTo(map)
    .bindPopup('Hi there!')
    .openPopup();

//handling clicks on map
map.on('click',function(mapE){
    mapEvent=mapE
form.classList.remove('hidden')
inputDistance.focus();
})

},function()
{
alert("Could not get your position.")
})

form.addEventListener('submit',function(e)
{
    //clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value=inputElevation.value= ''

    // console.log(mapEvent)(
   //default behaviour of froms is reloading after submission
    e.preventDefault()
const {lat, lng} = mapEvent.latlng

L.marker([lat,lng]).addTo(map)
    .bindPopup(L.popup(
        {maxWidth:250,minWidthy:150,
        autoClose:false,
        closeOnClick:false,
        className:'running-popup',
    }
    ))
    .setPopupContent('Workout!').openPopup()
    ;
})


inputType.addEventListener('change',function()
{
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

})