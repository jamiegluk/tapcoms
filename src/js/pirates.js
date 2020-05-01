/*
	pirates.js
	Script for The Abertay Pirate Computing Society page
	Jamie Lievesley
	15 Sep 2014 22:40
*/

/*
 VARS
*/

// Saved data key base (to avoid conflicts)
var c_saveKeyBase = "pirates.";

// True if new session
var g_newSession = false;
// Current hash
var g_currentPage = "top";
// Last used hash
var g_oldHash = "top";
// Flag set when changing hash to avoid hashchange event
var g_changingHash = false;

// The hash event identifier
var g_hashEvent = null;

/*
 UTILITY FUNCTIONS
*/

// Returns a random integer between min and max inclusive
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Returns a cookie
function getCookie(cookieName) {
  var cookieValue = document.cookie;
  var cStart = cookieValue.indexOf(" " + cookieName + "=");
  if (cStart == -1) {
    cStart = cookieValue.indexOf(cookieName + "=");
  }
  if (cStart == -1) {
    cookieValue = null;
  } else {
    cStart = cookieValue.indexOf("=", cStart) + 1;
    var cEnd = cookieValue.indexOf(";", cStart);
    if (cEnd == -1) {
      cEnd = cookieValue.length;
    }
    cookieValue = unescape(cookieValue.substring(cStart, cEnd));
  }
  return cookieValue;
}

// Sets a session cookie with name, value and optional days to expiration (null for session only)
function setCookie(cookieName, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var cookieValue =
    escape(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = cookieName + "=" + cookieValue;
}

// Returns true if can use localStorage
function isHtml5StorageAvailable() {
  try {
    return "localStorage" in window && window["localStorage"] !== null;
  } catch (e) {
    return false;
  }
}
// Cache value (efficiency)
var g_html5StorageAvailable = isHtml5StorageAvailable();

/*
 EVENT TRIGGERED FUNCTIONS
*/

// Called when a linking div is clicked (for nav)
function butClicked(navid) {
  contentNavigation(navid);
}

// Called when the music mute/unmute button clicked
function toggleMusic() {
  var $aud = $("#pirate_audio");
  if ($aud.prop("paused")) {
    $aud.get(0).play();
  } else {
    var $btn = $("#audioButton");
    $btn.toggleClass("mute");
    var muted = $btn.hasClass("mute");
    $aud.prop("muted", muted);
  }
}

// Called when the democratic voting submit button clicked
function voteSubmit(form) {
  // Get voting value
  var val = $("input:radio[name=voteleader]:checked").val().toString();
  if (val === "other") {
    val = $("#voteOtherText").val().toString();
  }

  // Show the vote progress page
  contentNavigation("votesubmit");
  // Initialise
  $("#voteProgressText").html("Uploading vote...");
  $("#voteProgress").val(0);
  $("#votesubmit").data("vote", val);

  // Start loading
  setTimeout(voteSubmitLoad, 1000);
}

/*
 FUNCTIONS
*/

// Navigation between div 'pages'
function contentNavigation(navid, isHashEvent) {
  g_changingHash = true;
  g_currentPage = "navid";
  if (!isHashEvent) {
    window.location.hash = navid;
  }

  // Animate scroll to top
  $("#container").animate({ scrollTop: 0 }, "slow");

  // Hide all content divs
  $(".contents").addClass("hidden");
  // Show new one
  $("#" + navid).removeClass("hidden");

  g_changingHash = false;
  console.log("hash");
}

// Detects if adblock is in use and changes "advert" text appropriately
function detectAdblock() {
  $("#ad").removeClass("notext");
  if (typeof window.google_jobrunner == "undefined") {
    $("#ad").addClass("blocked");
    setTimeout(function () {
      detectAdblock();
    }, 1000);
  } else {
    $("#ad").removeClass("blocked");
  }
}

function voteSubmitLoad() {
  // Get current progress
  var progress = parseInt($("#voteProgress").val() || "0");

  // Stop if high enough
  if (progress < 100) {
    // Get random increment and delay
    progress += getRandomInt(0, 5);
    var delay = getRandomInt(0, 1000);

    // Update value
    $("#voteProgress").val(progress);

    // Update text
    if (progress > 75) {
      var vote = $("#votesubmit").data("vote").toString();
      if (vote !== "Jamie Lievesley") {
        // Invalid vote
        contentNavigation("votelost");

        $("#voteProgressText").html("No vote submitted");
        return;
      }
      $("#voteProgressText").html("Finalising...");
    } else if (progress > 50) {
      $("#voteProgressText").html("Scanning for sensibility...");
    } else if (progress > 25) {
      $("#voteProgressText").html("Transferring as message in a bottle...");
    } else if (progress > 10) {
      $("#voteProgressText").html("Forcing monkey servants to copy it down...");
    }

    // Delay until repeat
    setTimeout(voteSubmitLoad, delay);
  } else {
    // Vote verified
    contentNavigation("votesent");
    $("#voteProgressText").html("No vote submitted");
  }
}

/*
 ON LOAD OPERATIONS
*/

// Setup on load
function setup() {
  // Check for new session (use cookies as they expire)
  var cval = getCookie(c_saveKeyBase + "activesession");
  if (cval == null) {
    g_newSession = true;
    setCookie(c_saveKeyBase + "activesession", true, null);
  }

  // Update current location hash (remove if new session)
  var firstHash = window.location.hash.substring(1).trim();
  if (g_newSession || (firstHash && firstHash === "top")) {
    window.location.hash = "";
    if ("pushState" in history) {
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
  }

  // Attach back/forward button handler
  setTimeout(function () {
    g_hashEvent = $(window).bind("hashchange", function () {
      if (!g_changingHash) {
        var newHash = window.location.hash.substring(1);
        if (newHash !== g_oldHash) {
          g_oldHash = newHash;
          if (newHash) {
            contentNavigation(newHash, true);
          } else {
            contentNavigation("top", true);
          }
        }
      }
    });
  }, 0);

  // Renavigate if location hash provided
  var initHash = window.location.hash.substring(1).trim();
  if (initHash && initHash !== "" && initHash !== "dashboard") {
    contentNavigation(initHash);
  }

  // Flash "Glorious Supreme Leader"
  setInterval(function () {
    $(".glorious").each(function () {
      var $el = $(this);
      var text = "Glorious Supreme Leader";

      if ($el.is(":visible")) {
        var len = 23;
        var val = parseInt($el.data("gcount") || -1);
        val++;
        if (val >= len) {
          val = 0;
        }
        var start = text.substring(0, val);
        var mid =
          "<span class='glory'>" + text.substring(val, val + 1) + "</span>";
        var end = text.substring(val + 1, text.length);

        $el.html(start + mid + end);

        $el.data("gcount", val.toString());
      } else {
        $el.html(text);
      }
    });
  }, 25);

  // Vote "other" field correction event
  $("#voteOtherText")
    .on("keyup change", function () {
      // Correct text
      var $vo = $(this);
      var textLen = $vo.val().toString().length;
      var newText = "Jamie Lievesley".substring(0, textLen);
      $vo.val(newText);

      // Change radio selection to other
      $("input:radio[name=voteleader]").val(["other"]);
      $vo.focus();
    })
    .on("blur", function () {
      // Fill full value
      $(this).val("Jamie Lievesley");

      // Change radio selection to other
      $("input:radio[name=voteleader]").val(["other"]);
    });
}

// Called on page ready
$(function () {
  // On load setup
  setup();

  // Detect adblock
  $("#ad").addClass("notext");
  setTimeout(function () {
    detectAdblock();
  }, 500);
});
