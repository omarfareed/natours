// import '@babel/polyfill';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateData } from './updateData.js';
import { bookTour } from './stripe.js';
// import axios from './../../node_modules/axios/lib/';
// const {login } = require('./login');
// const {displayMap} = require('./mapbox');
console.log(axios);
const loginForm = document.querySelector('.login-form');
const userForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const logOutButton = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');
console.log(loginForm);
const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  console.log('here');
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}
if (logOutButton) {
  logOutButton.addEventListener('click', logout);
}
userForm &&
  userForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    // console.log('here');
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateData(form, 'data');
  });
passwordForm &&
  passwordForm.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const password = document.getElementById('password').value;
    updateData({ password, passwordConfirm, passwordCurrent }, 'password');
    document.getElementById('password-current').value = document.getElementById(
      'password-confirm'
    ).value = document.getElementById('password').value = '';
    document.querySelector('.btn--save--password').textContent =
      'Save Password';
  });
if (bookBtn)
  bookBtn.addEventListener('click', async e => {
    const { tourId } = e.target.dataset;
    e.target.textContent = 'Processing...';
    await bookTour(tourId);
  });
