// determine if need to call api on page load
function checkSearchHistory() {
    let yelpParam = JSON.parse(localStorage.getItem("yelpParam"));
    let yelpData = JSON.parse(localStorage.getItem("yelpData"));

    // if the search parameters exist
    if (yelpParam !== null && yelpParam.date && yelpParam.location) {
        // send to api, then clear the storage
        parseLocation(yelpParam);
        localStorage.removeItem("yelpParam");
        console.log("performing new yelp search");
    } // if not, check if there is valid stored search data
    else if (yelpData !== null && yelpData.length > 0) {
        // send yelpData to populate event results
        populateEventResults(yelpData);
        console.log("populating yelp results based on last search performed");
        // check if there is stored google search data
        let savedEateries = JSON.parse(localStorage.getItem("gTextData"));
        if (savedEateries && savedEateries.eateries.length > 0) {
            populatePlaceResults();
            console.log("populating restaurants based on last event selected");
        }
    } // something went wrong and alert the user
    else {
        let displayEl = document.getElementById("yelp-results");

        if (document.getElementsByTagName("h4").length > 0) {
            console.log(
                "checkHistory: something went wrong on first search on page"
            );
            // needs a modal or pop up to alert user something went wrong
        } else if (document.querySelectorAll(".card").length > 0) {
            // Need an alert of some kind, either text in-line or modal
            console.log("checkHistory: something went wrong");
        } else {
            // user has not yet performed a search
            let textEl = document.createElement("h4");
            displayEl.appendChild(textEl);
            textEl.textContent = "Search for an event to get started!";
            textEl.className = "white-text";
        }
    }
}

function bucketList() {
    this.event = {};
    this.eatery = {
        text: {},
        details: {},
    };
}
const newPair = new bucketList();

// prepare parameters to send to Yelp API
function parseLocation(param) {
    param.date = dayjs(param.date).unix();
    param.location = param.location.replace(/\s/g, "");
    accessYelp(param);
}

// use cors-anywhere to access yelp API
// this will need to change if/when implementing variable parameter calls - will need additional function
function accessYelp(param) {
    // accepts object with properties "location" value string with no spaces and "date" value unix time stamp
    let url =
        "https://cors-anywhere-bc.herokuapp.com/https://api.yelp.com/v3/events?";
    let location = "location=" + param.location;
    let startDate = "&start_date=" + param.date;
    let results = "&limit=10";
    let excluded =
        "&excluded_events=chicago-chicago-bachelor-party-exotic-dancers-topless-nudy-waitresses-call-us-312-488-4673";
    fetch(url + location + startDate + results + excluded, {
        method: "get",
        headers: new Headers({
            Authorization:
                "Bearer DdZGPiM69U6N1FeqeFAXnUK8NSX_7W9ozcMbNxCnJA16g309AiVdccMB2B9PEf8U7-aLoMGc3yp0H6ynxVMrVwgYHYJsMP7tqXt66pwj0kJDkBr4Mb34W-PjwGEpYnYx",
        }),
    })
        .then(checkError)
        .then(function (data) {
            console.log(data);
            populateEventResults(data.events);
            localStorage.setItem("yelpData", JSON.stringify(data.events));
            // console.log(data)
        })
        .catch((error) => {
            console.error(error);
            return;
        });
}

// error checking
function checkError(response) {
    if (response.status >= 200 && response.status <= 299) {
        return response.json();
    } else {
        if (response.status === 400) {
            // let the user know they need to check their input and try again
        } else if (response.status === 500) {
            // let the user know that something is wrong with yelp
        } else {
            // let the user know that something happened and to try again, if it happens again, let the project owners know
            console.log(response.status, response.statusText);
        }
        throw Error(response.statusText);
    }
}

// make cards for yelp results
function populateEventResults(events) {
    console.log("displaying results");
    let displayEl = document.getElementById("yelp-results");
    let index = 0;
    events.forEach((event) => {
        // create card
        let cardEl = document.createElement("div");
        cardEl.className = "card sticky-action search-card";
        cardEl.id = `card-${index}`;
        displayEl.appendChild(cardEl);
        index++;

        // div for image
        let divEl = document.createElement("div");
        cardEl.appendChild(divEl);
        divEl.className = "card-image";

        // image
        let imgEl = document.createElement("img");
        imgEl.className = "activator";
        imgEl.setAttribute("src", event.image_url);
        divEl.appendChild(imgEl);

        // add button
        let buttonEl = document.createElement("button");
        buttonEl.className =
            "btn-floating halfway-fab waves-effect waves-light pink";
        divEl.appendChild(buttonEl);
        let iEl = document.createElement("i");
        iEl.className = "material-icons bucketlist-add";
        iEl.textContent = "favorite_border";
        buttonEl.appendChild(iEl);

        // card content
        divEl = document.createElement("div");
        cardEl.appendChild(divEl);
        divEl.className = "card-content";

        // event name
        let spanEl = document.createElement("span");
        spanEl.className = "card-title activator";
        spanEl.textContent = event.name;
        divEl.appendChild(spanEl);

        // create div for links
        divEl = document.createElement("div");
        divEl.className = "card-action";
        cardEl.appendChild(divEl);

        // event site URL
        let aEl = document.createElement("a");
        divEl.appendChild(aEl);
        aEl.setAttribute("href", event.event_site_url);
        aEl.textContent = "See on Yelp";

        // yelp link
        aEl = document.createElement("a");
        divEl.appendChild(aEl);
        aEl.setAttribute("href", event.tickets_url);
        aEl.textContent = "Get Tickets";

        // create div for revealed content
        divEl = document.createElement("div");
        cardEl.appendChild(divEl);
        divEl.className = "card-reveal";

        spanEl = document.createElement("span");
        divEl.appendChild(spanEl);
        spanEl.className = "card-title";
        iEl = document.createElement("i");
        spanEl.appendChild(iEl);
        iEl.className = "material-icons right";
        iEl.textContent = "close";

        // date of event
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        pEl.textContent = dayjs(event.time_start).format("ddd, MMM D, h:mma");

        // cost
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        event.cost !== null
            ? (pEl.textContent = "$" + event.cost)
            : (pEl.textContent = "Free");

        // event address
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        pEl.textContent = event.location.address1;

        // event description
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        pEl.textContent = event.description;
        pEl.style.borderTop = "1px solid white";
        pEl.style.paddingTop = "10px";

        // create div for button
        let dEl = document.createElement("div");
        divEl.appendChild(dEl);
        dEl.className = "card-action";

        // make the button
        buttonEl = document.createElement("button");
        dEl.appendChild(buttonEl);
        buttonEl.className =
            "waves-effect waves-light white-text btn-flat pink center-align";
        buttonEl.textContent = "Find Eateries";
        iEl = document.createElement("i");
        iEl.className = "material-icons left bucketlist-add";
        iEl.textContent = "favorite_border";
        buttonEl.appendChild(iEl);
    });
}

// prepare and pass parameters for google search
function passEventCoords(event) {
    event.stopPropagation();
    let current = event.target;
    let parentEl = document.getElementById("yelp-results");
    let card = current.closest(".search-card");

    console.log(card);
    let index = card.getAttribute("id");
    index = index.substring(index.indexOf("-") + 1);

    let data = JSON.parse(localStorage.getItem("yelpData"));
    let coords = {
        latitude: data[index].latitude,
        longitude: data[index].longitude,
        eventIndex: index,
    };
    initSearch(coords);
    newPair.event = data[index];
}

// send parameters to google for initial place information
function initSearch(coords) {
    let service;
    var elem = document.querySelector("#google-results");
    //let placeType = ""; //option to choose 'bar' or 'restaurant' for search

    const location = {
        lat: coords.latitude,
        lng: coords.longitude,
    };

    var request = {
        location: location,
        radius: "100",
        type: ["restaurant"],
    };
    service = new google.maps.places.PlacesService(elem);

    let newObject = {
        event: coords.eventIndex,
        eateries: [],
    };
    localStorage.setItem("gTextData", JSON.stringify(newObject));
    
    service.textSearch(request, googleTextSearch);
}

// if status is okay, send data to make cards
function googleTextSearch(request, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && request) {
        console.log("processing places");
        let newObject = JSON.parse(localStorage.getItem("gTextData"));
        newObject.eateries = request;
        localStorage.setItem("gTextData", JSON.stringify(newObject));
        populatePlaceResults();
    }
}

// make cards for google results
function populatePlaceResults() {
    console.log("displaying places");
    let placeArray = [];
    let places = JSON.parse(localStorage.getItem("gTextData")).eateries;
    console.log(places);
    let displayEl = document.getElementById("google-results");
    let index = 0;

    places.forEach((place) => {
        //create card
        //add logic to not display closed businesses, but keep increasing the index of the array goes up
        let cardEl = document.createElement("div");
        cardEl.className = "card search-card";
        cardEl.id = `card-${index}`;
        displayEl.appendChild(cardEl);
        //create array for cardEl.id and corresponding place_id
        placeArray.push(place.place_id);
        index++;

        // div for image
        let divEl = document.createElement("div");
        divEl.className = "card-image";
        cardEl.appendChild(divEl);

        // image
        let imgEl = document.createElement("img");
        imgEl.className = "activator";
        imgEl.setAttribute("src", "./assets/links/drinks.jpg");
        divEl.appendChild(imgEl);

        // add button
        let buttonEl = document.createElement("button");
        buttonEl.className =
            "btn-floating halfway-fab waves-effect waves-light pink";
        divEl.appendChild(buttonEl);
        let iEl = document.createElement("i");
        iEl.className = "material-icons bucketlist-add";
        iEl.textContent = "favorite_border";
        buttonEl.appendChild(iEl);

        // create div for content
        divEl = document.createElement("div");
        cardEl.appendChild(divEl);
        divEl.className = "card-content";

        // place name
        let spanEl = document.createElement("span");
        spanEl.className = "card-title activator";
        spanEl.textContent = place.name;
        divEl.appendChild(spanEl);

        // place address
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        pEl.textContent = place.formatted_address;

        // star rating
        pEl = document.createElement("p");
        divEl.appendChild(pEl);
        var rating = Math.round(place.rating); 
        //round rating to nearest integer
        if (rating !== 0) {
            for (var i = 1; i <= rating; i++) {
                pEl.textContent += "✭";
            }
        } else {
            pEl.textContent = "No rating";
        }

        // create div for links
        divEl = document.createElement("div");
        divEl.className = "card-action";
        cardEl.appendChild(divEl);

        // create div for reveal
        divEl = document.createElement("div");
        divEl.className = "card-reveal";
        cardEl.appendChild(divEl);
    });
    localStorage.setItem("gIDs", JSON.stringify(placeArray));
}

// prepare parameters for details search
function prepDetailsSearch(event) {
    // console.log(event);
    let current = event.target;
    // console.log(current);
    let card = current.closest(".search-card");
    let detailsEl = card.querySelector(".card-reveal");
    let details = detailsEl.children;
    let needsSave = false;

    function getID() {
        let index = card.getAttribute("id");
        index = index.substring(index.indexOf("-") + 1);
        localStorage.setItem("resCardIndex", index);
        let placeArray = JSON.parse(localStorage.getItem("gIDs"));
        return placeArray[index];
    }

    // check origin of function call

    // if event came from the add to bucketlist button,
    if (current.className.includes("bucketlist-add")) {
        // if there arent any details yet
        if (details.length == 0) {
            // get the details and save them to the bucketlist
            needsSave = true;
            getPlaceDetails(getID(), needsSave);
        } else {
            //pass details to bucketlist function
            console.log("details exist, pass to bucketlist");
        }
    } else if (current.className.includes("activator")) {
        // check if details exist before making API call
        details.length == 0
            ? getPlaceDetails(getID(), needsSave)
            : console.log("details exist");
    }
}

// send parameters to google for detailed information
function getPlaceDetails(passId, needsSave) {
    // let service;
    var elem = document.querySelector("#empty");
    console.log("getting place details from place_id");

    // get place_id for the specific card user clicked
    // let placeId = passId;
    // console.log(placeId);

    var placeRequest = {
        placeId: passId,
        fields: [
            "name",
            "formatted_phone_number",
            "photos",
            "website",
            "international_phone_number",
            "opening_hours",
        ],
    };

    let service = new google.maps.places.PlacesService(elem);

    if (needsSave === true) {
        console.log("passing to save details");
        service.getDetails(placeRequest, saveDetails);
    } else {
        console.log("passing details");
        service.getDetails(placeRequest, googleDetailSearch);
    }
}
// because google doesnt let us handle the api call ourselves, this has to be a separate function
function saveDetails(details, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        populatePlaceDetails(details);
        bucketlistAddDetails(details);
    }
}

// if status is okay, send data to make cards
function googleDetailSearch(placeDetails, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        populatePlaceDetails(placeDetails);
    }
}

// populate details on card if not already present
function populatePlaceDetails(data) {
    // console.log(data);
    let index = localStorage.getItem("resCardIndex");
    localStorage.removeItem("resCardIndex");

    let parentContainer = document.querySelector("#google-results");

    let cards = parentContainer.children;
    //console.log(cards);

    let reveal = cards[index].children[3];

    let cardEls = reveal.children;

    if (cardEls.length == 0) {
        // restaurant name
        let spanEl = document.createElement("span");
        reveal.appendChild(spanEl);
        spanEl.className = "card-title";
        spanEl.textContent = data.name;
        let iEl = document.createElement("i");
        spanEl.appendChild(iEl);
        iEl.className = "material-icons right";
        iEl.textContent = "close";

        let pEl = document.createElement("p");
        reveal.appendChild(pEl);
        // pEl.textContent = data.opening_hours;
        // figure out how to display all the closing and opening hours for each day
        //console.log(data.opening_hours);

        let aEl = document.createElement("a");
        reveal.appendChild(aEl);
        aEl.setAttribute("href", "tel:" + data.international_phone_number);
        aEl.textContent = data.formatted_phone_number;

        let brEl = document.createElement("br");
        reveal.appendChild(brEl);

        aEl = document.createElement("a");
        reveal.appendChild(aEl);
        aEl.setAttribute("href", data.website);
        aEl.textContent = "Website";

        // create div for button
        let dEl = document.createElement("div");
        reveal.appendChild(dEl);
        dEl.className = "card-action";

        // make the button
        buttonEl = document.createElement("button");
        dEl.appendChild(buttonEl);
        buttonEl.className =
            "waves-effect waves-light white-text btn-flat pink center-align";
        buttonEl.textContent = "Add to Bucketlist";
        iEl = document.createElement("i");
        buttonEl.appendChild(iEl);
        iEl.className = "material-icons left bucketlist-add";
        iEl.textContent = "favorite_border";
    }
}

function selectCard(click) {
    console.log("applying glow to selected card");

    let card = click.target;
    let current = card.closest(".search-card");
    let parent = current.closest(".card-container");
    let previous = parent.querySelector(".selected");

    current.classList.add("selected");

    if (previous) {
        previous.classList.remove("selected");
    }
}

function bucketlistAddEatery(event) {
    // console.log(event);
    console.log("adding eatery");
    console.log(event);
    let card = event.target.closest(".search-card");
    console.log(card);

    let index = card.getAttribute("id");
    index = index.substring(index.indexOf("-") + 1);
    let data = JSON.parse(localStorage.getItem("gTextData"));
    newPair.eatery.text = data.eateries[index];
    newPair.event = JSON.parse(localStorage.getItem("yelpData"))[data.event];
}

function bucketlistAddDetails(details) {
    // save the details to the bucketlist
    console.log("saving details to new bucketlist pair");
    newPair.eatery.details = details;
    console.log(newPair);

    // this needs to be moved out and onto a button for intentional saving
    saveBucketlist();
}

function saveBucketlist() {
    console.log("saves to bucket list");

    let bList = JSON.parse(localStorage.getItem("bucketlist"));

    console.log(bList);
    let newList = [newPair];

    // if the bucketlist exists and has entries, return it, else make a new list
    bList && bList.length > 0
        ? (bList =newList.concat(bList))
        : (bList = newList);
    localStorage.setItem("bucketlist", JSON.stringify(bList));
}

// on page load, parse and pass most recent search data to yelp API
checkSearchHistory();

// click query selector event delegator
document.querySelector("body").addEventListener("click", function (event) {
    let container = event.target.closest(".card-parent");

    if (container !== null) {
        if (container.id == "yelp-results") {
            if (event.target.className.includes("bucketlist-add")) {
                console.log("button clicked");
                passEventCoords(event);
                selectCard(event);
            }
        } else if (container.id == "google-results") {
            // prep details search regardless, but if bucketlist add, select card
            if (event.target.closest(".card")) {
                if (event.target.className.includes("bucketlist-add")) {
                    selectCard(event);
                    bucketlistAddEatery(event);
                }
                prepDetailsSearch(event);
            }
        }
    }
});

function hide() {
    console.log("hiding");
    var display = document.getElementById("hide");
    if (display.style.display === "none") {
        display.style.display = "block";
    } else {
        display.style.display = "none";
    }
    show();
}

// button click
function show() {
    var display = document.getElementsByClassName("s12");
    if (display.style.display === "show") {
        display.style.display = "none";
    }

    // change to s6 column
}

// responsive nav bar
$(document).ready(function () {
    $(".sidenav").sidenav();
});
