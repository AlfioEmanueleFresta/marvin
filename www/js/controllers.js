var DEBUG = true;



angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $location, $timeout, $ionicLoading, $ionicSideMenuDelegate) {
  // Form data for the login modal

  $scope.base = 'https://gaia.cri.it/api.php?';
  $scope.key = 'bb2c08ff4da11f0b590a7ae884412e2bfd8ac28a';

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
      } else {
        $scope.session.valid = true;
        $scope.session.user  = x.sessione.utente;
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

  $scope.loginRequired();
  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });

  $scope.applicazioni = {
      "10"    :  "Attività",
      "30"   :  "Autoparco",
      "40"  :  "Presidente",
      "50"   :  "Obiettivo strategico",
      "60"          :  "Centrale Operativa",
      "70"        :  "Ufficio Soci",
      "80"     :  "Ufficio Patenti",
      "90"  :  "Resp. Formazione"
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

.controller('MyActivitiesCtrl', function($scope, $ionicLoading) {

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

    if ( !window.confirm('Sei sicuro di voler ritirare la tua partecipazione?') ) {
      return;
    }

    $ionicLoading.show({
      template: 'Caricamento in corso...'
    });
    $scope.api('partecipazione:ritirati', {id:partid}, function(x) {
      $scope.carica();
    });

  };

  $scope.carica();

})

.controller('MailCtrl', function($scope, $timeout, $stateParams, $ionicLoading) {

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

  $scope.loginRequired();
  for ( i in $scope.messages.list ) {
    if ( $scope.messages.list[i]._id.$id == $stateParams.msgid ) {
      $scope.msg = $scope.messages.list[i];
    }
  }
  console.log($stateParams);


})

.controller('ActivitiesCtrl', function($scope, $location, $stateParams, $ionicLoading) {

  $scope.loginRequired();

  var day = $stateParams.day ? $stateParams.day : (new Date()).toString();

  $ionicLoading.show({
    template: 'Caricamento in corso...'
  });


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

.controller('ActivityCtrl', function($scope, $stateParams, $ionicLoading, $location) {
  
  $scope.loginRequired();

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
    if ( !window.confirm("Sicuro di voler partecipare?") ) {
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
  }
  $scope.carica();

});
