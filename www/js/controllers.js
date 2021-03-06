var DEBUG = true;



angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $location, $timeout, $ionicLoading, $ionicSideMenuDelegate, $ionicPopup) {
  if(typeof analytics !== "undefined") { analytics.trackView("Schermata principale"); }


  // Form data for the login modal

  $scope.base = 'https://gaia.cri.it/api.php?';
  $scope.key = 'f9ae5f644e8c545818e05f5cc740037b85307332';

  $scope.session = {
    sid: window.localStorage['sid'],
    valid: false,
    user: null,
  };

  $scope.messages = {
    list: []
  };  

  $scope.loginRequired = function() {
    if ( !$scope.session.valid ) {
        $location.path('/app/welcome');
    }
  };

  $scope.api = function(method, params, callback) {
    DEBUG && console.log("-> API", method, params);
    params.key = $scope.key;
    params.sid = window.localStorage['sid'];
    params.metodo = method; 
    $http.post($scope.base, params).
      success(function(data, status, headers, config) {
        DEBUG && console.log("<- API", data);
        if ( callback !== undefined ) {
          $timeout(function() {
            window.localStorage['sid'] = data.sessione.id;
            $scope.session.sid = data.sessione.id;
            console.log("SID", data.sessione.id);
            callback(data);
          });
        }
      }).
      error(function(data, status, headers, config) {
        DEBUG && console.log("Error");
          $ionicLoading.hide();
         var alertPopup = $ionicPopup.alert({
           title: 'Connessione fallita',
           template: 'Assicurati di essere connesso ad Internet e riapri Gaia-Marvin.'
         });
         alertPopup.then(function(res) {
           navigator.app.exitApp();
         });
      });
  }
  
  $ionicLoading.show({
    template: 'Connessione a Gaia...'
  });

  $scope.controllaConnessione = function(callback) {
    $scope.api('ciao', {}, function(x) {
      if ( !x.sessione.identificato ) {
        $scope.session.valid = false;
        $scope.session.sid   = null;
        if(typeof analytics !== "undefined") { analytics.trackEvent('Login', 'Fallito'); }
      } else {
        $scope.session.valid = true;
        $scope.session.user  = x.sessione.utente;
        if(typeof analytics !== "undefined") { analytics.setUserId(x.sessione.utente.id); }
        if(typeof analytics !== "undefined") { analytics.trackEvent('Login', 'Ok'); }
        //$location.path('/app/profile');
      }
      callback(x.sessione.identificato);
    });
  };

  $scope.controllaConnessione(function(x) {
    $ionicLoading.hide();
  });

  $scope.accedi = function() {

    $ionicLoading.show({
      template: 'Connessione a Gaia...'
    });
    $scope.api('login', {}, function(x) {
      var loginWindow;
      loginWindow = window.open(x.risposta.url, '_blank', 'location=no,toolbar=no');
      var refresher = setInterval(
        function() {
          $scope.controllaConnessione(function(r){
            if ( r ) {
              loginWindow.close();
              $ionicLoading.hide();
              $ionicSideMenuDelegate.toggleLeft();
              clearInterval(refresher);
            }
          })
        }, 3500);
      

    });

  }

})

.controller('ProfileCtrl', function($scope, $ionicLoading) {
  
  if(typeof analytics !== "undefined") { analytics.trackView("Profilo Utente"); }


  $scope.loginRequired();
  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.myProfile = {};
  $scope.api('io', {}, function(x) {
    $scope.myProfile = x.risposta;
    $ionicLoading.hide();
  });


})

.controller('PhonebookCtrl', function($scope, $ionicLoading) {

  if(typeof analytics !== "undefined") { analytics.trackView("Rubrica Delegati"); }

  $scope.loginRequired();
  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.applicazioni = {
      "10"    :  "Attività",
      "30"   :  "Presidente",
      "40"  :  "Obiettivo strategico",
      "50"   :  "Centrale Operativa",
      "60"          :  "Ufficio Soci",
      "70"        :  "Ufficio Patenti",
      "80"     :  "Resp. Formazione",
      "90"  :  "Resp. Autoparco"
  };

  $scope.delegati = {
    lista:  []
  };

  $scope.api('rubrica:delegati', {}, function(x) {
    $scope.delegati.lista = x.risposta.risultati;
    $ionicLoading.hide();
  });


})

.controller('PhonebookVCtrl', function($scope, $ionicLoading) {

  if(typeof analytics !== "undefined") { analytics.trackView("Rubrica Volontari"); }

  $scope.loginRequired();
  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.volontari = {
    lista:  []
  };

  $scope.api('rubrica', {}, function(x) {
    $scope.volontari.lista = x.risposta.risultati;
    $ionicLoading.hide();
  });


})

.controller('MyActivitiesCtrl', function($scope, $ionicLoading, $ionicPopup) {

  if(typeof analytics !== "undefined") { analytics.trackView("Mie attivita"); }

  $scope.loginRequired();
  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.partecipazioni = {
    lista:  []
  };

  $scope.icone = {
    10:'ion-clock',
    15:'ion-close-circled',
    20:'ion-minus-circled',
    30:'ion-checkmark-circled'
  };

  $scope.carica = function() {
    $scope.api('partecipazioni', {}, function(x) {
      $scope.partecipazioni.lista = x.risposta.risultati;
      $ionicLoading.hide();
    });
  };

  $scope.ritira = function(partid) {

     var confirmPopup = $ionicPopup.confirm({
       title: 'Ritira partecipazione',
       template: 'Sicuro di voler ritirare la tua partecipazione?'
     });
     confirmPopup.then(function(res) {
       if(!res) {
          return;
       }
        
      $ionicLoading.show({
        template: 'Caricamento in corso...'
      });
      $scope.api('partecipazione:ritirati', {id:partid}, function(x) {
        $scope.carica();
      });

      if(typeof analytics !== "undefined") { analytics.trackEvent('Partecipazione', 'Ritirata'); }


     });

  };

  $scope.carica();

})

.controller('MailCtrl', function($scope, $timeout, $stateParams, $ionicLoading) {

  if(typeof analytics !== "undefined") { analytics.trackView("Posta in " + $stateParams.direzione); }

  $scope.loginRequired();
  $scope.viewing = $stateParams.direzione;

  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.messages.list = [];

  $scope.pages = {
    loading:    false,
    perPage:    10,
    lastPage:   0,
    totalPages: false
  };

  $scope.init = function() {
    $scope.messages.list = [];
    $scope.pages.lastPage = 0;
    $scope.pages.totalPages = false;
  };

  $scope.loadMessages = function() {
    if ( $scope.pages.loading ) {
      return;
    }
    $scope.pages.loading = true;
    $scope.api('posta:cerca', {
      direzione: $scope.viewing,
      perPagina: $scope.pages.perPage,
      pagina:    $scope.pages.lastPage+1
    }, function(x) {
      var offset = $scope.messages.list.length;
      $scope.pages.totalPages = x.risposta.pagine;
      $scope.pages.lastPage = $scope.pages.lastPage+1;
      $scope.messages.list = $scope.messages.list.concat(x.risposta.risultati);
      $scope.loadDetails(offset, x.risposta.risultati);
      $ionicLoading.hide();
      $scope.pages.loading = false;
      $scope.$broadcast('scroll.infiniteScrollComplete');

    });
  };

  $scope.loadDetails = function(offset, lastMessages) {
    var r = [];
    for ( i in lastMessages ) {
      if ( !lastMessages[i].mittente ) {
        r.push({metodo:"ciao"});
        continue;
      }
      r.push({
        metodo: "utente",
        parametri: { id: lastMessages[i].mittente.id, conAvatar: true }
      });
    }
    console.log($scope.messages.list);
    $scope.api('multi', {richieste:r}, function(x) {
      for (i in x.risposta.risultato) {
        var n = parseInt(i) + parseInt(offset);
        if (!$scope.messages.list[n].mittente) {
          continue;
        }
        console.log($scope.messages.list[n].mittente);
        $scope.messages.list[n].mittente = angular.extend(
          $scope.messages.list[n].mittente,
          x.risposta.risultato[i].risposta
        );
        console.log($scope.messages.list[n].mittente);
      }
    });
  }

  $scope.loadMore = function() {
    $scope.loadMessages();
    return true;
  };

  $scope.canLoad = function() {
    return (
      !$scope.pages.totalPages ||
       $scope.pages.lastPage+1 < $scope.pages.totalPages
    );
  };
})

.controller('MsgCtrl', function($scope, $stateParams) {
  if(typeof analytics !== "undefined") { analytics.trackView("Posta singolo messaggio"); }

  $scope.loginRequired();
  for ( i in $scope.messages.list ) {
    if ( $scope.messages.list[i].id == $stateParams.msgid ) {
      $scope.msg = $scope.messages.list[i];
    }
  }
  console.log($stateParams);


})

.controller('ActivitiesCtrl', function($scope, $location, $stateParams, $ionicLoading) {
  if(typeof analytics !== "undefined") { analytics.trackView("Calendario attivita"); }

  $scope.loginRequired();

  var day = $stateParams.day ? $stateParams.day : (new Date()).toString();

  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });
    
  if(typeof analytics !== "undefined") { analytics.trackEvent('Calendario', 'Caricato giorno'); }


  var day = new Date(day);
  var prev = new Date(day);
      prev.setDate(prev.getDate()-1);
  var succ = new Date(day);
      succ.setDate(succ.getDate()+1);
  $scope.day        = day;
  $scope.prev       = prev;
  $scope.succ       = succ;   

  $scope.activities = {
    list:   []
  };

  $scope.api('attivita', {
    inizio: day,
    fine:   succ,
  }, function(x) {

    $scope.activities.list = x.risposta.turni;
        $ionicLoading.hide();

  })


})

.controller('ActivityCtrl', function($scope, $stateParams, $ionicLoading, $location, $ionicPopup) {
  if(typeof analytics !== "undefined") { analytics.trackView("Attivita singola"); }

  $scope.loginRequired();

  $scope.showPast = {
    value: false
  };

  $scope.carica = function() {
    $ionicLoading.show({
      template: 'Caricamento in corso...'
    });
    $scope.api('attivita:dettagli', {
      id: $stateParams.activityId
    }, function(x) {
      $ionicLoading.hide();
      $scope.activity = x.risposta;

    });  
  };

  $scope.partecipa = function(turnoid) {

   var confirmPopup = $ionicPopup.confirm({
     title: 'Richiedi partecipazione',
     template: 'Vuoi chiedere di poter partecipare a questo turno?'
   });
   confirmPopup.then(function(res) {
     if(!res) {
        return;
     }

      $ionicLoading.show({
        template: 'Caricamento in corso...'
      });
      $scope.api('turno:partecipa', {id:turnoid}, function(x) {
        $ionicLoading.hide();
        $scope.carica();
        $location.path('/app/myactivities');
      });

      if(typeof analytics !== "undefined") { analytics.trackEvent('Partecipazione', 'Richiesta'); }

    });
  }

  $scope.carica();

});
