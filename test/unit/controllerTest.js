'use strict';

var toDoList=[{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  //tags: "...",
  echo: 3,
  order: 3
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  //tags: "...",
  echo: 2,
  order: 4
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  //tags: "...",
  echo: 2,
  order: 5
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  //tags: "...",
  echo: 2,
  order: 6
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime(), //new
  //tags: "...",
  echo: 2,
  order: 0
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime()-1, //new
  //tags: "...",
  echo: 0,
  order: 2
},{
  wholeMsg: "",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  //linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime(), // latest
  //tags: "...",
  echo: 0,
  order: 1
}];

describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
        //var sorted = sortUsers(users);
        //expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'));
  // variables for injection
  var controller;
  var scope;
  var location;
  var firebaseArray;
  var sce;
  var localStorage;
  var window;
  var compile;

  // Injecting variables
  // http://stackoverflow.com/questions/13664144/how-to-unit-test-angularjs-controller-with-location-service
  beforeEach(inject(function($location,
    $rootScope,
    $controller,
    $firebaseArray,
    $localStorage,
    $sce,
    $window,
	$compile){
      // The injector unwraps the underscores (_) from around the parameter names when matching

      scope = $rootScope.$new();
      location = $location;
      controller = $controller;
      firebaseArray = $firebaseArray;
      sce = $sce;
      localStorage = $localStorage;
      window = $window;
	  compile = $compile;
    }));

    describe('TodoCtrl Testing', function() {
		
      it('setFirstAndRestSentence', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
        var testInputs = [
          {str:"Hello? This is Sung", exp: "Hello?"},
          {str:"Hello.co? ! This is Sung", exp: "Hello.co?"},
          {str:"Hello.co This is Sung", exp: "Hello.co This is Sung"},
          {str:"Hello.co \nThis is Sung", exp: "Hello.co \n"},
		  {str:"? . ", exp: "?"},
          {str:"Hello?? This is Sung", exp: "Hello??"},
        ];

        for (var i in testInputs) {
          var results = scope.getFirstAndRestSentence(testInputs[i].str);
          expect(results[0]).toEqual(testInputs[i].exp);
        }
      });

      it('RoomId', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

        expect(scope.roomId).toBe("new");
      });

      it('toTop Testing', function() {

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        scope.toTop();
        expect(window.scrollX).toBe(0);
        expect(window.scrollY).toBe(0);
      });
	  
	  // new test cases
	  it('addTodo Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		/************************ addTodo ************************/
		scope.input = {
			wholeMsg : 'addTodo testing1'
		};
		scope.addTodo();
		expect(scope.input.wholeMsg).toEqual('');
		
		scope.input = {
			wholeMsg : ''
		};
		scope.addTodo();
		scope.$apply(); // force to invoke $watchCollection
		expect(scope.input.wholeMsg).toEqual('');
		
		scope.todos = [{
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 1
		},
		{
			wholeMsg: "",
			head: "",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 2
		}];
		
		expect(scope.todos.length).toBe(2);
		
	  });
	  
	  it('editTodo Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		scope.editTodo(toDoList);
	  });
	  
	  it('addEcho Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		var oldVal = toDoList[3].echo;
		scope.addEcho(toDoList[3]);
		expect(toDoList[3].echo).toBe(oldVal+1);
	  });
	  
	  it('doneEditing Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		scope.doneEditing(toDoList[1]);
		scope.doneEditing(toDoList[6]);
	  });
	  
	  it('removeTodo Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		scope.removeTodo(toDoList[0]);
	  });
	  
	  it('toggleCompleted Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		var temp = toDoList[2].completed;
		scope.toggleCompleted(toDoList[2]);
		expect(toDoList[2].completed).toBe(!temp);
	  });
	  
	  it('markAll Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		scope.todos = [{
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 1
		},
		{
			wholeMsg: "",
			head: "",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 2
		}];
		scope.todos.$save = function (object) {};
		scope.markAll(true);
		scope.todos.forEach(function (todo) {
			expect(todo.completed).toBe(true);
		});
	  });
	  
	  it('increaseMax Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		
		var temp = scope.maxQuestion;
		scope.totalCount = scope.maxQuestion + 10;
		scope.increaseMax();
		expect(scope.maxQuestion).toBe(1000);
	  });
	  
	  it('clearCompletedTodos Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope
        });
		scope.todos = [{
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 1
		},
		{
			wholeMsg: "",
			head: "",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: true,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 2
		}];
		scope.todos.$remove = function (object) {
			var i = 0;
			scope.todos.forEach(function () {
				if (scope.todos[i] == object)
					scope.todos.splice(i,1);
				i++;
			});
		};
		scope.clearCompletedTodos();
		scope.todos.forEach(function (todo) {
			expect(todo.completed).toBe(false);
		});
	  });
	  
	  it('autoScroll Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		var scrollEvent = window.document.createEvent( 'CustomEvent' );
		scrollEvent.initCustomEvent( 'scroll', false, false, null );
		window.scrollTo(window.scrollX, window.document.body.offsetHeight + 100);
		window.dispatchEvent(scrollEvent);
	  });
	  
	  it('subtractEcho Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.todo = {
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		scope.subtractEcho(scope.todo);
	  });
	  
	  it('revertEditing Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.todo = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		
		scope.originalTodo = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		scope.revertEditing(scope.todo);
	  });
	  
	  it('addReply Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });
		scope.todo = {
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		scope.reply = {
			wholeMsg: "",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 1
		};
		scope.reply.wholeMsg = "test";
		scope.tempReply = [];
		scope.addReply(scope.todo, scope.reply);
		
		scope.reply.wholeMsg = "";
		scope.addReply(scope.todo, scope.reply);
	  });
	  
	  it('revertEditing Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.todo = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		
		scope.message = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0
		};
		scope.removeReply(scope.todo, scope.message);
	  });
	  
	  it('adminLogin Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.userName = "comp3111@ust.hk";
		scope.userPassword = "love!sung";
		scope.adminLogin();
		
		scope.userName = "abc";
		scope.userPassword = "abc";
		scope.adminLogin();
	  });
	  
	  it('adminLogout Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.adminLogout();
	  });
	  
	  it('setNewNotification Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.setNewNotification(false);
		scope.setNewNotification(true);
	  });
	  
	  it('privateRoomLogin Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		scope.incorrectRoomPassword = false;
		
		scope.roomPasswordInput = 'abc';
		scope.roomPassword = 'abc';
		scope.privateRoomLogin();
		
		scope.roomPasswordInput = 'abc';
		scope.roomPassword = '123';
		scope.privateRoomLogin();
	  });
	  
	  it('toggleReply Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		
		scope.todo = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0,
			showReply: true
		};
		
		scope.toggleReply(scope.todo);
		
		scope.todo = {
			wholeMsg: "asd",
			head: "head",
			headLastChar: "?",
			desc: "desc",
			//linkedDesc: "linkedDesc",
			completed: false,
			timestamp: new Date().getTime(), // latest
			//tags: "...",
			echo: 0,
			order: 0,
			showReply: false
		};
		
		scope.toggleReply(scope.todo);
	  });
	  
	  it('toggleFixedPost Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $window: window
        });//
		scope.askFixedPost = false;
		scope.toggleFixedPost();
		
		scope.askFixedPost = true;
		scope.toggleFixedPost();
	  });
	  
	  /************************ directive ************************/
	  it('todomvc directive keydown Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $compile: compile
        });//
		
		var target = '<todo-blur></todo-blur>';
		target = compile(target)(scope);
		
		var event = angular.element.Event('keydown');
		event.keyCode = 27;
		angular.element(target).triggerHandler(event);
		scope.$digest();
		event.keyCode = 14;
		angular.element(target).triggerHandler(event);
		scope.$digest();
		
		scope.$destroy();
	  });
	  
	  it('todomvc directive focus Testing', function(){
		var ctrl = controller('TodoCtrl', {
          $scope: scope,
		  $compile: compile
        });//
		
		var target = angular.element('<input todo-focus="focus">');
		scope.focus = false;

		compile(target)(scope);

		scope.$apply(function () {
			scope.focus = true;
		});
		
		var target = angular.element('<input todo-focus="focus">');
		scope.focus = true;

		compile(target)(scope);

		scope.$apply(function () {
			scope.focus = false;
		});
		
	  });
	  
	  
    });
  });

  