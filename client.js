let REFLECTIONS_URL = '/reflections';
let NEW_REFLECTIONS_URL = '/reflections/new';

function handleNewEntryButton() {
    $('#nav-create-button').on('click', function () {
        $('#new-entry').removeClass('hide-display');
        $('.start-page').addClass('hide-display');
    })
}


//post a new reflection
function postNewReflection() {
    $('#new-submit-button').on('click', function (e) {
        e.preventDefault();
        let dateInput = $(this).parent().find('#date').val();
        let locationInput = $(this).parent().find('#location').val();
        let moodInput = $(this).parent().find('#mood').val();
        let textInput = $(this).parent().find('#text').val();

        let dataInput = {
            'date': dateInput,
            'location': locationInput,
            'mood': moodInput,
            'text': textInput,
        };

        let htmlOutput = "";
        $.ajax({
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(dataInput),
                url: NEW_REFLECTIONS_URL
            })
            .done(function (data) {

                htmlOutput += '<div class="current-reflection">';
                htmlOutput += '<input type="hidden" class="reflectionID" value="';
                htmlOutput += data._id;
                htmlOutput += '">';
                htmlOutput += '<h2>Date: </h2>';
                htmlOutput += '<p class="reflection-date">';
                htmlOutput += data.date;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Location: </h2>';
                htmlOutput += '<p class="reflection-location">';
                htmlOutput += data.location;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Mood: </h2>';
                htmlOutput += '<p class="reflection-mood">';
                htmlOutput += data.mood;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Reflection: </h2>';
                htmlOutput += '<p class="reflection-text">';
                htmlOutput += data.text;
                htmlOutput += '</p><br><br>';
                htmlOutput += '</div>';
                htmlOutput += '<button id="edit-button" class="reflections-button">Edit</button>';
                htmlOutput += '<button id="delete-button" class="reflections-button">Delete</button>';
                htmlOutput += '<button id="view-all-button" class="reflections-button">View All</button>';

                $('#reflections').html(htmlOutput);
                $('form#new-reflection :input').val("");
                $('#new-entry').addClass('hide-display');
                $('#reflections-container').removeClass('hide-display');
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
                $('reflections').html('No entry submitted');
            })
    });
}


//display all reflections
function displayReflections() {
    $.ajax({
            method: 'GET',
            url: REFLECTIONS_URL
        })
        .done(function (data) {

            if (data.length === 0) {
                $('#reflections-container').html('<p> No reflections found! </p>');
            };

            let reflectionInput = data.map(function (reflection, index) {
                return `<div id="entries">
                        <input type="hidden" class="reflectionID" value="${reflection._id}">
                        <p class="reflection-info">Date:</p> <p class="reflection-text">${reflection.date}</p><br><br>
                        <p class="reflection-info">Location:</p> <p class="reflection-text"> ${reflection.location}</p><br><br>
                        <p class="reflection-info">Mood:</p> <p class="reflection-text"> ${reflection.mood}</p><br><br>
                        <div id="truncate"><p class="reflection-info">Entry:</p> <p class="reflection-text"> ${reflection.text}</p></div><br><br>
                        <button id="edit-button" class="reflections-button">Edit</button>
                        <button id="delete-button" class="reflections-button">Delete</button>
                        <button id="current-button" class="reflections-button">View</button>
                        </div>`;
            });
            $('#reflections').html(reflectionInput);
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
            $('reflections').html('No reflections found');
        })
}

//display reflections by id
function displayReflectionsById() {
    $('#reflections').on('click', '#current-button', function () {
        let idParameter = $(this).parent().find('.reflectionID').val();
        $.ajax({
                method: 'GET',
                url: REFLECTIONS_URL + '/' + idParameter
            })
            .done(function (data) {
                let htmlOutput = "";
                htmlOutput += '<div class="current-reflection">';
                htmlOutput += '<input type="hidden" class="reflectionID" value="';
                htmlOutput += data._id;
                htmlOutput += '">';
                htmlOutput += '<h2>Reflection from: </h2>';
                htmlOutput += '<p class="reflection-date">';
                htmlOutput += data.date;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Location: </h2>';
                htmlOutput += '<p class="reflection-location">';
                htmlOutput += data.location;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Mood: </h2>';
                htmlOutput += '<p class="reflection-mood">';
                htmlOutput += data.mood;
                htmlOutput += '</p><br><br>';
                htmlOutput += '<h2>Reflection: </h2>';
                htmlOutput += '<p class="reflection-text">';
                htmlOutput += data.text;
                htmlOutput += '</p><br><br>';
                htmlOutput += '</div>';
                htmlOutput += '<button id="edit-button" class="reflections-button">Edit</button>';
                htmlOutput += '<button id="delete-button" class="reflections-button">Delete</button>';
                htmlOutput += '<button id="view-all-button" class="reflections-button">View All</button>';

                $('#reflections').html(htmlOutput);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
                $('reflections').html('No reflections found');
                $('#new-entry').removeClass('hide-display');
            })
    })
}

//update the selected reflection
//first retrieve the post by id and put data in form
function retrieveReflection() {
    $('#reflections').on('click', '#edit-button', function () {
        $('#new-entry').removeClass('hide-display');
        $('#reflections-container').addClass('hide-display');
        let idParameter = $(this).parent().find('.reflectionID').val();
        $.ajax({
                method: 'GET',
                url: REFLECTIONS_URL + '/' + idParameter,
                contentType: 'application/json'
            })
            .done(function (data) {
                $('#new-entry').html(`<form method="post" id="new-reflection">
                <input type="hidden" class="reflectionID" value="${data._id}">
                <fieldset>
                <legend>Write a reflection</legend>
                <label>Date:</label><br>
                <input type="text" id="date" name="date" required value="${data.date}"><br>
                <label>Location:</label><br>
                <input type="text" id="location" name="location" value="${data.location}" required><br>
                <label>Mood:</label><br>
                <select name="mood" id="mood" value="${data.mood}"><br>
                <option>Happy</option>
                <option>Calm</option>
                <option>Angry/Frustrated</option>
                <option>Anxious</option>
                <option>Sad/Upset/Depressed</option>
                </select><br>
                <label>Reflect on it:</label><br>
                <textarea name="text" id="text" required>${data.text}</textarea><br>
                <button type="submit" id="update-button">Update</button>
                </fieldset>
                </form>`)
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
                $('reflections').html('No reflections found');
            })
    });
}

//submit updated reflection
function updateReflection() {
    let idParameter = $('form').find('.reflectionID').val();
    let dateInput = $('form').parent().find('#date').val();
    let locationInput = $('form').parent().find('#location').val();
    let moodInput = $('form').parent().find('#mood').val();
    let textInput = $('form').parent().find('#text').val();
    let newDataInput = {
        'date': dateInput,
        'location': locationInput,
        'mood': moodInput,
        'text': textInput,
    };

    let htmlOutput = "";

    $.ajax({
            method: 'PUT',
            url: REFLECTIONS_URL + '/' + idParameter,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(newDataInput)
        })
        .done(function (data) {
            htmlOutput += '<div class="current-reflection">';
            htmlOutput += '<input type="hidden" class="reflectionID" value="';
            htmlOutput += idParameter;
            htmlOutput += '">';
            htmlOutput += '<h2>Date: </h2>';
            htmlOutput += '<p class="reflection-date">';
            htmlOutput += newDataInput.date;
            htmlOutput += '</p><br><br>';
            htmlOutput += '<h2>Location: </h2>';
            htmlOutput += '<p class="reflection-location">';
            htmlOutput += newDataInput.location;
            htmlOutput += '</p><br><br>';
            htmlOutput += '<h2>Mood: </h2>';
            htmlOutput += '<p class="reflection-mood">';
            htmlOutput += newDataInput.mood;
            htmlOutput += '</p><br><br>';
            htmlOutput += '<h2>Reflection: </h2>';
            htmlOutput += '<p class="reflection-text">';
            htmlOutput += newDataInput.text;
            htmlOutput += '</p><br><br>';
            htmlOutput += '</div>';
            htmlOutput += '<button id="edit-button" class="reflections-button">Edit</button>';
            htmlOutput += '<button id="delete-button" class="reflections-button">Delete</button>';
            htmlOutput += '<button id="view-all-button" class="reflections-button">View All</button>';

            $('#reflections').html(htmlOutput);
            $('#new-entry').addClass('hide-display');
            $('#reflections-container').removeClass('hide-display');
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
            $('reflections').html('No reflections found');
        })
}

//delete selected reflection
function deleteReflection() {
    let idParameter = $('div').find('.reflectionID').val();
    $.ajax({
            method: 'DELETE',
            url: REFLECTIONS_URL + '/' + idParameter,
            contentType: 'application/json',
            dataType: 'json'
        })
        .done(function (data) {
            console.log('deleting reflection');
            displayReflections();
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
            $('reflections').html('No reflections found');
            $('#new-entry').removeClass('hide-display');
        })
}


function handleDisplayReflections() {
    $('#reflections').on('click', '#view-all-button', function () {
        displayReflections();
        $('.current-reflection').addClass('hide-display');
    });
}

function handleDeleteReflections() {
    $('#reflections-container').on('click', '#delete-button', function () {
        deleteReflection();
    });
}

function handleUpdateReflection() {
    $('#new-entry').on('click', '#update-button', function (e) {
        e.preventDefault();
        updateReflection();
    });
}

//navigation buttons

function handleNavCreateButton() {
    $('.dropdown-content').on('click', '#nav-create-button', function () {
        $('form#new-reflection :input').val("");
        $('#new-entry').removeClass('hide-display').html(` <form method="post" id="new-reflection">
            <fieldset>
            <legend class="section-header">Write a reflection</legend>
            <label>Date:</label><br>
            <input type="text" id="date" name="date" required><br>
            <label>Location:</label><br>
            <input type="text" id="location" name="location" required><br>
            <label>Mood:</label><br>
            <select name="mood" id="mood"><br>
            <option>Happy</option>
            <option>Calm</option>
            <option>Angry/Frustrated</option>
            <option>Anxious</option>
            <option>Sad/Upset/Depressed</option>
            </select><br>
            <label>Reflect on it:</label><br>
            <textarea name="text" id="text" required></textarea><br>
            <button type="submit" id="new-submit-button">Submit</button>
            </fieldset>`);
        $('#reflections-container').addClass('hide-display');
        $('#resources').addClass('hide-display');
        postNewReflection();
    })
}

function handleNavViewButton() {
    $('#nav-view-button').click(function () {
        displayReflections();
        $('#reflections-container').removeClass('hide-display');
        $('#new-entry').addClass('hide-display');
        $('#resources').addClass('hide-display');
        $('.start-page').addClass('hide-display');
    })
}

function handleNavResourcesButton() {
    $('#nav-resources-button').click(function () {
        $('#resources').removeClass('hide-display');
        $('#new-entry').addClass('hide-display');
        $('#reflections-container').addClass('hide-display');
        $('.start-page').addClass('hide-display');
    })
}

//When the user clicks on the button,
//toggle between hiding and showing the dropdown content

function showMenu() {
    $('.dropbtn').click(function () {
        console.log('clicked');
        $('#myDropdown').toggle();
    })
};

function hideMenu() {
    //    $(document).click(function (e) {
    //        if (e.target.class != 'drpbtn') {
    //            $(".drpbtn").hide();
    //        }
    //    });
    $('li').on('click', function () {
        $('div#myDropdown').hide();
    })
};


$(function () {
    postNewReflection();
    handleDeleteReflections();
    handleDisplayReflections();
    retrieveReflection();
    displayReflectionsById()
    handleUpdateReflection();
    handleNavCreateButton();
    handleNavViewButton();
    handleNavResourcesButton();
    handleNewEntryButton();
    showMenu();
    hideMenu();
})