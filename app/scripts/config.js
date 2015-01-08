(function () {'use strict';

angular.module('config', [])

.constant('ENV', {name:'production',api:{endPoint:'https://futurventionstage.azurewebsites.net',hostedFiles:'https://ergmaimages.blob.core.windows.net/stageuserdata/',externalLogins:'https://futurventionstage.azurewebsites.net/api/Account/ExternalLogins?returnUrl=https://futurventionclient.azurewebsites.net&generateState=true'},fbApiKey:'675990215825778',liApiKey:'77xj8xhasosg9k'})

;}());