var menuItem = {
    "id": "spendMoney",
    "title": "Spend Money",
    "contexts": ["selection"]
};

var firebaseConfig = {
    apiKey: "AIzaSyBXDmVgIJ4ZSLOz3xub6YjCp8jDOgLlFSg",
    authDomain: "rate-the-internet.firebaseapp.com",
    databaseURL: "https://rate-the-internet.firebaseio.com",
    projectId: "rate-the-internet",
    storageBucket: "rate-the-internet.appspot.com",
    messagingSenderId: "211659860191",
    appId: "1:211659860191:web:ac930adc5851320688216a",
    measurementId: "G-5Q2HDFM9X7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();



function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

chrome.contextMenus.create(menuItem);

chrome.contextMenus.onClicked.addListener(function(clickData){   
    if (clickData.menuItemId == "spendMoney" && clickData.selectionText){    
        if (isInt(clickData.selectionText)){          
            chrome.storage.sync.get(['total','limit'], function(budget){
                var newTotal = 0;
                if (budget.total){
                    newTotal += parseInt(budget.total);
                }

                newTotal += parseInt(clickData.selectionText);
                chrome.storage.sync.set({'total': newTotal}, function(){               
                if (newTotal >= budget.limit){
                    var notifOptions = {
                        type: "basic",
                        iconUrl: "icon48.png",
                        title: "Limit reached!",
                        message: "Uh oh, look's like you've reached your alloted limit."
                    };
                    chrome.notifications.create('limitNotif', notifOptions);

                    }
                });
            });
        }
    }
});

// chrome.storage.onChanged.addListener(function(changes, storageName){
//     chrome.browserAction.setBadgeText({"text": "4.2"});
// });

chrome.tabs.onActivated.addListener(function(activeInfo, tab) {
    
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        // $('#total').text(tabs[0].url);
        var randomnum = Math.floor(Math.random() * (5 - 0) + 0) / 100;
        chrome.browserAction.setBadgeText({"text": randomnum.toString()});
    });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        console.log('completed');
      // do your things
  
    }
  })



  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
                  
      if (request.action == "get_reviews") {
        var docRef = db.collection("Reviews").doc("EMNnSXzqzYkio7dZVehs");
        docRef.get().then(function(doc) {
            if (doc.exists) {
                console.log(request)
                sendResponse({reviews: doc.data()});
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
      }
        return true;
    });