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
var loggingIn = false;

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

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
firebase.auth().onAuthStateChanged(function (user) {
  
  if (user) {
    // User is signed in.
    if (loggingIn == false) {
      console.log("attempting")
      $(".username").text(user.displayName);
      $(".email").text(user.email);
      $(".LeaveReview").show();
      $(".main-page").show();
  
      setTimeout(function () {
        $(".profileUI").show();
        $("#overlay").fadeOut(300);
      }, 500);
    }
    
  } else {
    console.log("signing in");
    $(".LeaveReview").hide();
    $(".main-page").hide();
    loggingIn = true
    ui.start("#firebaseui-auth-container", uiConfig);
    setTimeout(function () {
      $(".profileUI").show();
      $("#overlay").fadeOut(300);
    }, 500);
  }
});

$(function () {
  $("#sb").click(function (e) {
    e.preventDefault();
    console.log("signin out");
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          console.log("Signed Out");
          window.location.href = "popup.html";
        },
        function (error) {
          console.error("Sign Out Error", error);
        }
      );
  });
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

      $("#rating-5").on("click",function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 5);
        $(".review-text").text("You left a " + 5 + " star review.");
      });
      $("#rating-4").on("click",function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 4);
        $(".review-text").text("You left a " + 4 + " star review.");
      });
      $("#rating-3").on("click",function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 3);
        $(".review-text").text("You left a " + 3 + " star review.");
      });
      $("#rating-2").on("click",function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 2);
        $(".review-text").text("You left a " + 2 + " star review.");
      });
      $("#rating-1").on("click",function (e) {
        console.log(get_domain(url));
        updateFirebase(domain, 1);
        $(".review-text").text("You left a " + 1 + " star review.");
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

        var rating = response[get_domain(url) + "_myreview"].rating;
        $(".review-text").text("You left a " + rating + " star review.");
        $("#rating-" + String(rating)).prop("checked", true);
      }
    );
  });
});

function updateFirebase(domain, rating) {
  chrome.runtime.sendMessage(
    { action: "add_review", domain: domain.toString(), rating: rating },
    function (response) {
      //   url = new URL(tabs[0].url);

      //  var rating = response[get_domain(url)+"_myreview"].rating;
      //   // console.log(rating)
      //  $("#rating-"+String(rating)).prop("checked", true);
      console.log(response);
    }
  );
}

////
