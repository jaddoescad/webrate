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

var uiConfig = {
  signInSuccessUrl: "createReview.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    //   firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //   firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: "<your-tos-url>",
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign("<your-privacy-policy-url>");
  },
};



$(function () {
  var url;
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      url = new URL(tabs[0].url);
      $(".website-url").text(get_domain(url));
    }
  );
});

$(function () {
  var url;
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      url = new URL(tabs[0].url);
      domain = get_domain(url);

      $("#rating-5").click(function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 5);
      });
      $("#rating-4").click(function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 4);
      });
      $("#rating-3").click(function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 3);
      });
      $("#rating-2").click(function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 2);
      });
      $("#rating-1").click(function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 1);
      });
    }
  );
});


function get_domain(url) {
  url = new URL(url);
  domain = String(url.host)
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  return domain;
}

$(function () {
  // var url;
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.runtime.sendMessage(
      { action: "get_my_review", domain: domain.toString() },
      function (response) {
        url = new URL(tabs[0].url);
        
       var rating = response[get_domain(url)+"_myreview"].rating;
       $(".review-text").text("You left a "+rating+" star review.");
        // console.log(rating)
       $("#rating-"+String(rating)).prop("checked", true);


      }
    );
  });
});

function updateFirebase(domain, rating) {
  chrome.runtime.sendMessage(
    { action: "add_review", domain: domain.toString(), rating: rating},
    function (response) {
    //   url = new URL(tabs[0].url);
      
    //  var rating = response[get_domain(url)+"_myreview"].rating;
    //   // console.log(rating)
    //  $("#rating-"+String(rating)).prop("checked", true);
      console.log(response);

    }
  );
}