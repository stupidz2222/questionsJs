/*global todomvc, angular, Firebase */
'use strict';

/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', '$sce', '$localStorage', '$window', '$timeout', '$interval',
function ($scope, $location, $firebaseArray, $sce, $localStorage, $window, $timeout, $interval) {
	// set local storage
	$scope.$storage = $localStorage;
	$scope.newNotification = false;
	
	var newMessageToggle;
	var scrollCountDelta = 500;
	$scope.maxQuestion = scrollCountDelta;
	$scope.incorrectAdminInfo = false;
	$scope.askFixedPost = false;
	$scope.roomPasswordProtected = false;
	$scope.$storage.replyCount = [];
	$scope.$storage.showReply = [];
	
var splits = $location.path().trim().split("/");
var roomId = angular.lowercase(splits[1]);
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

	$scope.predicate = 'timestamp';
	$scope.reverse = true;

var firebaseURL = "https://flickering-torch-4928.firebaseIO.com/";


// private room
var privateURL = firebaseURL + roomId;
var privateRef = new Firebase(privateURL);
privateRef.once('value', function(data){
	if(data.child('password').val() != '' && data.child('password').val() != null){
		$scope.roomPasswordProtected = true;
		$scope.roomPassword = data.child('password').val();
		$scope.incorrectRoomPassword = false;
		//alert("password required");
	}
});

// room List
$scope.roomList = [];
var roomRef = new Firebase(firebaseURL);
roomRef.on('value', function(data){
	data.forEach(function(room){
		$scope.roomList.push(room.key());
	});
});

$scope.roomId = roomId;


/* setting up $scope.todos */
var url = firebaseURL + roomId + "/questions/";
var echoRef = new Firebase(url);
var query = echoRef.orderByChild("order");
// Should we limit?
//.limitToFirst(1000);
$scope.todos = $firebaseArray(query);
$scope.todos.forEach(function (todo) {
	$scope.$storage.showReply[todo.$id] = false;
});

/* setting up $scope.replies */
var replyUrl = firebaseURL + roomId + "/replies/";
var replyEchoRef = new Firebase(replyUrl);
var replyQuery = replyEchoRef.orderByChild("order");
$scope.replies = $firebaseArray(replyQuery);

$scope.editedTodo = null;

// check administrator login state
if ($scope.$storage.authData != null){
	$scope.$authData = $scope.$storage.authData;
	$scope.isAdmin = true;
}

// emoji for new room
$timeout(function(){
	twemoji.size = '36x36';
	twemoji.parse(document.querySelector('body'));
}, 1000);

// pre-precessing for collection
$scope.$watchCollection('todos', function () {
	var total = 0;
	var remaining = 0;
	
	$scope.todos.forEach(function (todo) {
		// Skip invalid entries so they don't break the entire app.
		if (!todo || !todo.head ) {
			return;
		}

		total++;
		if (todo.completed === false) {
			remaining++;
		}
		//todo.tags = todo.wholeMsg.match(/#\w+/g);
	});

	// new questions notification
	if ($scope.totalCount != "undefined" && $scope.totalCount != 0 && total > $scope.totalCount){
		//alert("There are " + $scope.numberOfNewQuestions + " new questions");
		$scope.setNewNotification(true);
	}

	// emoji
	$timeout(function(){
		twemoji.size = '36x36';
		twemoji.parse(document.querySelector('body'));
	}, 0);

	// reply count
	replyEchoRef.on('value', function(data){
		$scope.todos.forEach(function(todo){
			if (data.child(todo.$id).numChildren() == 0)
				$scope.$storage.replyCount[todo.$id] = 0;
			else
				$scope.$storage.replyCount[todo.$id] = data.child(todo.$id).numChildren();
		});
	});

	$scope.totalCount = total;
	$scope.remainingCount = remaining;
	$scope.completedCount = total - remaining;
	$scope.allChecked = remaining === 0;
	$scope.absurl = $location.absUrl();
}, true);

// Get the first sentence and rest
$scope.getFirstAndRestSentence = function($string) {
	var head = $string;
	var desc = "";

	var separators = [". ", "? ", "! ", '\n'];

	var firstIndex = -1;
	for (var i in separators) {
		var index = $string.indexOf(separators[i]);
		if (index == -1) continue;
		if (firstIndex == -1) {firstIndex = index; continue;}
		if (firstIndex > index) {firstIndex = index;}
	}

	if (firstIndex !=-1) {
		head = $string.slice(0, firstIndex+1);
		desc = $string.slice(firstIndex+1);
	}
	return [head, desc];
};

$scope.addTodo = function () {
	//alert($scope.input.wholeMsg + " " + $scope.input.wholeMsg.length);
	var newTodo = $scope.input.wholeMsg;

	// No input, so just do nothing
	if (!newTodo.length) {
		return;
	}

	// password for newly created room
	if ($scope.todos.length == 0){
		var newRoomRef = new Firebase(firebaseURL + roomId);
		newRoomRef.child("password").set('');
	}
	
	var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];
	
	// admin ask fixed post
	var tempOrder = 0;
	if ($scope.askFixedPost == true)
		tempOrder = 1;
	
	$scope.todos.$add({
		wholeMsg: newTodo,
		head: head,
		headLastChar: head.slice(-1),
		desc: desc,
		//linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
		newQuestion: true,
		completed: false,
		timestamp: new Date().getTime(),
		//tags: "...",
		echo: 0,
		order: tempOrder
	});
	
	// remove the posted question in the input
	$scope.input.wholeMsg = '';
};


$scope.addReply = function (todo, reply) {
	var newReply = reply.wholeMsg.trim();
	
	// No input, so just do nothing
	if (!newReply.length) {
		return;
	}
	// setting the path to the reply directory
	var firstAndLast = $scope.getFirstAndRestSentence(newReply);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];
	
	var questionId = todo.$id;
	var url = replyUrl + questionId;
	var tempReplyRef = new Firebase(url);
	var tempReplyQuery = tempReplyRef.orderByChild("order");
	
	$scope.tempReply = $firebaseArray(tempReplyQuery);
	
	$scope.tempReply.$add({
		wholeMsg: newReply,
		head: head,
		headLastChar: head.slice(-1),
		desc: desc,
		//linkedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
		newQuestion: true,
		completed: false,
		timestamp: new Date().getTime(),
		//tags: "...",
		echo: 0,
		order: 0
	});
	// remove the posted question in the input
	reply.wholeMsg = '';
};

$scope.editTodo = function (todo) {
	$scope.editedTodo = todo;
	$scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.addEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo + 1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo.$id] = "echoed";
};

// Dislike function
$scope.subtractEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo - 1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo.$id] = "echoed";
};

$scope.doneEditing = function (todo) {
	$scope.editedTodo = null;
	var wholeMsg = todo.wholeMsg.trim();
	if (wholeMsg) {
		$scope.todos.$save(todo);
	} else {
		$scope.removeTodo(todo);
	}
};

$scope.revertEditing = function (todo) {
	todo.wholeMsg = $scope.originalTodo.wholeMsg;
	$scope.doneEditing(todo);
};

// remove question
$scope.removeTodo = function (todo) {
	$scope.todos.$remove(todo);
};

// remove reply from a certain question
$scope.removeReply = function(todo, message){
	var tempReplyRef = new Firebase(replyUrl + todo.$id + '/');
	tempReplyRef.on('value', function(data){
		data.forEach(function(reply){
			if (reply.child('wholeMsg').val()==message.wholeMsg && reply.child('timestamp').val()==message.timestamp){
				var removeReplyRef = new Firebase(replyUrl + todo.$id + '/' + reply.key());
				removeReplyRef.remove();
			}
		});
	});	
};

$scope.clearCompletedTodos = function () {
	$scope.todos.forEach(function (todo) {
		if (todo.completed) {
			$scope.removeTodo(todo);
		}
	});
};

$scope.toggleCompleted = function (todo) {
	todo.completed = !todo.completed;
	$scope.todos.$save(todo);
};

$scope.markAll = function (allCompleted) {
	$scope.todos.forEach(function (todo) {
		todo.completed = allCompleted;
		$scope.todos.$save(todo);
	});
};

$scope.increaseMax = function () {
	if ($scope.maxQuestion < $scope.totalCount) {
		$scope.maxQuestion+=scrollCountDelta;
	}
};

$scope.toTop =function toTop() {
	$window.scrollTo(0,0);
};

// Not sure what is this code. Todel
if ($location.path() === '') {
	$location.path('/');
}
$scope.location = $location;

// autoscroll
angular.element($window).bind("scroll", function() {
	if ($window.innerHeight + $window.scrollY >= $window.document.body.offsetHeight) {
		console.log('Hit the bottom2. innerHeight' +
		$window.innerHeight + "scrollY" +
		$window.scrollY + "offsetHeight" + $window.document.body.offsetHeight);

		// update the max value
		$scope.increaseMax();

		// force to update the view (html)
		$scope.$apply();
	}
});

// administrator login
$scope.adminLogin = function(){
	// show loading spinner
	$scope.loading = true;
	// firebase email&password authentication
	echoRef.authWithPassword({
		email    : $scope.userName.trim(),
		password : $scope.userPassword.trim()
	}, function(error, authData) {
		$scope.loading = false;
		// login success
		if (error === null){
			// alert(authData.password.email.toString() + "login success");
			$scope.$apply(function(){
				$scope.$storage.authData = authData;
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			angular.element(document.querySelector('#adminLogin')).css('display', 'none');
			$scope.incorrectAdminInfo = false;
		}
		// login fail
		else{
			$scope.$apply(function(){
				$scope.incorrectAdminInfo = true;
				$scope.userPassword = "";
				//alert(error);
			});
		}
		}, {
		remember: "sessionOnly"
	});
}

// administrator logout
$scope.adminLogout = function(){
	echoRef.unauth();
	delete $scope.$storage.authData;
	$scope.isAdmin = false;
	$scope.askFixedPost = false;
}

// toggle new notification
$scope.setNewNotification = function(show){
	$scope.newNotification = show;
}

// private room login
$scope.privateRoomLogin = function(){
	if ($scope.roomPasswordInput != $scope.roomPassword){
		$scope.incorrectRoomPassword = true;
		$scope.roomPasswordInput = "";
		return;
	}
	$scope.roomPasswordProtected = false;
}

// administrator wants to send fixed post in a certain room
$scope.toggleFixedPost = function(){
	if ($scope.askFixedPost == false)
		$scope.askFixedPost = true;
	else
		$scope.askFixedPost = false;
}

$scope.reloadRoute = function(){
	$window.location.reload();
}

// question toggle the display of reply panel
$scope.toggleReply = function(todo){
	if ($scope.$storage.showReply[todo.$id] == true)
		$scope.$storage.showReply[todo.$id] = false;
	else
		$scope.$storage.showReply[todo.$id] = true;
}

$scope.backRoute = function(){
	$window.history.back();
	$timeout(function(){
		$scope.reloadRoute();
	}, 500);
}

}]);