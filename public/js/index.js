import { login, logout } from './login';
import '@babel/polyfill';
console.log('hello from parcel');

// DOM ELEMENTLERI
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
// VALUES

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);
