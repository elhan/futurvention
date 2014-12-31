(function () {'use strict';

angular.module('config', [])

.constant('ENV', {name:'development',api:{endPoint:'https://futurvention.azurewebsites.net',hostedFiles:'https://ergmaimages.blob.core.windows.net/userdata/',externalLogins:'https://futurvention.azurewebsites.net/api/Account/ExternalLogins?returnUrl=http://client.futurvention.com:9000&generateState=true'},fbApiKey:'676011345823665',liApiKey:'77d2smbm870t22'})

;}());