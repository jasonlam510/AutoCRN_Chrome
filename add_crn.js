((window, document) => {

  var loaded = false;
  var crn_list; 
  // reload if not loaded after 5s
  window.setTimeout(() => {
    if (!loaded) {
      window.location.reload();
    }
  }, 5000);

  let show_message = (message, color) => {
    chrome.runtime.sendMessage({
      type: "ac_show_msg",
      message: message,
      color: color
    });
  }

  let fill_form = () => {
    if (document.getElementById("crn_id1")) {
      let len = crn_list.length;
      for (var i = 1; i <= len; i++) {
        document.getElementById("crn_id"+i).value = crn_list[i-1];
      }
      document.getElementById("crn_id"+len).focus();
      //
      window.sessionStorage.setItem('autocrn_submitted', true);
      // submit
      let submitBtns = document.getElementsByName('REG_BTN');
      submitBtns[1].click();
    }
  }

  let read_crns = () => {
    chrome.storage.local.get('crn_list', (object) => {
      crn_list = object.crn_list;
      if(document.readyState === "complete") {
        fill_form();
      } else {
        window.addEventListener('load', () => {
          fill_form();
        })
      }
    });
  }

  let read_settings = () => {
    chrome.storage.local.get('crn_settings', (object) => {
      settings = object.crn_settings;
      if (settings.avoid_session_invalid) {
        // refresh in 5 min
        window.setTimeout(() => {
          window.location.reload();
        }, 5 * 60 * 1000);
      } 
      if (settings.auto_refresh && settings.auto_refresh.enabled) {
        let hh = settings.auto_refresh.hour;
        let mm = settings.auto_refresh.minute;
        ((h, m) => {
          window.setInterval(() => {
            let currentTime = new Date();
            if (currentTime.getHours() == h &&
                currentTime.getMinutes() == m &&
                currentTime.getSeconds() == 0){
                window.location.reload(true);
            }
          }, 100);
        })(hh, mm);
      }
    })
  }

  read_settings();

  if (!window.sessionStorage.getItem('autocrn_submitted')) {
    read_crns();
  }

  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (var key in changes) {
      let storageChange = changes[key];
      if (key === 'crn_list') {
        window.sessionStorage.setItem('autocrn_submitted', false);
        // note that it will call fill_form
        read_crns();
      } else if (key === 'crn_settings') {
        read_settings();
      }
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ac_reload") {
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    loaded = true;
  })

})(window, document);