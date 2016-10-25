var server = ""; //Se indica la ip del servidor.
var fechaAsistenciario = '2016_4_19'; //Fecha actual del asistenciario.
var deviceType; //Indica que tipo de sistema operativo utiliza el dispositivo
var pictureSource; //Origen de donde se obtienen las imágenes (en este caso camara)
var destinationType; //Destino de donde se obtienen las imágenes (en este caso camara)
var asistenciarioData; //Deprecated
var mapaAlumnosPics = {}; //Dado un id de alumno, indica que foto tiene como miniatura
var asistenciario = {}; //Variable que representa el asistenciario en su totalidad. Cada item tiene fichadiaria y estado.
var fichadiariaElegida; //Ficha diaria que ha sido recientemente elegida por el usuario.

var app = {
    initialize: function() {
        this.bindEvents(); 
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) { 
        deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) ==  "BlackBerry" ? "BlackBerry" : "null";
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
        server = host;
        loadClases();
    } 
}; 


function generarAsistenciario(){
    var d = new Date();
   fechaAsistenciario = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDate(); 
   $("#reiniciarBt").css("display", "block");
   $("#alumnosPanelTitle").css("display", "block");
   $("#ausentesPanelTitle").css("display", "block");
   $("#retiradosPanelTitle").css("display", "block");  
    $.getJSON( server+"/alumnosDeClase/"+$("#clasesList").val(), function( dataAlumno ) {
    //Pido todos los alumnos de la clase elegida. Voy a generar mapaAlumnosPic.    
        for (i = 0; i < dataAlumno.length; i++){
            console.log(dataAlumno[i]);
            var pic = dataAlumno[i].pic;
            if (pic != null){
                    mapaAlumnosPics[dataAlumno[i]._id] = server+"/miniaturas/"+pic.nombreArchivo;
            }
            else{
                mapaAlumnosPics[dataAlumno[i]._id] = server+"/miniaturas/default.jpg";
            }
        }
       $.getJSON( server+"/getAsistenciario/"+$("#clasesList").val()+"/"+fechaAsistenciario, function( data ) {
            if (data.length > 0){
            //Existe el asistenciario para ese día.                
                $.each( data, function( key, val ) {
                 //Itero por cada ficha diaria para ir cargando el asistenciario.   
                    var asistenciarioItem = new Object();
                    asistenciarioItem.fichadiaria = val;
                    if(val.entrada != null){ 
                        //Tiene marcada la entrada.
                        if (val.salida == null){
                            asistenciarioItem['estado'] = "En clase";
                        }
                        else{
                            asistenciarioItem['estado'] = "Retirado";
                        }
                    }
                    else{
                        asistenciarioItem['estado'] = "Ausente";
                    }
                    asistenciario[val._id] = asistenciarioItem;
                    cargarItemEnPantalla(asistenciarioItem);
                });   
            }
            else{
                $.post(server+"/crearAsistenciario/"+$("#clasesList").val(), function(result){
                    //Si se pudo crear el asistenciario.
                    if (result == "OK"){
                        //Pido el asistenciario recién creado.
                        $.getJSON( server+"/getAsistenciario/"+$("#clasesList").val()+"/"+fechaAsistenciario, function( data ) {
                            $.each( data, function( key, val ) {
                    
                                var asistenciarioItem = new Object();
                                asistenciarioItem.fichadiaria = val;
                                if(val.entrada != null){ 
                                    //Tiene marcada la entrada.
                                    if (val.salida == null){
                                        asistenciarioItem['estado'] = "En clase";
                                    }
                                    else{
                                        asistenciarioItem['estado'] = "Retirado";
                                    }
                                }
                                else{
                                    asistenciarioItem['estado'] = "Ausente";
                                }
                                asistenciario[val._id] = asistenciarioItem;
                                cargarItemEnPantalla(asistenciarioItem);
                            }); 
                        });
                    }
                });                

            }
       });
       $.each($("#clasesList").children(), function(key, val){
                if ($(val).val() == $("#clasesList").val()){
                    claseName = $(val).html();
                }
       });
        $("#initOptions").css("display", "none");
        $("#claseActualName").html("<h3>"+claseName+"</h3>");
        $("#claseActualName").css("display", "block");  
    }); 

}

function cargarItemEnPantalla(item){
    var idFD = item.fichadiaria._id;
    var nombreAlumno = item.fichadiaria.alumno.nombres+" "+item.fichadiaria.alumno.apellidos;
    var idAl = item.fichadiaria.alumno.idAlumno;
    var htmlAlumnos;
    if(item["estado"] == "Ausente"){
        htmlAlumnos = "<li class='alumnosAusentesBt' id='"+item.fichadiaria._id+"' ><a type='submit' onclick='actionHandler(\""+item.fichadiaria._id+"\");'>";
        htmlAlumnos += nombreAlumno;
        htmlAlumnos += "<img src='"+mapaAlumnosPics[idAl]+"' style='width:75%; display: block; max-width: 100%; margin-left: auto; margin-right: auto; height: auto;'/>"; 
        htmlAlumnos += "</a></li>";
        $("#ausentesPanel").append(htmlAlumnos);
        $("#ausentesPanelTitle").css("display", "block");
    } 
    else if (item["estado"] == "En clase"){
        htmlAlumnos = "<div class='alumnosEnclaseBt' id='"+item.fichadiaria._id+"'><a data-role=\"button\" data-rel=\"dialog\" type='submit' onclick='actionHandler(\""+item.fichadiaria._id+"\");'>";
        htmlAlumnos += nombreAlumno;
        htmlAlumnos += "<img src='"+mapaAlumnosPics[idAl]+"' style='width:75%; display: block; max-width: 100%; margin-left: auto; margin-right: auto; height: auto;'/>"; 
        htmlAlumnos += "</a></div>";
        $("#alumnosPanel").append(htmlAlumnos); 
        $("#alumnosPanelTitle").css("display", "block");
    }
    else if (item["estado"] == "Retirado"){ 
        htmlAlumnos = "<div class='alumnosRetiradosBt' id='"+item.fichadiaria._id+"'><a data-role=\"button\" data-rel=\"dialog\" type='submit' onclick='actionHandler(\""+item.fichadiaria._id+"\");'>";
        htmlAlumnos += nombreAlumno;
        htmlAlumnos += "<img src='"+mapaAlumnosPics[idAl]+"' style='width:75%; display: block; max-width: 100%; margin-left: auto; margin-right: auto; height: auto;'/>"; 
        htmlAlumnos += "</a></div>";
        $("#retiradosPanel").append(htmlAlumnos);        
    }
}

//Descripción: Realiza el manejo del evento de presionar sobre los item que representan a los alumnos.
//Parámetro de entrada - item : Id de la ficha diaria asociada a ese alumno.
function actionHandler(item){
    var itemKey = ""+item+"";
    var ficha = asistenciario[itemKey];
    var jquerySelector = "#"+item;
    var nombreAlumno = ""+ficha.fichadiaria.alumno.nombres+" "+ficha.fichadiaria.alumno.apellidos;
    console.log(ficha['estado']);
    if (ficha['estado'] == "Ausente"){
        $(jquerySelector).attr("href", "");
        $(jquerySelector).addClass("alumnosEnclaseBt").removeClass("alumnosAusentesBt");
        $("#alumnosPanel").append($(jquerySelector));
        asistenciario[itemKey].estado = "En clase";
        $.post(server+"/marcarEntrada/"+item, function(result){
                       
        }).fail(function(jqXHR, textStatus, errorThrown) {
                      desplegarError(jqXHR, textStatus, errorThrown, "marcarEntrada"); 
        });  
    }
    else if (ficha['estado'] == "En clase"){
        fichadiariaElegida = ficha; 
        $("#defaultpanel").panel("open");
        $("#alumnoIndividualNombre").html(nombreAlumno);
        $("#sucesosPanel").html("");
        $("#sucesosAlumnoButtons").css("display", "block");         

    }
    else if (ficha['estado'] == "Retirado"){
        fichadiariaElegida = ficha;
        $("#alumnoIndividualPanel").attr("idAlumno", ficha.fichadiaria._id);
        fichaDiariaAlumno();
    }
}

//Descripción: Genera un mapa donde asocia el Id de un alumno a la ruta de su imagen (pic).
//Parámetro de entrada: No tiene. 
function crearMapaAlumnosPics(){
    $.getJSON( server+"/alumnosDeClase/"+$("#clasesList").val(), function( data ) {
        $.each( data, function( key, val ) {
            var pic = val.pic;
            console.log(val.pic);
            if (pic != null){
                mapaAlumnosPics[val._id] = val.url+"/"+val.nombreArchivo;
            }
            
        });
    });
}

function desmarcarEntrada(){ 
    var jquerySelector = "#"+fichadiariaElegida.fichadiaria._id;
    var ficha = asistenciario[fichadiariaElegida.fichadiaria._id];
    $.post(server+"/desmarcarEntrada/"+fichadiariaElegida.fichadiaria._id, function(result){
        $("#ausentesPanel").append($(jquerySelector));
        $(jquerySelector).addClass("alumnosAusentesBt").removeClass("alumnosEnclaseBt");
        asistenciario[fichadiariaElegida.fichadiaria._id].estado = "Ausente"; 
    });

}
 
function marcarSalida(){
    var jquerySelector = "#"+fichadiariaElegida.fichadiaria._id;
    var ficha = asistenciario[fichadiariaElegida.fichadiaria._id];
    $.post(server+"/marcarSalida/"+fichadiariaElegida.fichadiaria._id, function(result){
        $(jquerySelector).addClass("alumnosRetiradosBt").removeClass("alumnosEnclaseBt");
        $("#retiradosPanel").append($(jquerySelector));
        asistenciario[fichadiariaElegida.fichadiaria._id].estado = "Retirado";
    });    
}

function desmarcarSalida(){ 
    var jquerySelector = "#"+fichadiariaElegida.fichadiaria._id;
    var ficha = asistenciario[fichadiariaElegida.fichadiaria._id];
    $.post(server+"/desmarcarSalida/"+fichadiariaElegida.fichadiaria._id, function(result){
        $(jquerySelector).addClass("alumnosEnclaseBt").removeClass("alumnosRetiradosBt");
        $("#alumnosPanel").append($(jquerySelector));
        asistenciario[fichadiariaElegida.fichadiaria._id].estado = "En clase";
    });    
}


 
function loadClases(){
//Corrobora que el dispositivo desde el cual se está ejecutando la aplicación esté registrado
//como asistenciario. En caso de estarlo, despliega las clases para las cuales está habilitado 
//en una lista, para que el usuario seleccione con cual desea trabajar.
//En caso de no estar registrado aún, redirecciona a la página que ofrece enviar una solicitud
//a la direccion del Colegio, para que habiliten el nuevo dispositivo como asistenciario.
    $.getJSON( server + "/clasesAsistenciario/" + device.uuid, function( data ) {

        if(data == 1) {
            $(':mobile-pagecontainer').pagecontainer('change', '#solicitudEnviadaPage', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
            });
        } else {
            var clasesListHTML = ""; 
            $.each( data, function( key, val ) {

                clasesListHTML += "<option  value='"+val._id+"'>"+val.nombre+"</option>";
            }); 
            $("#clasesList").html(clasesListHTML);
            $("#clasesList").selectmenu("refresh");
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {

        $(':mobile-pagecontainer').pagecontainer('change', '#loginPage', {
            transition: 'flip',
            changeHash: false,
            reverse: true,
            showLoadMsg: true
        });
    });
}


function enviarSolicitudAsistenciario() {
    //Envía una solicitud a la direccion de la Institucion para que habiliten el dispositivo
    //como un asistenciario, y se pueda acceder a la aplicacion de ahí en más.
    var error = false;
    var nota = $("#nota").val();

    if (nota == '' || nota == null){
        $("#notaerror").val("Debe ingresar un mensaje.");
        error = true;
    }
    if (!error){ 

        var dataSend = {"nota" : nota};

        $.post(server+"/solicitarAsistenciario/" + device.uuid, dataSend, 'json').done(function( data ) {

        $(':mobile-pagecontainer').pagecontainer('change', '#solicitudEnviadaPage', {
            transition: 'flip',
            changeHash: false,
            reverse: true,
            showLoadMsg: true 
        });
                
        }).fail(function(jqXHR, textStatus, errorThrown) {

            var errorHtml = "<p>No ha sido posible conectarse con el servidor</p>";

            if(jqXHR.responseText) { // Si no es vacio, null, undefined, 0 o false.
                var errorHtml = "<p>Ha ocurrido un error en el servidor: "+jqXHR.responseText+"</p>";
            }
            errorHtml += "<p>Intente nuevamente luego</p>";
            $("#errorSolicitudMsg").html(errorHtml);
        });
    }
}


function panhales(){
    $("#sucesosPanel").html("");
    var f = "<h3>Pañales</h3><form>";   
    f += "<label for='panhales-orino'>Orinó</label>";
    f += "<select name=\"panhales-orino\" id=\"panhales-orino\" >";
    f += "<option  value='Si'>Si</option>";
    f += "<option  value='No'>No</option>";    
    f += "</select>";  
    f += "<label for='panhales-evacuo'>Evacuó</label>";
    f += "<select name=\"panhales-evacuo\" id=\"panhales-evacuo\" >";     
    f += "<option  value='Si'>Si</option>";
    f += "<option  value='No'>No</option>"; 
    f += "</select>";
    f += "</form>";
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarButtons2\">";
    f +=  "<ul><li><button id=\"panhalesSend\" onclick=\"enviarPanhales();\">Enviar</button></li>";
    
    f += "<li><button id=\"panhalesCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";
    $("#sucesosPanel").html(f);
    $('#navBarButtons2').navbar();
    $('#panhales-orino').selectmenu();
    $('#panhales-evacuo').selectmenu();
    $("#sucesosAlumnoButtons").css("display", "none");  

}

function enviarPanhales(){
    var registroPanhales = [];
    var dataSend = {};
    var d = new Date();
    var hora = d.getHours();
    var minutos = d.getMinutes();
    if (minutos < 10){
        minutos = "0"+minutos;
    }
    var tiempo = hora+":"+minutos;
    if (fichadiariaElegida.fichadiaria.panhales == null){
    //No hay registro previo de pañales.
        registroPanhales.push({"orino" : $("#panhales-orino").val(), "evacuo" : $("#panhales-evacuo").val(), "hora" : tiempo});
        registroPanhales = JSON.stringify(registroPanhales);
        dataSend = {"veces" : "1", "orino" : $("#panhales-orino").val(), "evacuo" : $("#panhales-evacuo").val(), "registro" : registroPanhales};
        fichadiariaElegida.fichadiaria.panhales = JSON.stringify(dataSend); 
    }
    else{ 
        var panhalesVar = JSON.parse(fichadiariaElegida.fichadiaria.panhales);
        console.log(panhalesVar);
        var veces = parseInt(panhalesVar.veces) + 1;
        var orino = panhalesVar.orino; 
        var evacuo = panhalesVar.evacuo;
        console.log(veces);
        veces = veces.toString();
        if ($("#panhales-orino").val() == "Si"){
            orino = "Si";
        }
        if ($("#panhales-evacuo").val() == "Si"){
            evacuo = "Si";
        }
        var registroArray = JSON.parse(panhalesVar.registro);
        registroArray.push({"orino" : $("#panhales-orino").val(), "evacuo" : $("#panhales-evacuo").val(), "hora" : tiempo});
        registroPanhales = JSON.stringify(registroArray);
        dataSend = {"veces" : veces, "orino" : orino, "evacuo" : evacuo, "registro" : registroPanhales};

    }
    var url = server+"/agregarSuceso/panhales/"+fichadiariaElegida.fichadiaria._id;
    $.post(url, dataSend, 'json').done(function( data ) {
        cancelarSuceso();
    });   
} 

function mamaderas(){
    $("#sucesosPanel").html("");
    var f = "<h3>Mamaderas</h3><form>";
    f += "<label for='mamaderas-mililitros'>Mililitros</label>";
    f += "<input type=\"number\" name=\"mamaderas-mililitros\" id=\"mamaderas-mililitros\" value=\"50\" min=\"0\" max=\"500\">";
    f += "<p id='mamaderas-mililitros-error' style='display:none; color: red;'>Debe ingresar un valor.</p>";        
    f += "</form>";
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarMamaderas\">";
    f +=  "<ul><li><button id=\"mamaderasSend\" onclick=\"enviarMamaderas();\">Enviar</button></li>";
    f += "<li><button id=\"mamaderasCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";      
    $("#sucesosPanel").html(f);
    $('#mamaderas-mililitros').slider();  
    $('#navBarMamaderas').navbar();    
    $("#sucesosAlumnoButtons").css("display", "none");
}

function enviarMamaderas(){
    $("#mamaderas-mililitros-error").css("display", "none");
    $("#mamaderas-tomas-error").css("display", "none");
    var registroMamaderas = [];
    var dataSend = {};
    var d = new Date();
    var hora = d.getHours();
    var minutos = d.getMinutes();
    if (minutos < 10){
        minutos = "0"+minutos;
    } 
    var tiempo = hora+":"+minutos;
    if($("#mamaderas-mililitros").val() != ""){
        console.log(fichadiariaElegida.fichadiaria.mamaderas);
        if (fichadiariaElegida.fichadiaria.mamaderas == null){
            registroMamaderas.push({"mililitros" : $("#mamaderas-mililitros").val(), "hora" : tiempo});
            registroMamaderas = JSON.stringify(registroMamaderas);
            dataSend = {"tomas" : "1", "mililitros" : $("#mamaderas-mililitros").val(), "registro" : registroMamaderas};
            fichadiariaElegida.fichadiaria.mamaderas = JSON.stringify(dataSend);         
        }
        else{
            var mamaderasVar = JSON.parse(fichadiariaElegida.fichadiaria.mamaderas);
            var tomas = parseInt(mamaderasVar.tomas) + 1;
            tomas = tomas.toString();
            var mililitros = parseInt(mamaderasVar.mililitros) + parseInt($("#mamaderas-mililitros").val());
            mililitros = mililitros.toString();
            var registroArray = JSON.parse(mamaderasVar.registro);
            registroArray.push({"mililitros" : $("#mamaderas-mililitros").val(), "hora" : tiempo});
            registroMamaderas = JSON.stringify(registroArray);
            dataSend = {"tomas" : tomas, "mililitros" : mililitros, "registro" : registroMamaderas};
            fichadiariaElegida.fichadiaria.mamaderas = JSON.stringify(dataSend);

        }
        var url = server+"/agregarSuceso/mamaderas/"+fichadiariaElegida.fichadiaria._id;
        $.post(url, dataSend, 'json').done(function( data ) {
            cancelarSuceso();
        });   
    }
    else{
            if($("#mamaderas-mililitros").val() == ""){
                $("#mamaderas-mililitros-error").css("display", "block"); 
            }
    }    

} 
 
function almuerzo(){
    $("#sucesosPanel").html("");
    var f = "<h3>Almuerzo</h3><form>";   
    f += "<label for='almuerzo-select'>Comportamiento</label>";
    f += "<select name=\"almuerzo-select\" id=\"almuerzo-select\" >";
    f += "<option  value='Comió todo'>Comió todo</option>"; //FALTAN TILDES
    f += "<option  value='Dejo algo'>Dejó algo</option>"; //FALTAN TILDES 
    f += "<option  value='No comio'>No comió</option>"; //FALTAN TILDES    
    f += "</select>";   
    f += "</div></form>";
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarAlmuerzo\">";
    f +=  "<ul><li><button id=\"almuerzoSend\" onclick=\"enviarAlmuerzo();\">Enviar</button></li>";
    f += "<li><button id=\"almuerzoCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    $("#sucesosPanel").html(f);       
    $("#sucesosAlumnoButtons").css("display", "none");
    $('#navBarAlmuerzo').navbar();       
    $('#almuerzo-select').selectmenu();    
    


}

function enviarAlmuerzo(){
    var dataSend = {"comportamiento" : encodeURIComponent($("#almuerzo-select").val())};
    //console.log($("#alumnoIndividualPanel").attr("idAlumno"));
    var url = server+"/agregarSuceso/almuerzo/"+fichadiariaElegida.fichadiaria._id;
    $.post(url, dataSend, 'json').done(function( data ) {
        cancelarSuceso();
    });   
} 


function postre(){
    $("#sucesosPanel").html("");
    var f = "<h3>Postre</h3><form>";
    f += "<label for='postre-select'>Comportamiento</label>";
    f += "<select name=\"postre-select\" id=\"postre-select\" >";
    f += "<option  value='Comio todo'>Comió todo</option>"; //FALTAN TILDES
    f += "<option  value='Dejo algo'>Dejó algo</option>"; //FALTAN TILDES 
    f += "<option  value='No comio'>No comió</option>"; //FALTAN TILDES    
    f += "</select></form>";
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarPostre\">";
    f +=  "<ul><li><button id=\"postreSend\" onclick=\"enviarPostre();\">Enviar</button></li>";
    f += "<li><button id=\"postreCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";         
    $("#sucesosAlumnoButtons").css("display", "none");
    $("#sucesosPanel").html(f);
    $('#navBarPostre').navbar();        
    $('#postre-select').selectmenu();      
}
function enviarPostre(){
    var dataSend = {"comportamiento" : encodeURIComponent($("#postre-select").val())};
    //console.log($("#alumnoIndividualPanel").attr("idAlumno"));
    var url = server+"/agregarSuceso/postre/"+fichadiariaElegida.fichadiaria._id;
    $.post(url, dataSend, 'json').done(function( data ) {
        cancelarSuceso();
    });   
} 

function merienda(){
    $("#sucesosPanel").html("");
    var f = "<h3>Merienda</h3><form>";
    f += "<label for='merienda-select'>Comportamiento</label>";
    f += "<select name=\"merienda-select\" id=\"merienda-select\" >";
    f += "<option  value='Comio todo'>Comió todo</option>"; //FALTAN TILDES
    f += "<option  value='Dejo algo'>Dejó algo</option>"; //FALTAN TILDES 
    f += "<option  value='No comio'>No comió</option>"; //FALTAN TILDES    
    f += "</select></form>";
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarMerienda\">";
    f +=  "<ul><li><button id=\"meriendaSend\" onclick=\"enviarMerienda();\">Enviar</button></li>";
    f += "<li><button id=\"meriendaCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";          
    $("#sucesosAlumnoButtons").css("display", "none");
    $("#sucesosPanel").html(f);
    $('#navBarMerienda').navbar();        
    $('#merienda-select').selectmenu();    
}
function enviarMerienda(){
    console.log('ln 316');
    var dataSend = {"comportamiento" : encodeURIComponent($("#merienda-select").val())};
    //console.log($("#alumnoIndividualPanel").attr("idAlumno"));

    var url = server+"/agregarSuceso/merienda/"+fichadiariaElegida.fichadiaria._id;
    $.post(url, dataSend, 'json').done(function( data ) {
        cancelarSuceso();
    });   
} 


function notas(){
    $("#sucesosPanel").html("");
    var f = "<h3>Nota</h3><form>";
    f += "<label for='textarea-nota'>Ingresar texto</label>";
    f += "<textarea name='textarea-nota' id='textarea-nota'></textarea></form>";
    f += "<p id='textarea-nota-error' style='display:none; color: red;'>Debe ingresar un texto.</p>";  
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarNotas\">";
    f +=  "<ul><li><button id=\"notasSend\" onclick=\"enviarNota();\">Enviar</button></li>";
    f += "<li><button id=\"notasCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";         
    $("#sucesosAlumnoButtons").css("display", "none");  
    $("#sucesosPanel").html(f);
    $('#textarea-nota').textinput();  
    $('#navBarNotas').navbar();    
}

function enviarNota(){
    $("#textarea-nota-error").css("display", "none");
    if ($("#textarea-nota").val() != ""){
        var dataSend = {"nota" : encodeURIComponent($("#textarea-nota").val())};
        var url = server+"/agregarNota/"+fichadiariaElegida.fichadiaria._id;
        $.post(url, dataSend, 'json').done(function( data ) {
            cancelarSuceso();
        });   
    }
    else{
        $("#textarea-nota-error").css("display", "block");
    }
} 

function siesta(){
    $("#sucesosPanel").html("");
    var f = "<h3>Siesta</h3><form>";
    f += "<label for='siesta-select'>Tiempo de sueño</label>";
    f += "<input type=\"number\" name=\"siesta-select\" id=\"siesta-select\" value=\"10\" min=\"0\" max=\"60\">";    
    f += "</form>"; 
    f += "<hr />";
    f +=  "<div data-role=\"navbar\" id=\"navBarSiesta\">";
    f +=  "<ul><li><button id=\"siestaSend\" onclick=\"enviarSiesta();\">Enviar</button></li>";
    f += "<li><button id=\"siestaCancel\" onclick=\"cancelarSuceso();\">Cancelar</button></li></ul>";
    f += "</div>";         
    $("#sucesosAlumnoButtons").css("display", "none");
    $("#sucesosPanel").html(f);
    $('#navBarSiesta').navbar();        
    $('#siesta-select').slider();      
}

function enviarSiesta(){
    var dataSend = {"minutos" : encodeURIComponent($("#siesta-select").val())};
    var url = server+"/agregarSuceso/siesta/"+fichadiariaElegida.fichadiaria._id;
    $.post(url, dataSend, 'json').done(function( data ) {
        cancelarSuceso();
    });   
}

function cancelarSuceso(){
    $("#sucesosPanel").html("");
    $("#sucesosAlumnoButtons").css("display", "block"); 
}

function reiniciarAsistenciario(){
    //Esta función permite inicializar el asistenciario
    //con otra clase.
    $("#alumnoIndividualPanel").attr("idAlumno", "");
    cancelarSuceso();
    $("#initOptions").css("display", "block");
    $("#claseActualName").css("display", "none");
    $("#claseActualName").html("");
    $("#reiniciarBt").css("display", "none");
    $("#alumnosPanelTitle").css("display", "none");
    $("#retiradosPanelTitle").css("display", "none");
    $("#ausentesPanelTitle").css("display", "none");
    
    $("#retiradosPanel").html("");
    $("#ausentesPanel").html("");
    $("#alumnosPanel").html("");  
    loadClases();
}

function fichaDiariaAlumno(){
    var fichaDiariaId = fichadiariaElegida.fichadiaria._id;
    cancelarSuceso();
    $( "#fichaDiariaPanel" ).html("");
    $.getJSON( server+"/fichadiaria/"+fichaDiariaId, function( data ) {
        var htmlFichaDiaria = "";
         htmlFichaDiaria += "<h3 id='fichaDiariaPanelNombre' style=\"color: orange\">"+data.alumno.nombres+" "+data.alumno.apellidos+"</h3>";
         $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         htmlFichaDiaria = "";
         if (data.panhales != null){
            var pan = JSON.parse(data.panhales);
            htmlFichaDiaria = "<label style=\"color : #48a4ff\" for=\"panhalesTabla\">Pañales</label>";
            htmlFichaDiaria += "<table data-role=\"table\" id=\"panhalesTabla\"><thead><tr><th>Hora</th><th>Orinó</th><th>Evacuó</th></tr></thead>";
            var registroArray = JSON.parse(pan.registro);
            for (i = 0; i < registroArray.length; i++){
                htmlFichaDiaria += "<tbody><tr><td>"+registroArray[i].hora+"</td><td>"+registroArray[i].orino+"</td><td>"+registroArray[i].evacuo+"</td></tr></tbody>";
            }
            htmlFichaDiaria += "</table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"panhales\")'></a>";
            htmlFichaDiaria += "<hr />";
            $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
             //$("#panhalesTabla").table("rebuild");
         }
        if (data.mamaderas != null){
            var mam = JSON.parse(data.mamaderas);
            htmlFichaDiaria = "<label style=\"color : #48a4ff\" for=\"mamaderasTabla\">Mamaderas</label>";
            htmlFichaDiaria += "<table data-role=\"table\" id=\"mamaderasTabla\">";
            htmlFichaDiaria += "<thead><tr><th>Hora</th><th>Mililitros</th></tr></thead>";
            var registroArray = JSON.parse(mam.registro);
            for (i = 0; i < registroArray.length; i++){
                htmlFichaDiaria += "<tbody><tr><td>"+registroArray[i].hora+"</td><td>"+registroArray[i].mililitros+"</td></tr></tbody>";
            }  
            htmlFichaDiaria += "</table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"mamaderas\")'></a>";
            htmlFichaDiaria += "<hr />";          
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }
         if (data.almuerzo != null){
            var alm = JSON.parse(data.almuerzo); 
            htmlFichaDiaria = "<table data-role=\"table\" id=\"almuerzoTabla\"><tr><td>Almuerzo</td>";
            htmlFichaDiaria += "<td style=\"color: orange\">"+alm.comportamiento+"</td></tr></table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"almuerzo\")'></a>";
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }     
         if (data.postre != null){
            var alm = JSON.parse(data.postre);
            htmlFichaDiaria = "<table data-role=\"table\" id=\"postreTabla\"><tr><td>Postre</td>";
            htmlFichaDiaria += "<td style=\"color: orange\">"+alm.comportamiento+"</td></tr></table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"postre\")'></a>";
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }  
         if (data.merienda != null){
            var alm = JSON.parse(data.merienda);
            htmlFichaDiaria = "<table data-role=\"table\" id=\"meriendaTabla\"><tr><td>Merienda</td>";
            htmlFichaDiaria += "<td style=\"color: orange\">"+alm.comportamiento+"</td></tr></table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"merienda\")'></a>";
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }   
         if (data.siesta != null){
            var sis = JSON.parse(data.siesta);
            htmlFichaDiaria = "<table data-role=\"table\" id=\"siestaTabla\"><tr><td>Siesta</td>";
            htmlFichaDiaria += "<td style=\"color: orange\">"+sis.minutos+" minutos</td></tr></table>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"siesta\")'></a>";
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }          
         if (data.nota != null){
            htmlFichaDiaria = "<hr /><label style=\"color : #48a4ff\">Nota</label>";
            htmlFichaDiaria += "<p id=\"notaOutput\">"+data.nota+"</p>";
            htmlFichaDiaria += "<a href='#' style='display: none' class='btEdit ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext' onclick='borrarSuceso(\"nota\")'></a>";
             $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
         }     
         if (data.entrada != null){
            try{
                var d = new Date(data.entrada);
                var minutes = d.getMinutes();
                if (minutes < 10){
                    minutes = "0"+minutes;
                }
                htmlFichaDiaria = "<hr /><label style=\"color : #48a4ff\">Entrada: "+d.getHours()+":"+minutes+"</label>";
                $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
            }
            catch(e){
                console.log("Fallo en la fecha.");
            }
         } 
         if (data.salida != null){
            try{
                var d = new Date(data.salida);
                var minutes = d.getMinutes();
                if (minutes < 10){
                    minutes = "0"+minutes;
                }
                htmlFichaDiaria = "<hr /><label style=\"color : #48a4ff\">Salida: "+d.getHours()+":"+minutes+"</label>";
                htmlFichaDiaria += "<a href='#asistenciarioMain' onclick='desmarcarSalida()' class='ui-btn' data-mini='true' data-inline='true'>No se fue</a>";
                $( "#fichaDiariaPanel" ).append(htmlFichaDiaria);
            }
            catch(e){
                console.log("Fallo en la fecha."); 
            }            
         }                          
    });
    $(".tableLblSty").css("color", "red");
   // $( "#fichaDiariaPanel" ).panel( "open" );
    $(':mobile-pagecontainer').pagecontainer('change', '#fichaDiariaPage', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
            });
}
function editarFichaDiaria(){
    $(".btEdit").css("display", "block");
}
function borrarSuceso(sucesoParaBorrar){
    console.log(sucesoParaBorrar);
    var url = server+"/desmarcarSuceso/"+sucesoParaBorrar+"/"+fichadiariaElegida.fichadiaria._id;
    console.log(url);
    $.post(url, function(result){
        cancelarSuceso();
        delete fichadiariaElegida.fichadiaria[sucesoParaBorrar];
        $(':mobile-pagecontainer').pagecontainer('change', '#asistenciarioMain', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
        });
    });   
}
function desplegarError(jqXHR, textStatus, errorThrown, postName) {
    var errorHtml = "<p>"+jqXHR.responseText+"</p>";
    errorHtml += "<p> Código de error: "+jqXHR.status+"</p>";
    errorHtml += "<p> Llamada: Llamada a "+postName+" luego de crear</p>";
    errorHtml += "<p>Pruebe reiniciar la aplicación luego.</p>";
    $("#errorMsg").html(errorHtml);
    console.log( "error "+jqXHR.responseText  );
}


function capturePhoto() {
//Toma la foto usando la cámara del dispotivo y la retorna como una imagen
//base64-enconded
//Si es un caso de éxito llama a onPhotoDataSuccess, en caso contrario,
//llama a onFail.
    if (deviceType == "iPhone"){
        navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, {
            quality: 30,
            targetWidth: 450,
            targetHeight: 450,
            destinationType: destinationType.FILE_URI,
            saveToPhotoAlbum: true
        });
    }
    else{
         navigator.camera.getPicture(capturePhotoSuccess, capturePhotoFail, {
            quality: 30, 
            targetWidth: 450,
            targetHeight: 450,
            destinationType: destinationType.FILE_URI,
            correctOrientation : true
        });       
    }
}

function capturePhotoSuccess(imageURI) {
//Si la toma de foto fue exitosa, se retorna esta función.
//La imagen se carga en #image.
//imageURI es el parámetro dónde obtenemos la ruta de la 
//imagen en el móvil.
    console.log(imageURI);
    
    $("#image").attr("src", imageURI);

    $(':mobile-pagecontainer').pagecontainer('change', '#imagenPage', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
            });
    
}

function capturePhotoFail(message){
    alert('Falla en la captura de la imagen. Motivo: ' + message);
}
function uploadImagen() { 
    //Descripción: Esta función es utilizada para subir las imágenes.
    //Pido el área donde está la imagen.
    //var img = $("#image");
    //console.log(img);
    //Pido el "source" de la imagen. Notar que en las funciones
    //capturePhotoSuccess y getPhotoSuccess se carga el source
    var imageURI = $("#image").attr("src");
    //Creo las opciones. Es parte de FileTransfer.
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    //Dentro de las opciones puedo agregar parámetros, los cuáles viajan 
    //en el body del post en formato json.
    var params = new Object();

    params.alumnoId =  fichadiariaElegida.fichadiaria.alumno.idAlumno;
    options.params = params;
    console.log(params);
    var ft = new FileTransfer();
    ft.upload(imageURI, server+"/subirImagenAlumno", uploadImagenSuccess, uploadImagenFail,
            options);

    var idFDQuery = "#"+fichadiariaElegida.fichadiaria._id;
    $(idFDQuery).children("a").children("img").attr("src", imageURI);
    console.log(alumnoIdFoto);

}
function uploadImagenSuccess(r){
    //Descripción: Llamado cuando uploadImagen fue exitoso.
    $("#image").attr("src", "");
}

function uploadImagenFail(message){
    alert('Falla en la subida de la imagen. Motivo: ' + message);
}

function salir() {
    navigator.app.exitApp();
}

function imprimirFichaTest(){
    console.log("@@@@@@@@@@@@");
    console.log(fichadiariaElegida.fichadiaria);
}