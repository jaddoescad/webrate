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

// function isInt(value) {
//   return (
//     !isNaN(value) &&
//     parseInt(Number(value)) == value &&
//     !isNaN(parseInt(value, 10))
//   );
// }

// chrome.contextMenus.create(menuItem);

// chrome.contextMenus.onClicked.addListener(function (clickData) {
//   if (clickData.menuItemId == "spendMoney" && clickData.selectionText) {
//     if (isInt(clickData.selectionText)) {
//       chrome.storage.sync.get(["total", "limit"], function (budget) {
//         var newTotal = 0;
//         if (budget.total) {
//           newTotal += parseInt(budget.total);
//         }

//         newTotal += parseInt(clickData.selectionText);
//         chrome.storage.sync.set(
//           {
//             total: newTotal,
//           },
//           function () {
//             if (newTotal >= budget.limit) {
//               var notifOptions = {
//                 type: "basic",
//                 iconUrl: "icon48.png",
//                 title: "Limit reached!",
//                 message:
//                   "Uh oh, look's like you've reached your alloted limit.",
//               };
//               chrome.notifications.create("limitNotif", notifOptions);
//             }
//           }
//         );
//       });
//     }
//   }
// });

// chrome.storage.onChanged.addListener(function(changes, storageName){
// chrome.tabs.query({
//     active: true,
//     currentWindow: true
//   }, function(tabs) {
//     var tab = tabs[0];
//     var url = tab.url;
//     console.log(url);
//   });

// db.collection("Reviews")
//     .where("domain", "==", )
//     .get()
//     .then(function (querySnapshot) {
//       querySnapshot = snapshotToArray(querySnapshot);
//       if (querySnapshot.length) {
//         snapshots.push(querySnapshot);
//       }
//     })

//     chrome.browserAction.setBadgeText({"text": "4.2"});
// });

chrome.tabs.onActivated.addListener(function (activeInfo, tab) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      // $('#total').text(tabs[0].url);
      //   var randomnum = Math.floor(Math.random() * (5 - 0) + 0) / 100;
      //   chrome.browserAction.setBadgeText({
      //     text: randomnum.toString(),
      //   });
      // console.log(tabs[0].url);
      // console.log(get_domain(tabs[0].url));

      var domain = get_domain(tabs[0].url);
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
  if (changeInfo.status == "complete") {
    console.log("completed");
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
