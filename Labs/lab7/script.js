$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: 'course.json',
    dataType: 'json',
    success: function(responseData, status){

      // dynamically load the lectures on the sidebar
      var output = '';
      $.each(responseData.lectures, function(i, lec){
        var id = lec.lecture_id;
        var title = lec.title;
        output += `<li data-title="Lecture ${id}" data-type="lectures" onclick="showDescription(this)">Lecture ${id}</li>`;
      });
      $('#lecture-content').html(output);

      // dynamically load the labs on the sidebar
      output = '';
      $.each(responseData.labs, function(i, lab){
        id = lab.lab_id;
        title = lab.title;
        output += `<li data-title="Lab ${id}" data-type="labs" onclick="showDescription(this)">Lab ${id}</li>`
      });
      $('#lab-content').html(output);
    }, error: function(msg){
      alert(`There was a problem: ${msg.status}: ${msg.statusText}`);
    }
  });
});

// dynamically get information about the item
function getInfo(item, type){
  const id = item.split(" ")[1];

  var idKey = "";
  var typeKey = "";
  if(type == "lectures"){
    idKey = "lecture_id";
  } else {
    idKey = "lab_id";
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: 'course.json',
      dataType: 'json',
      success: function(responseData, status){
        const item = responseData[type].find(i => i[idKey] === parseInt(id));
        if(item){
          resolve([id, item.title, item.description]);
        } else {
          reject(`No item found for ${type} with id ${id}`);
        }
      }, error: function(msg){
        reject(`There was a problem: ${msg.status}: ${msg.statusText}`);
      }
    });
  });
}


// show the item-description
async function showDescription(obj){
  const string = obj.dataset.title;
  const type = obj.dataset.type;

  // dynamically get information about the object
  const [id, title, description] = await getInfo(string, type);
  const output = `
    <h2>${string}: ${title}</h2>
    <p>${description}</p>
  `;
  $('#item-description').html(output);
  
  // set the data-id of the archive button to this object
  const archiveElement = document.getElementById('archive-button');
  archiveElement.setAttribute('data-id', string);
}

// remove the item from the sidebar
async function remove(obj){
  var item = obj.dataset.id;
  if(item == ""){
    alert("Nothing was archived. Select a Lecture or Lab first!");
    exit();
  } else {
    // get the item from the sidebar
    const archiveElement = document.querySelector(`[data-title="${item}"]`);

    // prepare the archive the item into the database
    const itemInfo = archiveElement.dataset.title;
    const itemType = archiveElement.dataset.type;
    const [id, title, description] = await getInfo(itemInfo, itemType);

    fetch('archive.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        title: title,
        description: description, 
        type: itemType
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

    // hide the item from the sidebar
    archiveElement.style.display = "none";

    // reset the preview and the archive-button
    const defaultPreview = 
      "<h2>Lecture Title</h2>\
      <p>Lecture Description</p>";
    $('#item-description').html(defaultPreview);
    obj.dataset.id = "";
  }
}

// refresh the page
async function refresh(){
  try{
    // prepare to empty the lectures and labs table in the database
    const response = await fetch('reset.php', {
      method: 'POST'
    });
    const text = await response.text();
    console.log('Reset response:', text);

    // reload the page
    window.location.reload();
  } catch(err) {
    console.error('Error resetting tables:', err);
    alert('Failed to reset tables. Check the console.');
  }
  
}