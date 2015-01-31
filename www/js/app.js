// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // Analytics
    if(typeof analytics !== "undefined") {
        analytics.startTrackerWithId("UA-51942737-3");
    } else {
        console.log("Google Analytics Unavailable");
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.welcome', {
    url: "/welcome",
    views: {
      'menuContent': {
        templateUrl: "templates/welcome.html",
      }
    }
  })

  .state('app.profile', {
    url: "/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/profile.html",
        controller: 'ProfileCtrl'

      }
    }
  })

  .state('app.inbox', {
    url: "/mail/:direzione",
    views: {
      'menuContent': {
        templateUrl: "templates/inbox.html",
        controller: 'MailCtrl'

      }
    }
  })  


  .state('app.msg', {
    url: "/mail/:direzione/id/:msgid",
    views: {
      'menuContent': {
        templateUrl: "templates/msg.html",
        controller: 'MsgCtrl'

      }
    }
  })  


  .state('app.activities', {
    url: "/activities",
    views: {
      'menuContent': {
        templateUrl: "templates/calendar.html",
        controller: 'ActivitiesCtrl'
      }
    }
  })  

  .state('app.myactivities', {
    url: "/myactivities",
    views: {
      'menuContent': {
        templateUrl: "templates/myactivities.html",
        controller: 'MyActivitiesCtrl'
      }
    }
  })  

  .state('app.activitiesday', {
    url: "/activities/:day",
    views: {
      'menuContent': {
        templateUrl: "templates/calendar.html",
        controller: 'ActivitiesCtrl'
      }
    }
  })

  .state('app.single', {
    url: "/activity/:activityId",
    views: {
      'menuContent': {
        templateUrl: "templates/activity.html",
        controller: 'ActivityCtrl'
      }
    }
  })


  .state('app.phonebook', {
    url: "/delegati",
    views: {
      'menuContent': {
        templateUrl: "templates/phonebook.html",
        controller: 'PhonebookCtrl'
      }
    }
  })

  .state('app.phonebookV', {
    url: "/volontari",
    views: {
      'menuContent': {
        templateUrl: "templates/phonebookV.html",
        controller: 'PhonebookVCtrl'
      }
    }
  });

  // if none of the above   states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/welcome');

})


.filter('dataTurno', function () {
  return function (item) {
    var i = item.indexOf(':00.');
    var d = new Date(item.substr(0, i));
    return d;
  };
});


