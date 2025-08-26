$(() => {
  'use strict';

  let send_to_page = (data, callback) => {
    try {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error('AutoCRN: Error querying tabs:', chrome.runtime.lastError);
          return;
        }
        if (tabs && tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, data, (response) => {
            if (chrome.runtime.lastError) {
              console.error('AutoCRN: Error sending message to tab:', chrome.runtime.lastError);
              return;
            }
            if (callback && typeof callback === 'function') {
              callback(response);
            }
          });
        }
      });
    } catch (error) {
      console.error('AutoCRN: Error sending message to page:', error);
    }
  }

  // Variables
  let crn_field_template = $('#crn-template').html();
  let message_div = $('.ac-message');
  let form = $('.ac-crn-form');
  var crn_list = [],
      settings = [];

  // Version
  $('#version').text('1.0.2');

  // Get CRN list and settings
  chrome.storage.local.get('crn_list', (object) => {
    try {
      crn_list = object.crn_list || [];
      if (crn_list && crn_list.length) {
        crn_list.forEach((e) => {
          append_crn_field(e);
        });
      } else {
        append_crn_field();
      }
    } catch (error) {
      console.error('AutoCRN: Error loading CRN list:', error);
      append_crn_field();
    }
  });

  chrome.storage.local.get('crn_settings', (object) => {
    try {
      settings = object.crn_settings || {};
      if (settings.avoid_session_invalid) {
        $('#ac-settings-session').prop('checked', settings.avoid_session_invalid);
      } 
      if (settings.auto_refresh) {
        let enabled = settings.auto_refresh.enabled;
        let hh = settings.auto_refresh.hour;
        let mm = settings.auto_refresh.minute;
        $('#ac-settings-refresh').prop('checked', enabled);
        if (typeof hh === 'number' && hh >= 0 && hh < 24) {
          $('#ac-h').val(hh);
        }
        if (typeof mm === 'number' && mm >= 0 && mm < 60) {
          $('#ac-m').val(mm);
        }
      }
    } catch (error) {
      console.error('AutoCRN: Error loading settings:', error);
    }
  });

  // Event listeners
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.type == "ac_show_msg") {
        message_div.text(request.message).css('color', request.color);
        sendResponse({success: true});
      }
    } catch (error) {
      console.error('AutoCRN: Error handling message:', error);
      sendResponse({success: false, error: error.message});
    }
    return false; // No need to keep message channel open for sync operations
  });

  let append_crn_field = (value) => {
    try {
      if (form.find('.ac-crn').length >= 10) {
        message_div.text('Maximum 10 CRNs allowed').css('color', 'orange');
        return;
      }
      let new_field = $(crn_field_template);
      new_field.find('.ac-btn-del').on('click', () => {
         if (form.find('.ac-crn').length <= 1) {
            return;
          }
        new_field.remove();
      });
      if (value) {
        new_field.find('.ac-input').val(value);
      }
      form.append(new_field);
    } catch (error) {
      console.error('AutoCRN: Error appending CRN field:', error);
    }
  }

  $('.ac-btn-master').on('click', () => { 
    try {
      window.open('https://banweb.cityu.edu.hk/pls/PROD/hwscrssh_cityu.P_SelTerm');
    } catch (error) {
      console.error('AutoCRN: Error opening master schedule:', error);
    }
  });

  $('.ac-btn-add').on('click', () => { 
    try {
      append_crn_field();
    } catch (error) {
      console.error('AutoCRN: Error adding CRN field:', error);
    }
  });

  $('.ac-btn-save').on('click', () => {
    try {
      crn_list = [];
      var valid = true;
      form.find('.ac-input').each((index, el) => {
        let value = $(el).val();
        if (value && value.match(/^[0-9]{4,5}$/)) {
          crn_list.push(value);
        } else if (value && value.trim() !== '') {
          valid = false;
        }
      });
      if (valid) {
        chrome.storage.local.set({crn_list: crn_list}, () => {
          if (chrome.runtime.lastError) {
            console.error('AutoCRN: Error saving CRNs:', chrome.runtime.lastError);
            message_div.text('Error saving CRNs').css('color', 'red');
          } else {
            message_div.text('CRNs saved successfully').css('color', 'green');
          }
        });
      } else {
        message_div.text('Invalid CRN Number! Please check your input.').css('color', 'red');
      }
    } catch (error) {
      console.error('AutoCRN: Error saving CRNs:', error);
      message_div.text('Error saving CRNs').css('color', 'red');
    }
  });

  let save_settings = (reload = true) => {
    try {
      let hour = parseInt($('#ac-h').val()) || 0;
      let minute = parseInt($('#ac-m').val()) || 0;
      
      // Validate time inputs
      if (hour < 0 || hour >= 24 || minute < 0 || minute >= 60) {
        message_div.text('Invalid time format!').css('color', 'red');
        return;
      }
      
      chrome.storage.local.set({
        crn_settings: {
          avoid_session_invalid: $('#ac-settings-session').prop('checked'),
          auto_refresh: {
            enabled: $('#ac-settings-refresh').prop('checked'),
            hour: hour,
            minute: minute
          }
        }
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('AutoCRN: Error saving settings:', chrome.runtime.lastError);
          message_div.text('Error saving settings').css('color', 'red');
        } else {
          if (reload) {
            message_div.text('Settings saved successfully').css('color', 'green');
            send_to_page({type: 'ac_reload'});
          }
        }
      });
    } catch (error) {
      console.error('AutoCRN: Error saving settings:', error);
      message_div.text('Error saving settings').css('color', 'red');
    }
  }

  $('#ac-settings-session').on('change', () => {
    try {
      save_settings();
    } catch (error) {
      console.error('AutoCRN: Error handling session setting change:', error);
    }
  });

  // Initialize settings
  save_settings(false);

  $('#ac-settings-refresh').on('change', () => {
    try {
      if ($('#ac-settings-refresh').prop('checked')) {
        var valid = true;
        let hour = parseInt($('#ac-h').val());
        let minute = parseInt($('#ac-m').val());
        
        // Validate time inputs
        if (isNaN(hour) || hour < 0 || hour >= 24 || 
            isNaN(minute) || minute < 0 || minute >= 60) {
          valid = false;
        }
        
        if (valid) {
          save_settings();
        } else {
          $('#ac-settings-refresh').prop('checked', false);
          message_div.text('AutoCRN: Invalid Time Format (HH:MM)').css('color', 'red');
        }
      } else {
        save_settings();
      }
    } catch (error) {
      console.error('AutoCRN: Error handling refresh setting change:', error);
      $('#ac-settings-refresh').prop('checked', false);
    }
  });

  // Add input validation for time fields
  $('#ac-h, #ac-m').on('input', function() {
    try {
      let value = parseInt($(this).val());
      let max = $(this).attr('id') === 'ac-h' ? 23 : 59;
      
      if (value > max) {
        $(this).val(max);
      } else if (value < 0) {
        $(this).val(0);
      }
    } catch (error) {
      console.error('AutoCRN: Error validating time input:', error);
    }
  });

});