(function() {
  'use strict';

  /******************************************************************************/
  var currentExhibition;

  function getParentUrl() {
    var isInIframe = (parent !== window),
        parentUrl = window.location.href;

    if (isInIframe) {
        parentUrl = document.referrer;
    }
    return parentUrl;
  }

  function createText(zooAd, sponsorDiv, sponsorFormat, sponsorText, adObject) {
    var textDiv = $("<div/>")
      .css({
        "text-align" : "right",
        "padding-top" : "1em",
        "padding-right" : "1em"
      })
      .appendTo(zooAd);
    
    var textContent = $("<p/>")
      .text('"' + adObject.text + '"')
      .css({
        fontSize : "2em",
        color: "rgba(0,0,0,0.60)",
      })
      .appendTo(textDiv);

    var textSrc = $("<p/>")
      .text(adObject.textOrg)
      .css({
        fontSize : "1.5em",
        color: "rgba(0,0,0,0.40)",
      })
      .appendTo(textDiv);

    sponsorDiv.css({
      "text-align" : "right"
    });

    sponsorFormat
      .text("ad made possible by")
      .css({
        fontSize : "1.25em"
      });

    sponsorText.css({
      fontSize : "1.5em"
    });
  }

  function createImage(zooAd, sponsorDiv, sponsorFormat, sponsorText, origW, origH, adObject) {
    //ratio : width 4, height 5
    var imgDiv = $("<div/>")
      .css({
        width: origW,
        height: origW,
        "max-height" : 300,
        "background-image" : "url(" + adObject.imageSrc + ")",
        "background-size" : "cover",
        "-webkit-filter" : "grayscale(1)" /* Google Chrome, Safari 6+ & Opera 15+ */
      })
      .appendTo(zooAd);
      
    sponsorDiv.css({
      "text-align" : "right"
    });

    sponsorFormat
      .text("ad made possible by")
      .css({
        fontSize : 18
      });
  }

  function createBasicText(zooAd, sponsorDiv, sponsorFormat, sponsorText) {
    sponsorDiv.css({
      "text-align" : "center"
    });

    sponsorFormat
      .text("Thank you,")
      .css({
        fontSize : 18
      });
    
    sponsorText.css({
      fontSize : 24
    });
  }

  var artAdder = {
    replacedCount : '',
    processAdNode : function (elem) {
      var goodBye = false;
      if (elem.tagName !== 'IFRAME'
            && elem.tagName !== 'IMG'
            && elem.tagName !== 'DIV'
            && elem.tagName !== 'OBJECT'
            && elem.tagName !== 'A'
            && elem.tagName !== 'INS'
            ) {
          goodBye = true;
      }

      if ($(elem).data('replaced')) {
        goodBye = true;
      }
      $(elem).data('replaced', true);
      if (goodBye)  {
        return;
      }

      var origW = elem.offsetWidth;
      var origH = elem.offsetHeight;

      var $wrap = $('<div>').css({
        //width: origW,
        //height: origH,
        position : 'relative'
      })

      chrome.storage.sync.get({
        frequency: 'red',
        appearance: 'textImages',
        content: 'cute',
        category: 'enviro',
        on: true
      }, function(items) {
        var adType = items.appearance[0];
        var type = items.content[0];
        var category = items.category[0];
        var sponsorsName = "Microsoft";

        $.ajax({
          url: 'https://26330fda.ngrok.io/api/getSponsor',
          type: 'get',
          success : function(rst) {
            sponsorsName = rst[0][0].sponsorsName;
            $.ajax({
              url : 'https://26330fda.ngrok.io/api/getData?category=' + category + '&type=' +  type,
              type : 'get',
              success : function (result){
                var adObject = result[0][0];
                var zooAd = $("<div/>")
                  .addClass("adContainer")
                  .css({
                    width: origW,
                    //height: origH,
                    cursor: "pointer",
                    border: "1px rgba(0,0,0,0.70) solid",
                    "border-radius" : "0.25rem"
                  })
                  .click(function() {
                    window.open(adObject.textSrc, "_blank");
                  });

                var sponsorDiv = $("<div/>").css({
                    "padding-right" : "0.75em"
                  });

                var sponsorFormat = $('<p/>')
                  .css({
                    color: "rgba(0,0,0,0.30)",
                    "margin-top": 18,
                    "margin-bottom" : 7
                  });

                var sponsorText = $("<p/>", {
                    text: sponsorsName
                  }).css({
                      color: "rgba(0,0,0,0.50)",
                      "margin-bottom" : 18
                  });
                switch(adType) {
                  case "Basic Text" : {
                    createBasicText(zooAd, sponsorDiv, sponsorFormat, sponsorText, adObject);
                    break;
                  }

                  case "textOnly" : {
                    createText(zooAd, sponsorDiv, sponsorFormat, sponsorText, adObject);
                    break;
                  }

                  case "imageOnly" : {
                    createImage(zooAd, sponsorDiv, sponsorFormat, sponsorText, origW, origH, adObject);
                    break;
                  }

                  case "textImages" : {
                    createImage(zooAd, sponsorDiv, sponsorFormat, sponsorText, origW, origH, adObject);
                    createText(zooAd, sponsorDiv, sponsorFormat, sponsorText, adObject);
                  }
                  
                  default: {
                      break;
                  }
                }
                
                sponsorFormat.appendTo(sponsorDiv);
                sponsorText.appendTo(sponsorDiv);
                sponsorDiv.appendTo(zooAd)

                $wrap.append(zooAd);
                $(elem.parentElement).append($wrap);
                $(elem).remove();

                return true;
              }
            });
          }
        });
      });
    },
    
    // abstract storage for different browsers
    localSet : function (key, thing) {
      var d = Q.defer()
      if (typeof chrome !== 'undefined') {
        var save = {}
        save[key] = thing
        chrome.storage.local.set(save, d.resolve)
      }
      return d.promise
    },
    localGet : function (key) {
      var d = Q.defer()
      if (typeof chrome !== 'undefined') {
        chrome.storage.local.get(key, d.resolve)
      }
      return d.promise
    },
    fetchSelectorList : function () {
      $.ajax({
        url : 'https://easylist-downloads.adblockplus.org/easylist.txt',
        type : 'get',
        success : function (txt){
          var txtArr = txt.split("\n").reverse() 
          var selectors = txtArr 
                .filter(function (line) {
                  return /^##/.test(line)
                })
                .map(function (line) {
                  return line.replace(/^##/, '')
                })

          var whitelist = txtArr
                .filter(function (line){
                  return /^[a-z0-9]/.test(line) && !/##/.test(line)
                })
                .map(R.split('#@#'))
          artAdder.localSet('selectors', {
            selectors : selectors,
            whitelist : whitelist
          })
        }
      })
    },
    getSelectors : function () {
      return artAdder.localGet('selectors')
      .then(function (obj) {
        return obj.selectors
      })
    }

  }

  window.artAdder = artAdder
})();


