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

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    console.log("already signed in");
    console.log(user);
    // $(".main-page").css({"display":""});
    // var $yourUl = $("#yourUlId");
    // $(".main-page").css("display", $(".main-page").css("display") === 'none' ? '' : 'none');
    $(".username").text(user.displayName);
    $(".email").text(user.email);
    $(".LeaveReview").show();
  } else {
    // No user is signed in.
    console.log("signing in");
    ui.start("#firebaseui-auth-container", uiConfig);
    $(".LeaveReview").hide();
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
      console.log(url);
      console.log(get_domain(url));
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

function updateFirebase(domain, rating) {
  var review = db.collection("Reviews");
  // Set the "capital" field of the city 'DC'
  // Add a new document with a generated id.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      //check if review exists

      db.collection("Reviews")
        .where("email", "==", user.email)
        .where("domain", "==", domain)
        .limit(1)
        .get()
        .then(function (querySnapshot) {
          console.log(querySnapshot);
          if (!querySnapshot.empty) {
            console.log(querySnapshot);
            querySnapshot.forEach(function (doc) {
              if (doc.exists) {
                console.log("doc exists");
                review
                  .doc(doc.id)
                  .update({
                    review: rating,
                  })
                  .then(function () {
                    console.log("Document successfully updated!");
                  })
                  .catch(function (error) {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                  });
              } else {
                console.log("doc does not exist");
                add_review_to_firebase(review, domain, user.email, rating);
              }
            });

            // User is signed in.
          } else {
            console.log("snapshot is empty");
            add_review_to_firebase(review, domain, user.email, rating);
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
    }
  });
}

function add_review_to_firebase(review, domain, email, rating) {
  review
    .add({
      domain: domain,
      email: email,
      review: rating,
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
}

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
        // console.log(rating)
       $("#rating-"+String(rating)).prop("checked", true);


      }
    );
  });
});
