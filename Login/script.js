const wrapper = document.querySelector('.wrapper');
const registerLink = document.querySelector('.registerlink');
const loginLink = document.querySelector('.loginlink');

registerLink.onclick = () => {
    wrapper.classList.add('active');
}
loginLink.onclick = () => {
    wrapper.classList.remove('active');
}