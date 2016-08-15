$(() => {

  let send_to_page = (data, callback) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, data, callback);
    });
  }

  // variables

  let crn_field_template = $('#crn-template').html();
  let message_div = $('.ac-message');
  let form = $('.ac-crn-form');
  var crn_list = [],
      settings = [];

  // version

  $('#version').text(chrome.app.getDetails().version);

  // get crn_list and settings

  chrome.storage.local.get('crn_list', (object) => {
    crn_list = object.crn_list;
    if (crn_list && crn_list.length) {
      crn_list.forEach((e) => {
        append_crn_field(e);
      })
    } else {
      append_crn_field();
    }
  });

  chrome.storage.local.get('crn_settings', (object) => {
      settings = object.crn_settings;
      if (settings.avoid_session_invalid) {
        $('#ac-settings-session').prop('checked', settings.avoid_session_invalid);
      } 
      if (settings.auto_refresh) {
        let enabled = settings.auto_refresh.enabled;
        let hh = settings.auto_refresh.hour;
        let mm = settings.auto_refresh.minute;
        $('#ac-settings-refresh').prop('checked', enabled);
        $('#ac-h').val(hh);
        $('#ac-m').val(mm);
      }
    })

  // event listeners

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "ac_show_msg") {
      message_div.text(request.message).css(request.color);
    }
  });

  let append_crn_field = (value) => {
    if (form.find('.ac-crn').length >= 10) {
      return;
    }
    let new_field = $(crn_field_template)
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
  }

  $('.ac-btn-add').on('click', () => { append_crn_field(); });

  $('.ac-btn-save').on('click', () => {
    crn_list = [];
    var valid = true;
    form.find('.ac-input').each((index, el) => {
      let value = $(el).val();
      if (value.match(/^[0-9]{4,5}$/)) {
        crn_list.push(value);
      } else {
        valid = false;
      }
    });
    if (valid) {
      chrome.storage.local.set({crn_list: crn_list}, () => {
        message_div.text('CRNs saved.').css('color', 'green');
      });
    } else {
      message_div.text('Invalid CRN Number!').css('color', 'red');
    }
  });

  let save_settings = (reload = true) => {
    chrome.storage.local.set({
      crn_settings: {
        avoid_session_invalid: $('#ac-settings-session').prop('checked'),
        auto_refresh: {
          enabled: $('#ac-settings-refresh').prop('checked'),
          hour: parseInt($('#ac-h').val()),
          minute: parseInt($('#ac-m').val())
        }
      }
    }, () => {
      if (reload) {
        message_div.text('Settings saved.').css('color', 'green');
        send_to_page({type: 'ac_reload'})
      }
    });
  }

  $('#ac-settings-session').on('change', () => {
    save_settings();
  });

  save_settings(false);

  $('#ac-settings-refresh').on('change', () => {
    if ($('#ac-settings-refresh').prop('checked')) {
      var valid = true;
      [$('#ac-h').val(), $('#ac-m').val()].forEach((e) => {
        let int_value = window.parseInt(e);
        // rough check
        if (isNaN(int_value) || int_value < 0 || int_value >= 60) {
          valid = false;
        }
      })
      if (valid) {
        save_settings();
      } else {
        $('#ac-settings-refresh').prop('checked', false);
        message_div.text('AutoCRN: Invalid Time').css('color', 'red')
      }
    } else {
      save_settings();
    }
  });

});