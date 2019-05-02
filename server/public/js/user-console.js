var current_room_id;
var current_user_id;
var current_user_name;
var instance_roles = [];

var permissions = ['room:join', 'room:leave', 'room:members:add', 'room:members:remove', 'file:create', 'file:get', 'room:messages:get', 'message:create'];
var permissions_html = Handlebars.templates["checkbox-permissions"]({ 'permissions': permissions });

$('#permissions-container').html(permissions_html);

$('#create-room').click(function(){
  var room_name = $('#room_name').val();
  var is_private = $('#is_private_room').is(':checked');

  $.post(
    "/create-room",
    {
      'room_name': room_name,
      'is_private': is_private
    },
    function(rooms) {
      var rooms_html = Handlebars.templates["table-rooms"]({ 'rooms': rooms });
      $('#rooms-table-rows').html(rooms_html);
    }
  );

  $('#room_name').val('');
  $('#is_private_room').prop('checked', false);
  $('#create-room-modal').modal('toggle');
});

$('#create-user').click(function(){
  var user_name = $('#user_name').val();
  $.post(
    "/create-user",
    {
      'user_name': user_name
    }
  );

  $('#user_name').val('');
  $('#create-user-modal').modal('toggle');
});

function setCurrentRoom(room_name) {
  $('.current-room').html(room_name);
}

$('#rooms-table-rows').on('click', '.add-user', function() {
  var self = $(this);
  current_room_id = self.data('id');

  var room_name = self.data('name');
  setCurrentRoom(room_name);

  $('#add-user-to-room-modal').modal('toggle');
  $('#users-container').addClass('d-none');

  $.get(
    "/get-users",
    function(users) {
      var option_users_html = Handlebars.templates["option-users"](users);
      $('#user_to_add').html(option_users_html);
    }
  );
});

$('#add-user-to-room').click(function() {
  var selected_user_id = $('#user_to_add').val();

  $.post(
    "/room/add-user",
    {
      'room_id': current_room_id,
      'user_id': selected_user_id
    },
    function(room_users) {

      if (room_users.length) {
        var td_users_html = Handlebars.templates["table-users"]({ 'room_users': room_users });
        $('#users-table-rows').html(td_users_html);
        $('#users-container').removeClass('d-none');
      } else {
        $('#users-container').addClass('d-none');
      }

    }
  );

  $('#add-user-to-room-modal').modal('toggle');

});

$('#rooms-table-rows').on('click', '.view-users', function() {
  var self = $(this);
  var room_id = self.data('id');

  current_room_id = room_id;

  var room_name = self.data('name');
  setCurrentRoom(room_name);

  $.get(
    '/room/' + room_id + '/users',
    function(room_users) {

      if (room_users.length) {
        var td_users_html = Handlebars.templates["table-users"]({ 'room_users': room_users });
        $('#users-table-rows').html(td_users_html);
        $('#users-container').removeClass('d-none');
      } else {
        $('#users-container').addClass('d-none');
      }
    }
  );
});

$('#create-role').click(function() {
  var role_name = $('#role_name').val();
  var selected_permissions = [];

  $.each($("input[name=permission]:checked"), function(){
    selected_permissions.push($(this).val());
  });

  $.post(
    '/create-role',
    {
      'role_name': role_name,
      'permissions': selected_permissions
    },
    function(res) {
      $('#role_name').val('');
      $('input[name=permission]').prop('checked', false);
    }
  );

  $('#create-role-modal').modal('toggle');
});

function showRolePermissions(role_name) {
  var role_permissions = instance_roles.find(function(role) {
    return role.name === role_name;
  }).permissions;

  var role_permissions_html = Handlebars.templates["checkbox-permissions"]({ 'permissions': role_permissions });
  $('#role-permissions').html(role_permissions_html);

  $('input[name=permission]').prop({ 'checked': true, disabled: true });
}

$('#users-container').on('click', '.view-roles', function() {
  var self = $(this);
  current_user_id = self.data('id');
  current_user_name = self.data('name');

  $('.current-user').text(current_user_name);

  $('#assign-roles-modal').modal('toggle');

  $.get('/roles', function(roles) {
    instance_roles = roles;
    var option_roles_html = Handlebars.templates["option-roles"]({ 'roles': roles });

    $('#roles').html(option_roles_html);

    var role_name = $('#roles').val();
    showRolePermissions(role_name);
  });
});

$('#roles').change(function() {
  var self = $(this);
  var role_name = self.val();

  showRolePermissions(role_name);
});

$('#assign-role-to-user').click(function() {
  var role = $('#roles').val();

  $.post(
    "/user/" + current_user_id + "/assign-role",
    {
      'room_id': current_room_id,
      'role_name': role
    },
    function(res) {
      console.log("res: ", res);
    }
  );

  $('#assign-roles-modal').modal('toggle');
});

$('#create-role-modal').on('show.bs.modal', function (e) {
  $('input[name=permission]').prop({ checked: false, disabled: false });
});