/*global todomvc, angular, Firebase */
'use strict';

/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', '$sce', '$localStorage', '$window', '$interval',
function ($scope, $location, $firebaseArray, $sce, $localStorage, $window, $interval) {
	// set local storage
	$scope.$storage = $localStorage;
	$scope.newNotification = false;
	$scope.newNotificationImage = "css/images/newMessage.png";
	
	var newMessageToggle;
	var scrollCountDelta = 10;
	$scope.maxQuestion = scrollCountDelta;

	/*
	$(window).scroll(function(){
	if($(window).scrollTop() > 0) {
	$("#btn_top").show();
} else {
$("#btn_top").hide();
}
});
*/
var splits = $location.path().trim().split("/");
var roomId = angular.lowercase(splits[1]);
if (!roomId || roomId.length === 0) {
	roomId = "all";
}

	$scope.predicate = 'timestamp';
	$scope.reverse = true;

var firebaseURL = "https://flickering-torch-4928.firebaseIO.com/";

// room List
$scope.roomList = [];
var roomRef = new Firebase(firebaseURL);
roomRef.on('value', function(data){
	data.forEach(function(room){
		$scope.roomList.push(room.key());
	});
});

$scope.roomId = roomId;

// private room
/*
var privateURL = firebaseURL + roomId;
var privateRef = new Firebase(privateURL);
alert(privateRef.child('password'));
if (privateRef.password != null){
	alert(privateRef.password);
}
*/
var url = firebaseURL + roomId + "/questions/";
var echoRef = new Firebase(url);


var query = echoRef.orderByChild("order");
// Should we limit?
//.limitToFirst(1000);
$scope.todos = $firebaseArray(query);

//$scope.input.wholeMsg = '';
$scope.editedTodo = null;

// check administrator login state
if ($scope.$storage.authData != null){
	alert($scope.$storage.authData.password.email);
	//$scope.$apply(function(){
		$scope.$authData = $scope.$storage.authData;
		$scope.isAdmin = true;
	//});
}

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
		// set time
		//todo.dateString = new Date(todo.timestamp).toString();
		//$scope.$storage[todo.$id] = "";
		todo.tags = todo.wholeMsg.match(/#\w+/g);
		//todo.trustedDesc = $sce.trustAsHtml(todo.linkedDesc);
	});

	// new questions notification
	if ($scope.totalCount != "undefined" && $scope.totalCount != 0 && total > $scope.totalCount){
		//alert("There are " + $scope.numberOfNewQuestions + " new questions");
		$scope.setNewNotification(true);
	}
	
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
	var newTodo = $scope.input.wholeMsg.trim();

	// No input, so just do nothing
	if (!newTodo.length) {
		return;
	}

	var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
	var head = firstAndLast[0];
	var desc = firstAndLast[1];

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
		order: 0
	});
	// remove the posted question in the input
	$scope.input.wholeMsg = '';
};

$scope.editTodo = function (todo) {
	$scope.editedTodo = todo;
	$scope.originalTodo = angular.extend({}, $scope.editedTodo);
};

$scope.addEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo + 1;
	// Hack to order using this order.
	todo.order = todo.order -1;
	$scope.todos.$save(todo);

	// Disable the button
	$scope.$storage[todo.$id] = "echoed";
};

// Dislike function
$scope.subtractEcho = function (todo) {
	$scope.editedTodo = todo;
	todo.echo = todo.echo - 1;			// modified
	// Hack to order using this order.
	todo.order = todo.order -1;
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

$scope.removeTodo = function (todo) {
	$scope.todos.$remove(todo);
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

$scope.FBLogin = function () {
	var ref = new Firebase(firebaseURL);
	ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			$scope.$apply(function() {
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			console.log("Authenticated successfully with payload:", authData);
		}
	});
};

$scope.FBLogout = function () {
	var ref = new Firebase(firebaseURL);
	ref.unauth();
	delete $scope.$authData;
	$scope.isAdmin = false;
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

$scope.adminLogin = function(){
	//var ref = new Firebase(firebaseURL);
		
	echoRef.authWithPassword({
		email    : $scope.userName.trim(),
		password : $scope.userPassword.trim()
	}, function(error, authData) { 
		if (error === null){
			alert(authData.password.email.toString() + "login success");
			//$('#adminLogin').append(authData.password.email.toString());
			$scope.$apply(function(){
				$scope.$storage.authData = authData;
				$scope.$authData = authData;
				$scope.isAdmin = true;
			});
			angular.element(document.querySelector('#adminLogin')).css('display', 'none');
		}
		else
			alert(error);
	}, {
		remember: "sessionOnly"
	});
}
	
$scope.adminLogout = function(){
		
	//var ref = new Firebase(firebaseURL);
	echoRef.unauth();
	delete $scope.$storage.authData;
	$scope.isAdmin = false;
}

$scope.setNewNotification = function(show){
	$scope.newNotification = show;
	if (!show){
		$interval.cancel(newMessageToggle);
		$scope.newNotificationImage = "css/images/newMessage.png";
	}
	if (show){
		newMessageToggle = $interval(function(){
			if ($scope.newNotificationImage == "css/images/newMessage.png")
				$scope.newNotificationImage = "css/images/newMessage2.png";
			else
				$scope.newNotificationImage = "css/images/newMessage.png";
		}, 1000);
	}
}
$scope.reloadRoute = function(){
	$window.location.reload();
}

}]);