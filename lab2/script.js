var collArticles = document.getElementsByClassName("collapsible-article");
var collAmendments = document.getElementsByClassName("collapsible-amendment");

//this just makes it so both lists can have same effects
var allColl = [...collArticles, ...collAmendments];

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
    $('#link1').click(function (e) {
        e.preventDefault(); 
        $('html, body').animate({
            scrollTop: $('#header').offset().top - 198
        }, 700);
    });

    $('#link2').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#articles').offset().top - 198
        }, 700);
    });

    $('#link3').click(function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#amendments').offset().top - 198
        }, 700);
    });
});

const popup = document.getElementById("popup");
const pg = document.querySelectorAll(".section-body, #amendments article");
const centerX = window.innerWidth / 2;   
const centerY = window.innerHeight / 2;

pg.forEach(p => {
  p.addEventListener("mouseenter", () => {
    popup.textContent = p.dataset.info;
    popup.style.display = "block";
  });

  p.addEventListener("mousemove", (e) => {
  
    const margin = 10; 
    const popupRect = popup.getBoundingClientRect();

    let left = e.pageX - 300; //makes sure our mouse is in the middle of popup
    let top = e.pageY;

    if (left < margin) {
      left = margin;  //if left is too small, set to margin
    } else if (left + popupRect.width > window.innerWidth - margin) {
      left = window.innerWidth - popupRect.width - margin; //if to big, do the reverse
    }

    //same logic for bottom
   if (top + popupRect.height > window.scrollY + window.innerHeight - margin) {
    top = window.scrollY + window.innerHeight - popupRect.height - margin;
   }

   popup.style.left = left + "px";
   popup.style.top = top + "px";
   
  });

  p.addEventListener("mouseleave", () => {
    popup.style.display = "none";
  });
});