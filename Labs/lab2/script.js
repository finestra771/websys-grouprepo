var collArticles = document.getElementsByClassName("collapsible-article");
var collAmendments = document.getElementsByClassName("collapsible-amendment");
var collSection = document.getElementsByClassName("collapsible-section");

//this just makes it so both lists can have same effects
var allColl = [...collArticles, ...collAmendments, ...collSection];

//go through all entries and see if user clicked
for (let i = 0; i < allColl.length; i++) {
  allColl[i].addEventListener("click", function() {
    var content = this.nextElementSibling;

    //if they clicked one, close all others
    for (let j = 0; j < allColl.length; j++) {
      if (allColl[j] !== this && allColl[j].classList.contains("active")) {
        $(allColl[j].nextElementSibling).slideUp(500, 'swing');
        allColl[j].classList.remove("active");
      }
    }

    //make clicked one active and open it
    $(content).slideToggle(500, 'swing');
    this.classList.toggle("active");
  });
}

// this is for scrolling to sections
$(document).ready(() => {
    $('#link2').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#articles').offset().top - 238
        }, 700);
    });

    $('#link3').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#amendments').offset().top - 238
        }, 700);
    });

    $('#link4').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#history').offset().top - 238
        }, 700);
    });
});

let on = false;
const button = document.getElementById("popup-toggle");
button.addEventListener("click", () => {
    on = !on;
    if (on) {
        pg.forEach(p => {
        p.addEventListener("mouseenter", showPopup);
        p.addEventListener("mousemove", movePopup);
        p.addEventListener("mouseleave", hidePopup);
        button.textContent = "Popup Mode: ON";
      });
    } else {
        pg.forEach(p => {
        p.removeEventListener("mouseenter", showPopup);
        p.removeEventListener("mousemove", movePopup);
        p.removeEventListener("mouseleave", hidePopup);
        button.textContent = "Popup Mode: OFF";
      });
    }
});

const popup = document.getElementById("popup");
const pg = document.querySelectorAll(".section-body, #amendments article");
const centerX = window.innerWidth / 2;   
const centerY = window.innerHeight / 2;

function showPopup(e) {
  const info = e.target.dataset.info;
  if(!info){
    popup.style.display = "none";
    return;
  }
  
  popup.textContent = e.target.dataset.info;
  popup.style.display = "block";
}

function movePopup(e) {
  const margin = 10;
  const popupRect = popup.getBoundingClientRect();

  let left = e.pageX - 300;
  let top = e.pageY;

  //this is to make sure everything stays within view/window
  if (left < margin) 
  {
    left = margin;
  } else if (left + popupRect.width > window.innerWidth - margin) {
    left = window.innerWidth - popupRect.width - margin;
  }

  if (top < window.scrollY + margin) 
  {
    top = window.scrollY + margin;
  }
  if (top + popupRect.height > window.scrollY + window.innerHeight - margin) {
    top = window.scrollY + window.innerHeight - popupRect.height - margin;
  }

  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

function hidePopup() {
  popup.style.display = "none";
}