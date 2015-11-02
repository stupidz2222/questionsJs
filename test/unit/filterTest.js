'use strict';

var questionList=[{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  tags: "...",
  echo: 3,
  order: 3
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  tags: "...",
  echo: 2,
  order: 4
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 0,
  tags: "...",
  echo: 2,
  order: 5
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: 1396091934, // 3/29/2014
  tags: "...",
  echo: 2,
  order: 6
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime(), //new
  tags: "...",
  echo: 2,
  order: 0
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime()-1, //new
  tags: "...",
  echo: 0,
  order: 2
},{
  wholeMsg: "newTodo",
  head: "head",
  headLastChar: "?",
  desc: "desc",
  linkedDesc: "linkedDesc",
  completed: false,
  timestamp: new Date().getTime(), // latest
  tags: "...",
  echo: 0,
  order: 1
}];

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'));

  describe('questionFilter Testing', function() {
    beforeEach(module(function($provide) {
      $provide.value('version', 'TEST_VER'); //TODO: what is this provide?
      console.log("provide.value: " + $provide.value);
    }));

    it('has a question filter', inject(function($filter) {
      expect($filter('questionFilter')).not.toBeNull();
    }));

    it('Filter order test', inject(function(questionFilterFilter) { // need to put Filter suffix
      var filteredList = questionFilterFilter(questionList, 100);
      for (var i in filteredList) {
        expect(""+filteredList[i].order).toEqual(i);
      }
    }));

    it('Filter max test', inject(function(questionFilterFilter) { // need to put Filter suffix
      var filteredList = questionFilterFilter(questionList, 1);
      expect(filteredList.length).toEqual(5);

      for (var i in filteredList) {
        expect(""+filteredList[i].order).toEqual(i);
      }
    }));

    // for testing ngtimeago filter
    it('has a question filter', inject(function($filter) {
      expect($filter('timeago')).not.toBeNull();
    }));
	
	it('Allow Future with Ago time', inject(function(timeagoFilter) { //seconds < 45 AND allowFuture
		var timeresult = timeagoFilter(new Date().getTime()-1000, true);
		expect(timeresult).toEqual(" less than a minute ago  ");
	}));

    it('Filter order test', inject(function(timeagoFilter) {    // more than 1 year from now
      var timeresult = timeagoFilter(new Date().getTime()+33991782000, true);
        expect(timeresult).toEqual(" about a year from now  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) { // seconds < 45
      var timeresult = timeagoFilter(new Date().getTime(), false);
        expect(timeresult).toEqual(" less than a minute ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-50000, false); // seconds < 90
        expect(timeresult).toEqual(" about a minute ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-90000, false); // minutes < 45
        expect(timeresult).toEqual(" 2 minutes ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-2760000, false); // -46 minutes
        expect(timeresult).toEqual(" about an hour ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-5460000, false); // - 91 minutes
        expect(timeresult).toEqual(" about 2 hours ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-90000000, false); // - 25 hours
        expect(timeresult).toEqual(" a day ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-154800000, false); // -43 hours
        expect(timeresult).toEqual(" 2 days ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-2678400000, false); // -31 days
        expect(timeresult).toEqual(" about a month ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-3974400000, false); // -46 days
        expect(timeresult).toEqual(" 2 months ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-31622400000, false); // -366 days
        expect(timeresult).toEqual(" about a year ago  ");
    }));

    it('Filter order test', inject(function(timeagoFilter) {
      var timeresult = timeagoFilter(new Date().getTime()-63072000000, false); // - 2 years
        expect(timeresult).toEqual(" 2 years ago  ");
    }));
    // end of testing ngtimeago filter
  });
});
