var domains = [];
let average = (array) => array.reduce((a, b) => a + b) / array.length;

function addScore(score, id, $domElement) {
  var starWidth =
    "<style>#stars-container-id" +
    id +
    ":after { width: " +
    score +
    "%} </style>";

  $("<span class='stars-container' id='stars-container-id" + id + "'>")
    .text("★★★★★")
    .append($(starWidth))
    .appendTo($domElement);
}

$("h3")
  .parent("a")
  .each(function () {
    var domain = get_domain($(this).attr("href"));

    domains.push(domain);
  });

chrome.runtime.sendMessage(
  { action: "get_reviews", domains: domains },
  function (response) {
    // console.log(response);
    $("h3")
      .parent("a")
      .each(function (i) {
        var domain = get_domain($(this).attr("href"));
        var filtered_reviews = response.filter(function (resp) {
          return resp.domain == domain;
        });
        if (filtered_reviews.length) {
          filtered_reviews = remove_duplicates_es6(filtered_reviews);

          filtered_reviews = filtered_reviews.filter(function (a) {
            return !this[a.timestamp] && (this[a.timestamp] = true);
          }, Object.create(null));

          console.log(filtered_reviews);
          let result = filtered_reviews.map((a) => a.review);
          var averageReview = Math.round(average(result) * 10) / 10;
          $(this)
            .parent()
            .parent()
            .append(
              "<div class='ratingView'><div class='stars' id ='" +
                String(i) +
                "'></div>" +
                "<div class='numReviews'>" +
                averageReview +
                " (" +
                filtered_reviews.length +
                ")" +
                "</div></div>"
            );
          // console.log(averageReview*20);
          addScore(averageReview * 20, String(i), $("#" + String(i)));
        } else {
          $(this).parent().parent().append("<p>No Reviews.</p>");
        }
      });
  }
);

function get_domain(url) {
  url = new URL(url);
  domain = String(url.host)
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
    .split("/")[0];
  return domain;
}

function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function remove_duplicates_es6(arr) {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}
