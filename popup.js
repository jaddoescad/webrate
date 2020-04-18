var firebaseConfig = {
    apiKey: "AIzaSyBXDmVgIJ4ZSLOz3xub6YjCp8jDOgLlFSg",
    authDomain: "rate-the-internet.firebaseapp.com",
    databaseURL: "https://rate-the-internet.firebaseio.com",
    projectId: "rate-the-internet",
    storageBucket: "rate-the-internet.appspot.com",
    messagingSenderId: "211659860191",
    appId: "1:211659860191:web:ac930adc5851320688216a",
    measurementId: "G-5Q2HDFM9X7",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();

  let average = (array) => array.reduce((a, b) => a + b) / array.length;

$.fn.stars = function() { 
    return this.each(function() {
      // Get the value
      var val = parseFloat($(this).html()); 
      // Make sure that the value is in 0 - 5 range, multiply to get width
      var size = Math.max(0, (Math.min(5, val))) * 36.5; 
      // Create stars holder
      var $span = $('<span> </span>').width(size); 
      // Replace the numerical value with stars
      $(this).empty().append($span);
    });
  }


$(function(){
    var url;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        // $('#total').text(tabs[0].url);
        url = new URL(tabs[0].url);
        console.log(get_domain((url)));
        $('.website-url').text(get_domain(url));

        var domain = get_domain(tabs[0].url);
        var averageReview = 0;
 
        chrome.runtime.sendMessage({action: "get_tab_review", domain: domain.toString()}, function(response) {
            console.log(response[domain]);
            if (response[domain]){
                document.getElementById("stars").innerHTML = getStars(response[domain].average);
                $('.review_num').text(response[domain].average+' ('+response[domain].total+ ')')
            } else {
                console.log('here');
                $('.noreviews').text(': No Reviews.');
            }

          });
    });
});

$(".profile-image").click(function(){
    console.log("hello")
    return false;
});


function get_domain(url) {
    url = new URL(url);
    domain = String(url.host)
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
      .split("/")[0];
    return domain;
  }
  


function snapshotToArray(snapshot) {
    var returnArr = [];
    snapshot.forEach(function (doc) {
      var item = doc.data();
      item.key = doc.id;
      returnArr.push(item);
    });
    return returnArr;
  }


  function getStars(rating) {

    // Round to nearest half
    rating = Math.round(rating * 2) / 2;
    let output = [];
  
    // Append all the filled whole stars
    for (var i = rating; i >= 1; i--)
      output.push('<i class="fa fa-star" aria-hidden="true" style="color: black;"></i>&nbsp;');
  
    // If there is a half a star, append it
    if (i == .5) output.push('<i class="fa fa-star-half-o" aria-hidden="true" style="color: black;"></i>&nbsp;');
  
    // Fill the empty stars
    for (let i = (5 - rating); i >= 1; i--)
      output.push('<i class="fa fa-star-o" aria-hidden="true" style="color: black;"></i>&nbsp;');
  
    return output.join('');
  
  }