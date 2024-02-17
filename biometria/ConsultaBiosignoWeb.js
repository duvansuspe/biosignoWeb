/**
* Description of ConsultaLiquidacionProtocolista
*
* @author jorge.suspe
*/

var meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
var hoy = new Date();
var mes = meses[hoy.getMonth()];
var dd = hoy.getDate();
var mm = hoy.getMonth() + 1;
var yyyy = hoy.getFullYear();
(dd < 10) ? dd = "0" + dd : dd = dd;
(mm < 10) ? mm = "0" + mm : mm = mm;

var datos;
const GET_IMPDF = 104;
const CARGAR_ID_PERSONAS = 101;
const CONSULTAR_REGISTROS_BIOSIGNOWEB = 102;
const DESCARGAR_REGISTROS_BIOSIGNOWEB = 103;
const CARGAR_DEDOS = 105;
const CARGAR_SERVICIOS = 106;

$(document).ready(function () {
    redireccionarjQuery("../biometria/ConsultaBiosignoWeb.html");
    $("#bodyjQuery").css("display", "block");
    cargarCalendario();
    iniciarInterfaz();
    getImpPDF();
    cambiarEstadoInput();
    cargarTiposDocumentos();
    
    $.fn.selectpicker.defaults = {
        selectAllText: "Todos",
        deselectAllText: "Ninguno"
    };
    cargarDedos();
    cargarServicios();    
});

function iniciarInterfaz(){
    $("#salir").on("click", function () {
        location.href = '../../modulos/principal/menu.php';
    });

    $("#buscar").on("click", function () {
        var data = validarConsulta();
        if (data !== undefined) {
            consultarRegistrosBiosignoWeb();
        }
    });
    
    $("#idPersona").change(function(){
        mostrarCamposPersona();
    });
    
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#sidebarCollapse img').toggleClass('rotateImg');
        $("#cpOpcPDF").toggleClass('active');
        $('#content').toggleClass('active');
        if ($('#content img').hasClass("rotateImg")) {
            $("#sidebarCollapse img").attr("src", "../../iconos/TrianguloG.gif");
            $("#sidebarCollapse").attr("style", "background-color: #ccc");
        } else {
            $("#sidebarCollapse img").attr("src", "../../iconos/left.png");
            $("#sidebarCollapse").removeAttr("style");
        }
    });
}

function consultarRegistrosBiosignoWeb(){
    var parametros = {accion: CONSULTAR_REGISTROS_BIOSIGNOWEB, datos: datos};
    var miCallback = function (callbackParams, result, estado){
        if(!estado || !result.success){
            return;
        }
        crearTablaValidacionIdentidad(result.datos);
        
        if ((result.datos).length > 0) {
            $(".abrir").remove();
            if ($("#impPDF").is(':checked')) {
                $('#iPdf').append("<a class='separate abrir crearArchivoGeneral' tipo='PDF'  style='cursor:pointer;color: #213b87; font-size:11px;'>Abrir </a>");
            }
            if ($("#impCSV").is(':checked')) {
                $('#iCsv').append("<a class='separate abrir crearArchivoGeneral' tipo='CSV'  style='cursor:pointer;color: #213b87;font-size:11px;margin-right: 14px;'>Abrir </a>");
            }
        }

        $(".crearArchivoGeneral").off();
        $(".crearArchivoGeneral").on("click", function () {
            var tipo = $(this).attr("tipo");
            descargarInforme(result.datos, tipo);
        });
    };
    spinner("Cargando Registros, por favor espere...");
    utilidadesjQuery.ajax("../../modulos/biometria/ConsultaBiosignoWeb.php", parametros, miCallback, null, this);
}

function crearTablaValidacionIdentidad(datos) {
    dataTableLiquidacionprotocolista = $("#tablaValidacionIdentidad").DataTable({
        data: datos,
        ordering: false,
        processing: true,
        dom: '<"fondoGris"<"row"<"col-xs-0 col-md-1"><"col-xs-8 col-md-8 paginateTop paginateCenter"ip><"col-xs-4 col-md-3 lengthTop"l>>>tr<"fondoGrisAbajo"<"row"<"col-xs-1"><"col-xs-8 paginateTop paginateCenter"ip><"col-xs-3 col-md-3">>>',
        autoWidth: false,
        paging: true,
        rowCallback: function (row, data, posRow) {
            spinner(false);
            
        },
        drawCallback: function (settings) {
            spinner(false);
        },
        columns: [
            {
                data: 'fecharegistro', class: "text-center text-capitalize "
            },
            {
                data: 'nombrecompleto', class: "text-left text-capitalize ", render: function (data, type, full, meta){
                    return `<span class="text-left" style="font-weight: normal; ">`+data + ` <br> ` + full.document + `<br> Acepto tratamiento de datos personales` + `<br> ` + full.fechabiosignowebatdp + ` </span> `;
                }
            },
            {
                data: 'nombre', class: "text-left text-capitalize ", render: function (data, type, full, meta) {
                    let tabla = $("<table/>");
                    tabla.css({width: "100%", "font-size": "10px"});
                    tabla.addClass("table-striped table-bordered tablaInterna");

                    var x = $("<span/>");
                    x.css({width: "100%"});
                    var table = $("<table/>");
                    var tr1 = $("<tr/>");
                    var tr2 = $("<tr/>");
                    var tr3 = $("<tr/>");
                    var tr4 = $("<tr/>");
                    var tr5 = $("<tr/>");

                    var td1 = $("<td/>");
                    var td2 = $("<td/>");
                    var td3 = $("<td/>");
                    var td4 = $("<td/>");
                    var td5 = $("<td/>");
                    var td6 = $("<td/>");
                    var td7 = $("<td/>");
                    var td8 = $("<td/>");
                    var td9 = $("<td/>");
                    var td10 = $("<td/>");
                    td1.addClass("col3 pd3 wtd1");
                    td2.addClass("col3 pd3 wtd2");
                    td3.addClass("col3 pd3 wtd1");
                    td4.addClass("col3 pd3 wtd2");
                    td5.addClass("col3 pd3 wtd1");
                    td6.addClass("col3 pd3 wtd2");
                    td7.addClass("col3 pd3 wtd1");
                    td8.addClass("col3 pd3 wtd2");
                    td9.addClass("col3 pd3 wtd1");
                    td10.addClass("col3 pd3 wtd2");

                    td1.append("Id Transacción");
                    tr1.append(td1);
                    td2.append(full.transaccionid);
                    tr1.append(td2);
                    td3.append("NUT");
                    tr2.append(td3);
                    td4.append(full.nut);
                    tr2.append(td4);
                    td5.append("Información validación");
                    tr3.append(td5);
                    td6.append(full.codigoestado);
                    if(full.mensajeestado !== 'successful'){
                        td6.addClass("colorRojo");
                    }
                    tr3.append(td6);
                    td7.append("Dedo 1");
                    tr4.append(td7);
                    td8.append(full.dedo1);
                    if(full.dedo1resultadovalidacion !== 'true'){
                        td8.addClass('colorRojo');
                    }
                    tr4.append(td8);
                    td9.append("Dedo 2");
                    tr5.append(td9);
                    td10.append(full.dedo2);
                    if(full.dedo2resultadovalidacion !== 'true'){
                        td10.addClass('colorRojo');
                    }
                    tr5.append(td10);
                    table.append(tr1, tr2, tr3, tr4, tr5);
                    x.append(table);
                    return x.html();

                }                    
            },
            {
                data: 'servicio', class: "text-left text-capitalize "
            }
        ],
        destroy:true,
        language: {
            sLengthMenu: "<label style='margin:5px 5px 0 5px;font-size: 11px !important;'>Ver</label>" + '<select style="width:45px;height: 25px;">' +
                        '<option value="10">10</option>' +
                        '<option value="20">20</option>' +
                        '<option value="50">50</option>' +
                        '</select>',
                sZeroRecord: "No se encontraron resultados",
                sEmptyTable: "No se encontraron registros",
                sInfo: "_TOTAL_ registros encontrados",
                sInfoEmpty: "No se encontraron registros",
                sInfoFiltered: "(Filtrado de un total de _MAX_ registros)",
                sInfoPostFix: "",
                sSearch: "Buscar:",
                sUrl: "",
                sInfoThousands: ",",
                sLoadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                }
                ,
                oAria: {
                    sSortAscending: ": Activar para ordenar la columna de manera ascendente",
                    sSortDescending: ": Activar para ordenar la columna de manera descendente"
                }
            },

            lengthMenu: [[10, 20, 50], [10, 20, 50]]
    });
}

function validarConsulta(){
    var errores = [];
    var dateValidacionIdentidadDesde = $('#fechaInicial').val();
    var dateValidacionIdentidadHasta = $('#fechaFinal').val();
    var tipoIdentificacion = $('#idPersona').val();
    var numeroIdentificacion = $('#documento').val();
    var nombre = $('#nombres').val();
    var apellido = $('#apellidos').val();
    var idTransaccion = $('#idTransaccion').val();
    var idNut = $('#idNut').val();
    var idDedo = $('#iddedo').val();
    var validacionDedo = $('#validacionDedo').val();
    var servicio = $('#servicio').val();
    
    if (dateValidacionIdentidadDesde !== "" && dateValidacionIdentidadHasta !== "") {
        if (Date.parse(dateValidacionIdentidadDesde) > Date.parse(dateValidacionIdentidadHasta)) {
            errores.push("- La Fecha validacion de identidad 'Desde' debe ser anterior o igual a la Fecha 'Hasta'");
        }
    }
    
    if (numeroIdentificacion !== "") {
        if (/[^0-9]/g.test(numeroIdentificacion)) {
            errores.push("- El numero de Identificación debe ser númerico");
        }
    }
    
    if (idTransaccion !== ''){
        if(idTransaccion.length > 100){
            errores.push("- El número Id Transaccion debe ser de máximo 100 caracteres");
        }
    }
    if (idNut !== ''){
        if(idNut.length > 100){
            errores.push("- El número Nut debe ser de máximo 100 caracteres");
        }
    }
    if(errores.length > 0){
        jAlert("<b>La busqueda no se pudo realizar. Se detectaron los siguientes errores:</b><br/><br/>" + errores.join("<br/>"), "Advertencia");
        return;
    }
    
    datos = {
        dateValidacionIdentidadDesde: dateValidacionIdentidadDesde,
        dateValidacionIdentidadHasta: dateValidacionIdentidadHasta,
        tipoIdentificacion: tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion,
        nombre: nombre,
        apellido: apellido,
        idTransaccion: idTransaccion,
        idNut: idNut,
        idDedo: idDedo.join("','"),
        validacionDedo: validacionDedo,
        servicio: servicio.join("','")
    };
    return datos;
}

function cargarServicios(){
    var parametros = {accion: CARGAR_SERVICIOS};
    var miCallback = function (callbackParams, result, estado){
        if (!estado || !result.success){ return ;}
        
        var data = result.servicios;
        $(data).each(function (idx, obj) {
            var opt = $("<option/>");
            opt.val(obj.idactosnrr826).html(obj.nombre);
            $("#servicio").append(opt);
        });
        $("#servicio").selectpicker('refresh').selectpicker('selectAll');    

    };
    utilidadesjQuery.ajax("../../modulos/biometria/ConsultaBiosignoWeb.php", parametros, miCallback, null, this);
}

function cargarDedos(){
    var parametros= {accion: CARGAR_DEDOS};
    var miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        var id = $("#iddedo");
        id.empty();
        id.addClass("selectpicker");
        id.attr({
            multiple: "multiple",
            "data-style": "btn-new",
            "data-width": "100%",
            "data-size": "6",
            "data-selected-text-format": "count",
            "data-live-search-normalize": true,
            "data-actions-box": true,
            "data-live-search": true,
            "data-dropup-auto": false

        });
        var data = result.dedos;
        $(data).each(function (idx, obj) {
            var opt = $("<option/>");
            opt.val(obj.iddedo);
            opt.html(obj.descripcion);
            id.append(opt);
        });

        id.selectpicker('refresh');
        id.selectpicker('render');
        id.selectpicker('selectAll');

    };
    utilidadesjQuery.ajax("../../modulos/biometria/ConsultaBiosignoWeb.php", parametros, miCallback, null, this);
}

function cargarTiposDocumentos(){
    var parametros = {accion: CARGAR_ID_PERSONAS};
    var miCallback = function (callbackParams, result, estado){
        if (!estado || !result.success){
            return;
        }
        var datos = result.tipoDocumentos;
        $(datos).each(function(indice, obj){
            var opt = $('<option/>');
            opt.val(obj.tipo_documento);
            opt.html(obj.descripcion_tipo);
            $('#idPersona').append(opt);
        });
    };
    utilidadesjQuery.ajax("../../modulos/biometria/ConsultaBiosignoWeb.php", parametros, miCallback, null, this);
}

function mostrarCamposPersona(){
    let idPersona = $("#idPersona").val();
    if (parseInt(idPersona) > 0){
        $("#divIde").removeClass('oculto');
        $("#divNom").removeClass('oculto');
        $("#divApel").removeClass('oculto');
    }else{
        $("#divIde").addClass('oculto');
        $("#divNom").addClass('oculto');
        $("#divApel").addClass('oculto');
    }
}

function descargarInforme(datos, tipo) {
    spinner("Descargando Registros, por favor espere...");
    let dato = JSON.stringify(datos);
    setTimeout(function () {
        
        var parametros = {accion: DESCARGAR_REGISTROS_BIOSIGNOWEB, datos: dato, tipo: tipo};
        var miCallback = function (callbackParams, result, estado) {
            if (!estado || !result.success) {
                return false;
            }
            if (tipo === "PDF") {
                var rutaPDF = result.rutaPDF;
                location.href = "../general/downfile.php?downfile=" + rutaPDF;
            }
            if (tipo === "CSV") {
                var rutaCSV = result.rutaCSV;
                location.href = "../general/downfile.php?downfile=" + rutaCSV;
            }
        };
        utilidadesjQuery.ajax("../../modulos/biometria/ConsultaBiosignoWeb.php", parametros, miCallback, null, this);
    }, 3000);
}


function getImpPDF() {
    var parametros = {accion: GET_IMPDF};
    var miCallback = function (callbackParams, result, estado) {
        if (!estado || !result.success) {
            return;
        }
        securi = result.securi + "";
        $("#iPdf").html(result.data.impPDF);
        $('#imgPDF').attr('src', '../../iconos/S-PDF.png');
        $('#imgPDF').css({
            height: 22,
            width: 60,
            padding: "1px 10px",
            'margin-top': "-10px"
        });
        var check = $('#impPDF');
        $('#impPDF').remove();
        $('#iPdf label').prepend(check);
        $('#iPdf label').addClass("control controlPDF control-checkbox");
        var divCrear = $("<div/>");
        divCrear.addClass("control_indicator");
        divCrear.attr({refId: "impPDF", contenedor: "iPdf"});
        $('#iPdf label').append(divCrear);
        $("#iCsv").html(result.data.impCSV);
        $('#imgCSV').attr('src', '../../iconos/S-CSV.png');
        $('#imgCSV').css({
            height: 22,
            width: 60,
            padding: "1px 10px",
            'margin-top': "-10px"
        });
        var check = $('#impCSV');
        $('#impCSV').remove();
        $('#iCsv label').prepend(check);
        $('#iCsv label').addClass("control control-checkbox");
        var divCrearCsv = $("<div/>");
        divCrearCsv.addClass("control_indicator");
        divCrearCsv.attr({refId: "impCSV", contenedor: "iCsv"});
        $('#iCsv label').append(divCrearCsv);
        $(".control_indicator").off().click(function () {
            cambiarEstadoInput(this);
        });
        $("#iPdf label").removeAttr("onclick");
    };
    spinner("Cargando Documentos, por favor espere...");
    utilidadesjQuery.ajax("../../modulos/tareasmenu/ConsultarSalidaDeCaja.php", parametros, miCallback, null, this);
}


function cambiarEstadoInput(div) {
    var id = $(div).attr("refId");
    var contenedor = $(div).attr("contenedor");
    var checkeadopdf = $("#" + id).is(':checked');
    if (checkeadopdf) {
        $("#" + contenedor + " .abrir").remove();
    }
}

function spinner(texto) {
    if (texto === "") {
        texto = "Cargando...";
    }
    if (texto === false) {
        $("#spinner").hide();
        return;
    }
    $("#textLoad").html(texto);
    $("#spinner").show();
}

function cargarCalendario() {
    $.datepicker.regional["es"] = {
        closeText: 'Cerrar',
        prevText: '<Ant',
        nextText: 'Sig>',
        currentText: 'Hoy',
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        weekHeader: 'Sm',
        dateFormat: 'yy-mm-dd',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['es']);
    $("#fechaInicial").datepicker({
        maxDate: yyyy + "-" + mm + "-" + dd,
        changeMonth: true,
        changeYear: true
    }).val(yyyy + "-" + mm + "-01");
    $("#fechaInicial").click(function () {
        setTimeout(function () {
            var fecha = $("#fechaInicial").val().split("-");
            $(".ui-datepicker-year[data-handler=selectYear]").val(fecha[0]);
        }, 100);
    });
    $("#fechaInicial").attr("readonly", "readonly");
    $("#fechaFinal").datepicker({
        maxDate: yyyy + "-" + mm + "-" + dd,
        changeMonth: true,
        changeYear: true
    }).val(yyyy + "-" + mm + "-" + dd);
    $("#fechaFinal").attr("readonly", "readonly");  
    
    $(".limpiarFecha").each(function (indice, objeto) {
        $(objeto).on("click", function () {
            $(objeto).prev().val("");
        });
    });
        
    $(".ui-datepicker").on("mouseenter", function () {
        var datos = Array.from($("select.ui-datepicker-year option"));

        if (datos.length > 0 && (parseInt(datos[datos.length - 1].value) > parseInt(datos[0].value))) {
            $("select.ui-datepicker-year").html(datos.reverse());
        }
    });


    $(".limpiarFecha > img").mouseover(function () {
        $(this).attr("src", "../../iconos/basuraHover.png");
    }).mouseout(function () {
        $(this).attr("src", "../../iconos/basura.png");
    });
}

function reemplazarTexto(text){
    return text.replace(/['"<>,\'\{\}]/g, '');
}

function validarCampos(element){
    $(element).val(reemplazarTexto(element.value));
}





