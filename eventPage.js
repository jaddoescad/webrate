var menuItem = {
  id: "spendMoney",
  title: "Spend Money",
  contexts: ["selection"],
};

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

chrome.tabs.onActivated.addListener(function (activeInfo, tab) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      chrome.browserAction.setBadgeText({
        text: "",
      });
      // $('#total').text(tabs[0].url);
      //   var randomnum = Math.floor(Math.random() * (5 - 0) + 0) / 100;
      //   chrome.browserAction.setBadgeText({
      //     text: randomnum.toString(),
      //   });
      // console.log(tabs[0].url);
      // console.log(get_domain(tabs[0].url));

      var domain = get_domain(tabs[0].url);
      get_myrating(domain);
      var averageReview = 0;

      db.collection("Reviews")
        .where("domain", "in", [domain])
        .get()
        .then(function (querySnapshot) {
          querySnapshot = snapshotToArray(querySnapshot);
          //   console.log(querySnapshot);
          if (querySnapshot.length) {
            let result = querySnapshot.map((a) => a.review);
            averageReview = Math.round(average(result) * 10) / 10;

            chrome.browserAction.setBadgeText({
              text: averageReview.toString(),
            });

            var reviewObject = {};
            reviewObject[domain.toString()] = {
              average: averageReview.toString(),
              total: querySnapshot.length,
            };

            // console.log(reviewObject);
            chrome.storage.sync.set(reviewObject, function () {
              //  A data saved callback omg so fancy
              console.log("Object Stored");
            });
          } else {
            chrome.browserAction.setBadgeText({
              text: "",
            });
          }
        });
    }
  );
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.browserAction.setBadgeText({
    text: "",
  });
  if (changeInfo.status == "complete") {
    console.log("completed");

    var domain = get_domain(tab.url);
    var averageReview = 0;
    get_myrating(domain);

    db.collection("Reviews")
      .where("domain", "in", [domain])
      .get()
      .then(function (querySnapshot) {
        querySnapshot = snapshotToArray(querySnapshot);
        //   console.log(querySnapshot);
        if (querySnapshot.length) {
          let result = querySnapshot.map((a) => a.review);
          averageReview = Math.round(average(result) * 10) / 10;

          chrome.browserAction.setBadgeText({
            text: averageReview.toString(),
          });

          var reviewObject = {};
          reviewObject[domain.toString()] = {
            average: averageReview.toString(),
            total: querySnapshot.length,
          };
          // console.log(reviewObject);
          chrome.storage.sync.set(reviewObject, function () {
            //  A data saved callback omg so fancy
            console.log("Object Stored");
          });
        } else {
          chrome.browserAction.setBadgeText({
            text: "",
          });
        }
      });
    // do your things
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var snapshots = [];
  var num_chunks;

  if (request.action == "get_reviews") {
    // console.log(request.domains.length);
    var split_domains = chunk(request.domains, 2);
    // console.log(request.domains);
    num_chunks = split_domains.length;
    split_domains.forEach(function (entry, i) {
      db.collection("Reviews")
        .where("domain", "in", entry)
        .get()
        .then(function (querySnapshot) {
          querySnapshot = snapshotToArray(querySnapshot);
          if (querySnapshot.length) {
            snapshots.push(querySnapshot);
          }
        })
        .then(function () {
          if (i == num_chunks - 1) {
            var merged = [].concat.apply([], snapshots);
            // console.log(merged);
            sendResponse(merged);
          }
        })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });
    });
  } else if (request.action == "get_tab_review") {
    //   console.log(request.domain);
    chrome.storage.sync.get(request.domain, function (items) {
      // console.log(items);
      //  items = [ { "yourBody": "myBody" } ]
      sendResponse(items);
    });
  } else if (request.action == "get_my_review") {
    //   console.log("getting my review");
    chrome.storage.sync.get(request.domain + "_myreview", function (items) {
      // console.log(items);
      //  items = [ { "yourBody": "myBody" } ]
      // console.log("hello");
      // console.log(items);
      sendResponse(items);
    });
  } else if (request.action == "add_review") {
    updateFirebase(request.domain, request.rating, sendResponse);
  }
  return true;
});

function chunk(arr, chunkSize) {
  var R = [];
  for (var i = 0, len = arr.length; i < len; i += chunkSize)
    R.push(arr.slice(i, i + chunkSize));
  return R;
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

function get_domain(url) {
  url = new URL(url);
  domain = String(url.host)
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  return domain;
}

function get_myrating(domain) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      db.collection("Reviews")
        .where("email", "==", user.email)
        .where("domain", "==", domain)
        .limit(1)
        .get()
        .then(function (querySnapshot) {
          console.log(querySnapshot);
          if (!querySnapshot.empty) {
            querySnapshot.forEach(function (doc) {
              if (doc.exists) {
                console.log(doc.data().review);
                // $("#rating-" + doc.data().review).prop("checked", true);
                var myReview = {};
                myReview[domain.toString() + "_myreview"] = {
                  rating: doc.data().review,
                };

                // console.log(reviewObject);
                console.log(myReview);
                chrome.storage.sync.set(myReview, function () {
                  //  A data saved callback omg so fancy
                  console.log("my review Stored");
                });
              }
            });
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
    }
  });
}

function updateFirebase(domain, rating, sendResponse) {
  console.log("updating review");
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
                    sendResponse("success");
                  })
                  .catch(function (error) {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                    sendResponse("error");
                  });
              } else {
                console.log("doc does not exist");
                add_review_to_firebase(review, domain, user.email, rating);
              }
            });

            // User is signed in.
          } else {
            console.log("snapshot is empty");
            add_review_to_firebase(review, domain, user.email, rating, sendResponse);
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
    }
  });
}

function add_review_to_firebase(review, domain, email, rating, sendResponse) {
  review
    .add({
      domain: domain,
      email: email,
      review: rating,
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
      sendResponse("success");
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
      sendResponse("error");
    });
}
