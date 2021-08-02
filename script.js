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

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
clicks=0
    constructor(coords,distance,duration)
    {
        this.coords=coords;
        this.distance=distance
        this.duration=duration;
    }

    setDescription()
    {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on  ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    click()
    {
      this.clicks++;
    }
}


class Running extends Workout{
    type = 'running';

constructor(coords,distance,duration,cadence)
{super(coords,distance,duration)
this.cadence=cadence
this.calcPace()
this.setDescription()

}

calcPace(){
this.pace = this.duration/this.distance
return this.pace
}

}

class Cycling extends Workout{
    type = 'cycling';

    constructor(coords,distance,duration,elevationGain)
{super(coords,distance,duration)
this.elevationGain=elevationGain
this.calcSpeed()
this.setDescription()

}

calcSpeed(){
    this.speed = this.distance/(this.duration/60)
    return this.speed;
    }

}

// const run = new Running([39,-12],5.2,24,170);
// const cycling = new Cycling([39,-12],27,95,170);
// console.log(run,cycling)


//********************************************************************************************//
//Application Architecture
class App{

    #map
    #mapEvent
    #mapZoomLevel=14
#workouts = []

constructor(){
    this.getPosition()
    form.addEventListener('submit',this.newWorkout.bind(this))     //this keyword would point to the DOM form and not the class object , hence needs binding
    inputType.addEventListener('change',this.toggleElevation)      //doesn't use this keyword, no need to bind
    containerWorkouts.addEventListener('click', this.moveToPopup.bind(this));
}

    getPosition()
    {
        if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(this.loadMap.bind(this),function()
{
alert("Could not get your position.")
})
    }

    loadMap(position){
        // console.log(position)
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    
        const coords = [latitude, longitude];
    
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);
    
        // Handling clicks on map
        this.#map.on('click', this.showForm.bind(this));    
        
        }

    showForm(mapE){  
         this.#mapEvent=mapE
        form.classList.remove('hidden')
        inputDistance.focus(); }

hideForm(){
//clear input fields

    inputDistance.value = inputDuration.value = inputCadence.value=inputElevation.value= ''
form.style.display ='none'
form.classList.add('hidden')
setTimeout(() => (form.style.display = 'grid'),1000)
}
             
    toggleElevation(){
        {
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        
        }}

        moveToPopup(e)
        {
           // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    //to get the workout object from the closest workout id
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id)

      //to zoom into that position
      this.#map.setView(workout.coords,this.#mapZoomLevel,{animate:true, pan:{duration:1}})
        workout.click()
    
    }
    
    newWorkout(e) {

        //check if the data is valid
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
      const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault()

//get data from the form
const type = inputType.value
const distance = +inputDistance.value;
const duration = +inputDuration.value;
const {lat, lng} = this.#mapEvent.latlng
let workout

//if workout is running, create running object
if(type === 'running')
{
    const cadence =+inputCadence.value;
    if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

        workout = new Running([lat,lng],distance,duration,cadence)
}

//if workout is cycling, create cycling object

if(type === 'cycling')
{
    const elevation = +inputElevation.value;

    if (
      !validInput(distance, duration, elevation) ||
      !allPositive(distance, duration)
    )
      return alert('Inputs have to be positive numbers!');

       workout = new Cycling([lat,lng],distance,duration,elevation)

}
// console.log("Log")

//add new object to workout array
this.#workouts.push(workout)



//render workout on the map as marker
this.renderWorkoutMarker(workout)


//render workout on the list
this.renderWorkout(workout)

//hide form and clear input fields

//clear input fields
this.hideForm()        
            // console.log(mapEvent)(
           //default behaviour of froms is reloading after submission
        
      //add to local storage
      this.setLocalStorage()  
        
    }

    renderWorkoutMarker(workout)
    {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup
        (L.popup(
            {maxWidth:250,minWidth:150,
            autoClose:false,
            closeOnClick:false,
            className: `${workout.type}-popup`,
        })).setPopupContent( `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup()
    }

    renderWorkout(workout)
    {
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`

        if(workout.type=== 'running')
        html += ` <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`

    if(workout.type=== 'cycling')
        html += ` <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`

    form.insertAdjacentHTML('afterend',html)

    }

setLocalStorage()
{
localStorage.setItem('workouts',JSON.stringify(this.#workouts))  //key value pair, converted into string
}

}


const app = new App();
















