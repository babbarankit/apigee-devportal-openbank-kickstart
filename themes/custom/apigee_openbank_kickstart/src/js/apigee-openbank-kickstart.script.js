import 'popper.js';
import 'bootstrap';
import { Base64 } from 'js-base64';

// Components.
// TODO: Break this into libraries.
import '../components/form/fieldset';
import '../components/card/collapsible-card';

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.side_menu = {
    attach: function(context, settings) {
      var pathName = location.pathname;
      $('.nav-link').each(function() {
        if ($(this).attr('href') == pathName) {
          $(this).parent().siblings().addClass('show');
          $(this).closest('li').addClass('expanded');
        }
      });

      $(context).find('.svg-inline--fa').once('icon-clicked').click(function() {
        var subMenu = $(this).parent().siblings();
        if (subMenu.hasClass('show')) {
          subMenu.removeClass('show');
          $(this).closest('li').removeClass('expanded');
        }
        else {
          subMenu.addClass('show');
          $(this).closest('li').addClass('expanded');
        }
      })
    }
  };

  Drupal.behaviors.block_scroll = {
    attach: function(context, settings) {
      if (location.hash) {
        var hash = location.hash.split('/');
        var openBlockElem = '#operations-' +hash[1] + '-' + hash[2];
        if ($(openBlockElem).length) {
          $('html, body').animate({
            scrollTop: $(openBlockElem).offset().top - 90
          }, 'medium');
        }
      }
    }
  };

  Drupal.behaviors.internal_block_scroll = {
    attach: function(context, settings) {
      $('.api-explorer__method.internal').click(function(event) {
        event.preventDefault();
        var clickedLink = $(this).attr('href').split('/');
        var method = $(this).data('method');
        var length = clickedLink.length;
        var blockToScroll = '#operations-' + clickedLink[length-2] + '-' + clickedLink[length-1];
        if ($(blockToScroll).length) {
          $(blockToScroll).click();
          $('html, body').animate({
            scrollTop: $(blockToScroll).offset().top - 90
          }, 400);
          var classes = $(blockToScroll).attr('class');
          if (!classes.includes('is-open')) {
            $(`${blockToScroll} .opblock-summary-${method}`).click();
          }
          event.stopPropagation();
        }
      });
    }
  };

  Drupal.behaviors.generate_auth_token = {
    attach: function(context, settings) {
      var modalMarkup = `<div class="modal fade" id="authModal" tabindex="-1" role="dialog" aria-labelledby="authModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Create Authorization Token</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="scopes">Scope</label>
                  <select class="form-control" id="scopes">
                    <option value="accounts">Accounts</option>
                    <option value="payments">Payments</option>
                  </select>
                </div>
                <div class="form-group">
                  <label><input type="checkbox" name="default-token" id="default-token"> Use default</label>
                </div>
                <div class="form-group client-info">
                  <label for="client-id">Custom Client Id</label>
                  <input type="text" class="form-control" id="client-id">
                </div>
                <div class="form-group client-info">
                  <label for="client-secret">Custom Client Secret</label>
                  <input type="text" class="form-control" id="client-secret">
                </div>
              </form>
            </div>
            <div class="modal-footer justify-content-center">
              <button type="button" class="btn btn-success" data-dismiss="modal">Create Token</button>
            </div>
          </div>
        </div>
      </div>`;

      $('body').once().append(modalMarkup);

      $('.try-out__btn').on('click', function(event) {
        event.preventDefault();
        var tryBtn = $(this);
        var paramRows = tryBtn.closest('.opblock-section').find('tr');
        paramRows.each(function() {
          var row = $(this);
          if (row.data('paramName') == 'Authorization') {
            row.find('.parameters-col_description').once().append('<a href="#" class="btn btn-sm authorize" data-toggle="modal" data-target="#authModal">Generate Token</a>');
          }

          $('#authModal').find('#default-token').on('change', function() {
            if ($(this).is(':checked')) {
              $(this).closest('.form-group').siblings('.client-info').addClass('hidden');
            }
            else {
              $(this).closest('.form-group').siblings('.client-info').removeClass('hidden');
            }
          });

          $('#authModal').find('.btn-success').on('click', function() {
            var modalForm = $(this).closest('.modal-content').find('form');
            var defaultAuthToken = drupalSettings.apigee_openbank_psu_oauth.default_auth;
            var scope = modalForm.find('#scopes').val();
            var defaultToken = modalForm.find('#default-token').is(':checked');
            var clientId = modalForm.find('#client-id').val();
            var clientSecret = modalForm.find('#client-secret').val();
            var token = `${clientId}:${clientSecret}`;
            var base64Encoded = Base64.encode(token);

            if (row.data('paramName') == 'scope') {
              row.find('select').val(scope);
            }

            if (row.data('paramName') == 'Authorization') {
              if (defaultToken) {
                row.find('input[type="text"]').val(defaultAuthToken[scope]);
              }
              else {
                row.find('input[type="text"]').val(base64Encoded);
              }
            }
          });
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
