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

var uiConfig = {
  signInSuccessUrl: "profile.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
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
  console.log("loading..");
  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  firebase.auth().onAuthStateChanged(function (user) {
    // $("#overlay").fadeIn(300);
    if (user) {
      // User is signed in.
      console.log("already signed in");
      console.log(user);
      // $(".main-page").css({"display":""});
      // var $yourUl = $("#yourUlId");
      // $(".main-page").css("display", $(".main-page").css("display") === 'none' ? '' : 'none');
      $(".username").text("Name: "+user.displayName);
      $(".email").text("Email: "+ user.email);
      setTimeout(function () {
        $(".profileUI").show();
        $("#overlay").fadeOut(300);
      }, 500);
      
    } else {
      // No user is signed in.
      $(".profileUI").hide();
      ui.start("#firebaseui-auth-container", uiConfig);
      setTimeout(function () {
        $("#overlay").fadeOut(300);
      }, 500);
    }
  });
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
          // window.location.href = 'popup.html';
        },
        function (error) {
          console.error("Sign Out Error", error);
        }
      );
  });
});
