/*
* Effectively Serves as a Scroll Event Listener
*/

window.addEventListener('scroll', function() {
    const navbar = document.querySelector("nav");
    navbar.classList.add('nav-dimmed');
});

window.addEventListener("scrollend", (event) => {
    const navbar = document.querySelector("nav");
});
