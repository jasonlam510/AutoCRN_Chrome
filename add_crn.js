((window, document) => {
  'use strict';

  var loaded = false;
  var crn_list;
  var settings;
  
  // Improved timeout handling with better error checking
  const TIMEOUT_DURATION = 10000; // 10 seconds instead of 5
  
  window.setTimeout(() => {
    if (!loaded) {
      console.log('AutoCRN: Page taking too long to load, refreshing...');
      window.location.reload();
    }
  }, TIMEOUT_DURATION);

  let show_message = (message, color) => {
    try {
      chrome.runtime.sendMessage({
        type: "ac_show_msg",
        message: message,
        color: color
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('AutoCRN: Could not send message:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.log('AutoCRN: Could not send message:', error);
    }
  }

  let fill_form = () => {
    try {
      if (document.getElementById("crn_id1")) {
        let len = crn_list.length;
        for (var i = 1; i <= len; i++) {
          const crnField = document.getElementById("crn_id"+i);
          if (crnField && crn_list[i-1]) {
            crnField.value = crn_list[i-1];
          }
        }
        
        // Focus on the last filled field
        const lastField = document.getElementById("crn_id"+len);
        if (lastField) {
          lastField.focus();
        }
        
        // Set session storage flag
        window.sessionStorage.setItem('autocrn_submitted', true);
        
        // Find submit buttons more safely
        let submitBtns = document.getElementsByName('REG_BTN');
        if (submitBtns && submitBtns.length > 1) {
          // Add a small delay to ensure form is properly filled
          setTimeout(() => {
            try {
              submitBtns[1].click();
              show_message('Form submitted successfully', 'green');
            } catch (error) {
              console.error('AutoCRN: Error submitting form:', error);
              show_message('Error submitting form', 'red');
            }
          }, 500);
        } else {
          console.log('AutoCRN: Submit button not found');
        }
      }
    } catch (error) {
      console.error('AutoCRN: Error filling form:', error);
      show_message('Error filling form', 'red');
    }
  }

  let read_crns = () => {
    try {
      chrome.storage.local.get('crn_list', (object) => {
        crn_list = object.crn_list;
        if (!crn_list || !crn_list.length) {
          console.log('AutoCRN: No CRNs found in storage. Please add CRNs in the popup.');
          return;
        }
        
        if(document.readyState === "complete") {
          fill_form();
        } else {
          window.addEventListener('load', () => {
            fill_form();
          });
        }
      });
    } catch (error) {
      console.error('AutoCRN: Error reading CRNs:', error);
    }
  }

  let read_settings = () => {
    try {
      chrome.storage.local.get('crn_settings', (object) => {
        settings = object.crn_settings;
        if (!settings) {
          console.log('AutoCRN: No settings found. Please configure settings in the popup.');
          return;
        }
        
        if (settings.avoid_session_invalid) {
          // Refresh in 5 min with better error handling
          window.setTimeout(() => {
            try {
              console.log('AutoCRN: Refreshing to avoid session timeout');
              window.location.reload();
            } catch (error) {
              console.error('AutoCRN: Error refreshing page:', error);
            }
          }, 5 * 60 * 1000);
        } 
        
        if (settings.auto_refresh && settings.auto_refresh.enabled) {
          let hh = settings.auto_refresh.hour;
          let mm = settings.auto_refresh.minute;
          
          if (typeof hh === 'number' && typeof mm === 'number' && 
              hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
            
            ((h, m) => {
              window.setInterval(() => {
                try {
                  let currentTime = new Date();
                  if (currentTime.getHours() === h &&
                      currentTime.getMinutes() === m &&
                      currentTime.getSeconds() === 0){
                      console.log('AutoCRN: Auto-refreshing at scheduled time');
                      window.location.reload(true);
                  }
                } catch (error) {
                  console.error('AutoCRN: Error in auto-refresh:', error);
                }
              }, 1000); // Check every second instead of every 100ms
            })(hh, mm);
          } else {
            console.error('AutoCRN: Invalid time settings for auto-refresh');
          }
        }
      });
    } catch (error) {
      console.error('AutoCRN: Error reading settings:', error);
    }
  }

  // Initialize settings first
  read_settings();

  // Check if we're on the registration page
  if (window.location.pathname !== '/pls/PROD/bwskfreg.P_AltPin') {
    // Switched to another page
    window.sessionStorage.setItem('autocrn_submitted', false);
  } else {
    let submitted = window.sessionStorage.getItem('autocrn_submitted');
    if (!submitted || submitted === 'false') {
      // In reg page and not submitted
      read_crns();
    }
  }

  // Listen for storage changes
  try {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (var key in changes) {
        let storageChange = changes[key];
        if (key === 'crn_list') {
          window.sessionStorage.setItem('autocrn_submitted', false);
          // Note that it will call fill_form
          read_crns();
        } else if (key === 'crn_settings') {
          read_settings();
        }
      }
    });
  } catch (error) {
    console.error('AutoCRN: Error setting up storage listener:', error);
  }

  // Listen for messages from popup
  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === "ac_reload") {
        try {
          console.log('AutoCRN: Reloading page as requested');
          sendResponse({success: true, message: 'Page reload initiated'});
          window.location.reload();
        } catch (error) {
          console.error('AutoCRN: Error reloading page:', error);
          sendResponse({success: false, error: error.message});
        }
      }
      return false; // No need to keep message channel open for sync operations
    });
  } catch (error) {
    console.error('AutoCRN: Error setting up message listener:', error);
  }

  // Mark as loaded when page is ready
  window.addEventListener('load', () => {
    loaded = true;
    console.log('AutoCRN: Page loaded successfully');
  });

})(window, document);