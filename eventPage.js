
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

//activates when you change tabs
chrome.tabs.onActivated.addListener(function (activeInfo, tab) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      var domain = get_domain(tabs[0].url);
      emptyBadge();
      set_my_rating_locally(domain);
      get_current_website_review(domain);
    }
  );
});

//activates when you refresh tabs
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log("emptying");
  // emptyBadge();
  if (changeInfo.status == "complete") {
    var domain = get_domain(tab.url);
    set_my_rating_locally(domain);
    get_current_website_review(domain);
  }
});

//activates when a message is sent
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var snapshots = [];
  var num_chunks;

  if (request.action == "get_reviews") {
    var split_domains = chunk(request.domains, 2);
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
            sendResponse(merged);
          }
        })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });
    });
  } else if (request.action == "get_tab_review") {
    chrome.storage.sync.get(request.domain, function (items) {
      sendResponse(items);
    });
  } else if (request.action == "get_my_review") {
    chrome.storage.sync.get(request.domain + "_myreview", function (items) {
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

function set_my_rating_locally(domain) {
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
                set_my_review(domain, doc.data().review);
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
                    set_my_review(domain, rating)
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
            add_review_to_firebase(
              review,
              domain,
              user.email,
              rating,
              sendResponse
            );
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
      set_my_review(domain, rating);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
      sendResponse("error");
    });
}

function set_my_review(domain, review) {
  var myReview = {};
  myReview[domain.toString() + "_myreview"] = {
    rating: review,
  };

  // console.log(reviewObject);
  console.log(myReview);
  chrome.storage.sync.set(myReview, function () {
    //  A data saved callback omg so fancy
    console.log("my review Stored");
  });
}

function emptyBadge() {
  chrome.browserAction.setBadgeText({
    text: "",
  });
}

function setBadge(value) {
  chrome.browserAction.setBadgeText({
    text: value,
  });
}

function get_current_website_review(domain) {
  db.collection("Reviews")
  .where("domain", "in", [domain])
  .get()
  .then(function (querySnapshot) {
    querySnapshot = snapshotToArray(querySnapshot);
    if (querySnapshot.length) {
      let result = querySnapshot.map((a) => a.review);
      var averageReview = Math.round(average(result) * 10) / 10;
      setBadge(averageReview.toString());
      var reviewObject = {};
      reviewObject[domain.toString()] = {
        average: averageReview.toString(),
        total: querySnapshot.length,
      };
      chrome.storage.sync.set(reviewObject, function () {
        console.log("Object Stored");
      });
    } else {
      emptyBadge();
    }
  });
}

