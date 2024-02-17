/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */
var securi = "";
var CARGAR_INFO = 100;
var VERIFICAR_CLIENTE = 101;
var VALIDACION_LOGIN_BIOMETRIA = 102;
var VALIDACION_HUELLA_BIOMETRIA = 103;
var RECARGAR_INFO = 104;
var VALIDACION_IDENTIDAD_INFO = 105;
var PREVISUALIZAR = 106;
var REGISTRAR_TRAMITE = 107;
var VALIDAR_VALIDACION_IDENTIDAD = 108;
var GUARDAR_AUDITORIA_FINGER = 109;
var VALIDATE_SESSION = 110;
var ACEPT_TERMS = 111;
var REJECT_TERMS = 112;
var DEFINIR_DEDOS_MANU = 113;
var DIE_SESION = 114;
var REGISTRAR_DEDO_NO_TIENE = 115;
var BORRAR_DEDO_NO_TIENE = 116;
var SEARCH_STATE_FINGERS = 117;
var clienteCargado = null;
var fotoCapturada = null;
var templateCapturado = null;
var token = null;
var validationsGlobal = null;
var idValidacionIdentidad;
var validacionGl;
var saveAuditoria = false;
var arGeocoder = [];
var latitude = "";
var longitude = "";
var geocoder = null;
var dataSend = {};
var timeOver = false;
var timeMaxValidador = 0;
var timeMaxInactividad = 0;
var restartTime = 0;
var intervalTime = null;
var intervalTimeSession = null;
var fingersDontHave = [];
var fingersDontHaveListLoaded = [];
var infoFingers = [];
var fingersVerifiedToday = [];
var loadValidateSession = true;
function getCookieValue(cookieName) {
  var name = cookieName + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(";");

  for (var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return "";
}
var sessionId = getCookieValue("PHPSESSID");
var captura = (capturaInicial = [
  {
    captura: "fotografia",
    valor: "foto",
    toString: function () {
      return this.captura;
    },
  },
  {
    captura: "Dedo 1",
    valor: "1",
    toString: function () {
      return this.captura;
    },
  },
  {
    captura: "Dedo 2",
    valor: "2",
    toString: function () {
      return this.captura;
    },
  },
]);
// var captura = (capturaInicial = [
//   {
//     captura: "Dedo 1",
//     valor: "1",
//     toString: function () {
//       return this.captura;
//     },
//   },
//   {
//     captura: "Dedo 2",
//     valor: "2",
//     toString: function () {
//       return this.captura;
//     },
//   },
// ]);
var removidosCaptura = [];
var dedosCapturados = [];
var dedosnum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var fecha_actual = new Date();
var tiempo_actual = fecha_actual.getTime();
if (
  localStorage.getItem("ventanaBiosigno") === "" ||
  localStorage.getItem("ventanaBiosigno") === null
) {
  window.name = "ventana_" + sessionId;
  localStorage.setItem("ventanaBiosigno", window.name);
} else {
  window.name = localStorage.getItem("ventanaBiosigno");
}

var tiempoInactivo = 0;
$(document).ready(function () {
  redireccionarjQuery("../biometria/BiosignoWeb.html");
  $("#bodyjQuery").css("display", "block");
  iniciarInterfaz();
});
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
function spinnerFinger(texto, img) {
	if (texto === "") {
		texto = "Cargando...";
	}
	if (texto === false) {
		$("#spinnerFinger").hide();
		return;
	}
	$("#textLoadFinger").html(texto);
	$(".spinnerFinger-img").attr("src", `../../modulos/biometria/dedos/${img}.png`);
	$("#spinnerFinger").show();
}

function iniciarInterfaz() {
  $(".titleH3").html("Biosigno WEB");
  $("#textoInterfaz").html(
    "Utilice esta opción para validar identidad del solicitante, seleccionar tramite notarial y generar documento"
  );
  $(".tableValidacion").addClass("w30");
	verificarLectorBiometrico("http://127.0.0.1:5000/api/biometria/serial");
	// .then((response) => {
	//   console.log(response.json());
	//   cargarInfo();
	// })
	// .catch((error) => {
	//   loadValidateSession = false;
	//   jAlert(
	//     "No se encuentra conectado el Lector Biometrico",
	//     "Alerta del Sistema",
	//     function () {
	//       cerrarSesiones(false);
	//       location.href = "../../modulos/principal/menu.php";
	//       return;
	//     }
	//   );
	// });
	cargarInfo();
  $("#buscar").on("click", agregarPersona);
  $(".imgTrash ").on("click", function () {
    $("#buscar").removeClass("hidden");
    $(".infoClienteCargado,.fingerstd,.datPostApi").addClass("hidden");
    $(".divDatSigno").removeClass("hidden");
    clienteCargado = null;
    $(".tableValidacion").addClass("w30").removeClass("w100");
    $(".validarServicio,.reloadInfo").remove();
    $(".imgTrashCaptura").click();
    $(".imgCapturaFoto").click();
    $(".divAlertCaptura,.contenedorCaptura").addClass("hidden");
    $(
      ".identificacionClienteCargado,.expedicionClienteCargado,.nombreClienteCargado,.apellidoClienteCargado"
    )
      .removeClass("alertCaptura")
      .html("");
    $(".divContenedorHuella").removeClass("greenCheck");
    $(".divContenedorHuella").removeClass("redCheck");
    $(".textFinger").addClass("hidden");
    $(".tmpValidador").removeClass("last-minute-over");
    $(".divTmpValidador").addClass("hidden");
    $(".divContenedorHuella").removeClass("capturadaHuella");
    clearInterval(intervalTime);
    $(".continuar").remove();
    captura = capturaInicial;
    dedosCapturados = [];
    $("#tiposDoc,#identificacion").removeAttr("disabled");
  });
  $(".saveFinger").on("click", function () {
    var dedo = $(this).attr("finger");
    var selectdedo = $(".selectdedos[finger='" + dedo + "']");
    $(".contenedorCaptura").removeClass("hidden");
    if (captura.length > 0) {
      $(".divAlertCaptura").removeClass("hidden");
      $(".faltaCaptura").html(" Falta capturar " + captura.join(","));
    }
    if (selectdedo.val() !== "0") {
      $("#imgDedo" + dedo).attr(
        "src",
        "../../modulos/biometria/dedos/" + selectdedo.val() + ".png"
      );
      $(".capturaDedo[finger='" + dedo + "']").removeClass("hidden");
      $("#imgDedo" + dedo).removeClass("hidden");
      if (saveAuditoria) {
        guardarAuditoriaFinger(dedo);
      }
    } else {
      $("#imgDedo" + dedo)
        .attr("src", "../../modulos/biometria/dedos/Def-Dedo.png")
        .removeClass("hidden");
      $(".capturaDedo[finger='" + dedo + "']").addClass("hidden");
    }
    var padreImgDedo = $("#imgDedo" + dedo)
      .parent()
      .parent()
      .parent();
    if ($(".capturaDedo[finger='" + dedo + "']").length === 0 && !timeOver) {
      var contenedorBTN = padreImgDedo.find(".contBotonCaptura");
      contenedorBTN.html(
        "<button class='btn btn-blue capturaDedo' finger='" +
          dedo +
          "'>Iniciar Captura</button>"
      );
      $(".capturaDedo").off();
      activarCapturaDedoAccion();
    }
  });
  activarCapturaDedoAccion();

  $(".selectdedos").on("change", function () {
    var dedo = $(this).attr("finger");
    var dedoDiferenteSel = $(this).attr("finger") === "1" ? "2" : "1";
    var dedoDiferente = $(
      ".selectdedos[finger='" + dedoDiferenteSel + "']"
    ).val();
    var dedoSeleccionado = $(this).val();
    if (dedoSeleccionado === dedoDiferente) {
      jAlert("Ya ha seleccionado este dedo", "Alerta del Sistema", function () {
        $(".selectdedos[finger='" + dedo + "']").val("0");
      });
      return;
    }
  });

  $(".activarCamara").on("click", function () {
    if (tieneSoporteUserMedia()) {
      _getUserMedia(
        { video: true },
        function (stream) {
          $("#fotoImg")
            .after(
              "<video id='video'></video><canvas id='canvas' class='hidden'></canvas>"
            )
            .remove();
          $(".activarCamara").addClass("hidden");
          $(".tomaFoto").removeClass("hidden");
          var video = document.getElementById("video");
          var canvas = document.getElementById("canvas");
          var boton = document.getElementById("tomarFoto");
          video.srcObject = stream;
          video.play();

          boton.addEventListener("click", function () {
            //Pausar reproducción
            video.pause();

            //Obtener contexto del canvas y dibujar sobre él
            var contexto = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

            var foto = canvas.toDataURL(); //Esta es la foto, en base 64
            fotoCapturada = foto;
            captura = captura.filter((cap) => cap.valor !== "foto");
            $(".faltaCaptura").html(" Falta capturar " + captura.join(","));
            actualizarAlerta();
            $("#tomarFoto")
              .after(
                "<div class='divCapturaFoto'><span>Foto capturada</span><img title='Eliminar captura de Foto' src='../../iconos/basura.png' class='imgCapturaFoto cursorPoint' style='width:16px; height:16px'></div>"
              )
              .remove();
            $("#video").addClass("hidden");
            $("#canvas").removeClass("hidden");
            $(".imgCapturaFoto")
              .off()
              .on("click", function () {
                $("#video").removeClass("hidden");
                $(".divContenedorToma").removeClass("greenCheck");
                $("#canvas").addClass("hidden");
                $(".divCapturaFoto").html(
                  "<button class='btn btn-blue' id='tomarFoto'>Tomar foto</button>"
                );
                $(".activarCamara").click();
                var objaddCaptura = {
                  captura: "fotografia",
                  valor: "foto",
                  toString: function () {
                    return this.captura;
                  },
                };
                captura.push(objaddCaptura);
                actualizarAlerta();
              });
            setTimeout(function () {
              jAlert(
                "Captura de foto realizada!",
                "Alerta del Sistema",
                function () {
                  $(".divContenedorToma").addClass("greenCheck");
                  //Reanudar reproducción
                  video.play();
                }
              );
              return;
            }, 100);
          });
        },
        function (error) {
          jAlert(
            "se requiere que este conectada la camara.",
            "Alerta del Sistema",
            function () {
              //                    location.href = '../../modulos/principal/menu.php';
            }
          );
          return;
        }
      );
    } else {
      jAlert(
        "Lo siento. Tu navegador no soporta esta característica",
        "Alerta del Sistema"
      );
    }
  });
  $(".acceptTerms").on("click", function () {
    aceptTerms();
  });
  $(".rejectTerms").on("click", function () {
    rejectTerms();
  });
  $("#defDedosManu").on("click", function () {
    searchStateFingers(true);
  });
	$("#defDedosManuSelect").on("click", function () {
		$(".clientDefinirDed").html(clienteCargado.nombreCompleto);
		$("#modalAsignationFingers").modal("show");
	});
  $(".registrarDefinirDedos").on("click", function () {
    var errores = new Array();
    var motivocambio = $(".motivoCambio").val();
	  var dedo1Sel = $(".selectdedos[finger='1'] option:selected").val();
	  var dedo2Sel = $(".selectdedos[finger='2'] option:selected").val();
    var dedo1definido = $(
		".selectDedosDefine[finger='1'] option:selected"
    ).val();
    var dedo2definido = $(
		".selectDedosDefine[finger='2'] option:selected"
    ).val();
    if (dedo2definido === "0" && dedo1definido === "0") {
      errores.push(
        "-Para registrar debe al menos uno de los dedos haber cambiado "
      );
    }
    if (dedo1definido === dedo2definido) {
      errores.push(
        "-El dedo definido en el dedo 1 debe ser diferente para el dedo 2"
      );
    }
    if (motivocambio === "") {
      errores.push("-No ha ingresado el motivo del cambio para registrar");
    }
    if (errores.length > 0) {
      jAlert(
        "<b>El registro no se pudo realizar. Se detectaron los siguientes errores:</b><br/><br/>" +
          errores.join("<br/>"),
        "Advertencia"
      );
      return;
    }
    definirDedosManualmente(
      dedo1Sel,
      dedo2Sel,
      dedo1definido,
      dedo2definido,
      motivocambio
    );
  });

  $(window).on("beforeunload", function () {
    cerrarSesiones(true);
  });
  $("#salir").on("click", function () {
    cerrarSesiones(false);
    localStorage.setItem("ventanaBiosigno", "");
    location.href = "../../modulos/principal/menu.php";
  });
  $(".divImgFingersVerified").on("click", function () {
    $(".clientDefinirDed").html(clienteCargado.nombreCompleto);
    updateFingersTableVerified();
    $("#modalDedosVerified").modal("show");
  });
  $(".selectDedosDefine").off().on("change", function () {
    var finger = $(this).attr("finger");
    var fingerDiferent = finger === '1' ? '2' : '1';
    var valueFinger = $(this).val();
    var selectFingerGeneral = $(`.selectdedos[finger='${finger}']`);
    if (selectFingerGeneral.val() === valueFinger) {
      jAlert("Este dedo ya se encuentra cargado en la interfaz para esa mano");
      $(`.selectDedosDefine[finger='${finger}']`).val(0);
    }
    //validacion para ver si el dedo diferente al seleccionado ya fue cargado O NO 
    var selectFingerDiferent = $(`.selectdedos[finger='${fingerDiferent}']`);
    if (valueFinger === selectFingerDiferent.val()) {
      jAlert("Este dedo ya se encuentra cargado en la interfaz, este debe ser diferente");
      $(`.selectDedosDefine[finger='${finger}']`).val(0);
    }
  });
}
function searchStateFingers(openModal = false) {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: SEARCH_STATE_FINGERS,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    $(".clientDefinirDed").html(clienteCargado.nombreCompleto);
    fingersDontHave = [];
    $(result.fingersDontHave).each(function (i, obj) {
      var finger = obj.iddedo;
      fingersDontHave.push(obj);
      updateFingersTable();
      $(".selectFingersDontHave")
        .find("option[value='" + finger + "']")
        .remove();
    });
	  // $(result.fingersVerifiedToday).each(function (i, obj) {
	  //   var finger = obj.iddedo;
	  //   $(".selectFingersDontHave")
	  //     .find("option[value='" + finger + "']")
	  //     .remove();
	  // });
    if (openModal) {
      $("#modalDedosManu").modal("show");
    } else {
		//   fingersVerifiedToday = result.fingersVerifiedToday;
		//   if (fingersVerifiedToday.length > 0) {
		//     $(".divImgFingersVerified").removeClass("hidden");
		//   } else {
		//     $(".divImgFingersVerified").addClass("hidden");
		//   }
    }
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function cerrarSesiones(async) {
  var parametros = { accion: DIE_SESION, ventana: window.name };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    localStorage.setItem("ventanaBiosigno", "");
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this,
    async
  );
}
function aceptTerms() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: ACEPT_TERMS,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
    tratamientoText: $(".tratamientoText").html(),
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    var link = document.createElement("a");
    link.href = "../general/downfile.php?downfile=" + result.rutaPdf;
    link.setAttribute("download", "");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    validarValidacionIdentidad();
	  $("#defDedosManu,#defDedosManuSelect").removeClass("hidden");
    $("#modalTratamiento").modal("hide");
    fingersDontHave = [];
    $(fingersDontHaveListLoaded).each(function (i, obj) {
      var finger = obj.iddedo;
      fingersDontHave.push(obj);
      updateFingersTable();
      $(".selectFingersDontHave")
        .find("option[value='" + finger + "']")
        .remove();
      $(".selectDedosDefine")
        .find("option[value='" + finger + "']")
        .remove();
    });
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function rejectTerms() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: REJECT_TERMS,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    jAlert(
      "Se ha registrado que el compareciente no esta de acuerdo con el tratamiento de datos personales, por esta razón no es posible continuar con el proceso",
      "Alerta de sistema",
      function () {
        cerrarSesiones(false);
        location.href = "../../modulos/principal/menu.php";
        return;
      }
    );
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function definirDedosManualmente(
  dedo1Sel,
  dedo2Sel,
  dedo1definido,
  dedo2definido,
  motivocambio
) {
  var parametros = {
    accion: DEFINIR_DEDOS_MANU,
    dedo1Sel: dedo1Sel,
    dedo2Sel: dedo2Sel,
    dedo1definido: dedo1definido,
    dedo2definido: dedo2definido,
    motivocambio: motivocambio,
    cliente: clienteCargado.nombreCompleto,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    if (dedo1definido !== "0") {
      $(".selectdedos[finger='1']").val(dedo1definido);
      $(".textFinger[finger='1'],.dedoModalDefine[finger='1']").html(
        $(".selectdedos[finger='1']  option:selected").text()
      );
      $(".saveFinger[finger='1']").click();
      dedosCapturados = dedosCapturados.filter((ded) => ded.dedo !== dedo1Sel);
      $(".divContenedorHuella[finger='1']").removeClass(
        "capturadaHuella greenCheck"
      );
      $(".contInfoRta[finger='1']").addClass("hidden");
    }
    if (dedo2definido !== "0") {
      $(".selectdedos[finger='2']").val(dedo2definido);
      $(".textFinger[finger='2'],.dedoModalDefine[finger='2']").html(
        $(".selectdedos[finger='2']  option:selected").text()
      );
      $(".saveFinger[finger='2']").click();
      dedosCapturados = dedosCapturados.filter((ded) => ded.dedo !== dedo2Sel);
      $(".divContenedorHuella[finger='2']").removeClass(
        "capturadaHuella greenCheck"
      );
      $(".contInfoRta[finger='2']").addClass("hidden");
    }

    //        $(".saveFinger").click();
    $(".selectDedosDefine").val("0");
    $(".motivoCambio").val("");
    $("#modalDedosManu").modal("hide");
    $("#modalAsignationFingers").modal("hide");
    $(".divTmpValidador").addClass("hidden");
    clearInterval(intervalTime);
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function guardarAuditoriaFinger(dedo) {
  var dedoDesc = $(".selectdedos[finger='" + dedo + "'] option:selected");
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: GUARDAR_AUDITORIA_FINGER,
    dedoDesc: dedoDesc.text(),
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function randomFinger(ar) {
  return ar[Math.floor(Math.random() * ar.length)];
}
function cargarInfo() {
  var parametros = { accion: CARGAR_INFO, ventana: window.name };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      location.href = "../../modulos/principal/menu.php";
      return;
    }
    if (result.sesionState) {
      jAlert(
        "Su sesion para Biosigno web ha finalizado, por favor ingrese nuevamente ",
        "Alerta de sistema",
        function () {
          cerrarSesiones(false);
          location.href = "../../modulos/principal/menu.php";
          return;
        }
      );
    }
    var select = $("#tiposDoc");
	  var selectdedos = $(".selectdedos");
    var selectFingersDontHave = $(".selectFingersDontHave");
    var selectTramite = $(".selectTramite");
    var selectPlantilla = $(".selectPlantilla");
	  var selectDedosDefine = $(".selectDedosDefine");
    var option = $("<option/>")
      .val("0")
      .html("Seleccione Tipo de documento")
      .attr("selected", "selected");
    var optionT = $("<option/>")
      .val("0")
      .html("Seleccione Tramite")
      .attr("selected", "selected");
    var optionP = $("<option/>")
      .val("0")
      .html("Seleccione Plantilla")
      .attr("selected", "selected");
    select.append(option);
    selectTramite.append(optionT);
    selectPlantilla.append(optionP);
    $(result.tiposDoc).each(function (i, obj) {
      var option = $("<option/>");
      if (obj.tipo_documento === 1) {
        option.attr("selected", "selected");
      }
      option.val(obj.tipo_documento).html(obj.nombre_extendido);
      select.append(option);
    });
    $(result.dedos).each(function (i, obj) {
      var option = $("<option/>");
      option.val(obj.iddedo).html(obj.descripcion);
      selectdedos.append(option);
      var optionDefine = $("<option/>");
		optionDefine.val(obj.iddedo).html(obj.descripcion);
		selectFingersDontHave.append(optionDefine);
		infoFingers.push(obj);
    });
	  $(result.dedos).each(function (i, obj) {
		  var optionDefine = $("<option/>");
		  optionDefine.val(obj.iddedo).html(obj.descripcion);
		  selectDedosDefine.append(optionDefine);
	  });

    $(result.tramiteNotarial).each(function (i, obj) {
      var optionT = $("<option/>");
      optionT.val(obj.idactosnrr826).html(obj.nombre);
      selectTramite.append(optionT);
    });
    $(result.plantillas).each(function (i, obj) {
      var optionP = $("<option/>");
      optionP.val(obj.idplantilladocumento).html(obj.nombre);
      selectPlantilla.append(optionP);
    });
    securi = result.securi + "";
    timeMaxValidador = result.timeMaxValidador;
    timeMaxInactividad = result.timeMaxInactividad;
    restartTime = result.restartTime;
    if (timeMaxInactividad > 0) {
      document.addEventListener("mousemove", resetTimer);
      document.addEventListener("keypress", resetTimer);
      function resetTimer() {
        tiempoInactivo = 0;
      }
      setInterval(checkTimer, 60000);
      function checkTimer() {
        tiempoInactivo++;
        if (tiempoInactivo >= parseInt(timeMaxInactividad)) {
          jAlert(
            "Estimado usuario , su sesion lleva mas de " +
              timeMaxInactividad +
              " minutos inactiva y por seguridad sera redirigido a la interfaz principal",
            "Alerta de sistema",
            function () {
              cerrarSesiones(false);
              location.href = "../../modulos/principal/menu.php";
              return;
            }
          );
        }
      }
    }
    $(".addFingersDontHave").on("click", function () {
      var valor = selectFingersDontHave.val();
      if (valor === "0") {
        jAlert("Si desea agregar a la lista , Seleccione un dedo ");
        return;
      } else {
        if (dedosnum.length <= 2) {
          jAlert(
            "Para la toma de huellas el ciudadano minimo debe tener dos dedos"
          );
          return;
        }
        var descFinger = $(".selectFingersDontHave option:selected").text();
        var selectDedosDefine = $(".selectDedosDefine ");
        jConfirm(
          "Esta seguro de informar que el ciudadano no tiene el dedo " +
            descFinger +
            ", este proceso sera auditado",
          "Confirma Añadir dedo",
          function (rta) {
            if (rta) {
              var posicionDedonum = dedosnum.findIndex(
                (elemento) => elemento == valor
              );
              dedosnum.splice(posicionDedonum, 1);
              var descripcionSelect = selectFingersDontHave
                .find("option[value='" + valor + "']")
                .text();
              var obj = { iddedo: valor, description: descripcionSelect };
              fingersDontHave.push(obj);
              selectFingersDontHave
                .find("option[value='" + valor + "']")
                .remove();

              selectDedosDefine
                .find("option[value='" + valor + "']")
                .remove();
              registerFingersDontHave(valor);
            }
          }
        );
      }
    });
    validateSession();
  };
  spinner("");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function registerFingersDontHave(finger) {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: REGISTRAR_DEDO_NO_TIENE,
    finger: finger,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    updateFingersTable();
  };
  spinner("Registrando dedo el cual no tiene el ciudadano");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function deleteFingersDontHave(finger) {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: BORRAR_DEDO_NO_TIENE,
    finger: finger,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }

    updateFingersTable();
  };
  spinner("Removiendo dedo el cual no tiene el ciudadano");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function updateFingersTable() {
  var tableBody = $("#fingersTable tbody");
  tableBody.empty();

  fingersDontHave.forEach(function (element) {
    var searchFingerInArray = infoFingers.find(
      (elemento) => elemento.iddedo == element.iddedo
    );
    var idedo = searchFingerInArray.iddedo;
    var descripcion = searchFingerInArray.descripcion;
    var row = $("<tr>").appendTo(tableBody);
    var divEliminar =
      "<div class='fingerRemoveTable flexCenterAlign' descriptionfinger='" +
      descripcion +
      "' idFinger='" +
      idedo +
      "'><img class='cursorPoint' title='remover dedo " +
      descripcion +
      "' src='../../iconos/basura.png' style='width:16px; height:16px'></div>";
    $("<td>").html(divEliminar).appendTo(row);
    $("<td>").text(descripcion).appendTo(row);
  });
  $(".fingerRemoveTable")
    .off()
    .on("click", function () {
      var fingerSel = $(this).attr("idfinger");
      var descriptionfinger = $(this).attr("descriptionfinger");
      jConfirm(
        "Esta seguro de informar que el ciudadano si tiene el dedo " +
          descriptionfinger +
          ", este proceso sera auditado",
        "Confirma Eliminar dedo",
        function (rta) {
          if (rta) {
            var indexFinger = fingersDontHave.findIndex(
              (elemento) => elemento.iddedo == fingerSel
            );
            var elementFinger = fingersDontHave[indexFinger];
            fingersDontHave.splice(indexFinger, 1);
            var addFingerSelectObj = infoFingers.find(
              (elemento) => elemento.iddedo == elementFinger.iddedo
            );
            dedosnum.push(parseInt(fingerSel));
            dedosnum.sort(function (a, b) {
              return a - b;
            });
            var arrayFingersTmp = [];
            $(".selectFingersDontHave option").each(function (i, obj) {
              var posFinger = $(obj).val();
              var descriptionFinger = $(obj).text();
              var objFinger = {
                iddedo: posFinger,
                descripcion: descriptionFinger,
              };
              arrayFingersTmp.push(objFinger);
            });
            arrayFingersTmp.push(addFingerSelectObj);
            $(".selectFingersDontHave").html("");
            $(".selectDedosDefine").html("");
            arrayFingersTmp.sort(function (a, b) {
              return a.iddedo - b.iddedo;
            });
            $(arrayFingersTmp).each(function (i, obj) {
              var option = $("<option/>");
              option.val(obj.iddedo).html(obj.descripcion);
              $(".selectFingersDontHave").append(option);
            });
            $(arrayFingersTmp).each(function (i, obj) {
              var option = $("<option/>");
              option.val(obj.iddedo).html(obj.descripcion);
              $(".selectDedosDefine").append(option);
            });
            deleteFingersDontHave(fingerSel);
            updateFingersTable();
          }
        }
      );
    });
  updateFingersReactive();
}
function updateFingersTableVerified() {
  var tableBody = $("#fingersTableVerified tbody");
  tableBody.empty();

  fingersVerifiedToday.forEach(function (element) {
    var searchFingerInArray = infoFingers.find(
      (elemento) => elemento.iddedo == element.iddedo
    );
    var idedo = searchFingerInArray.iddedo;
    var descripcion = searchFingerInArray.descripcion;
    var row = $("<tr>").appendTo(tableBody);
    $("<td>").text(descripcion).appendTo(row);
  });
}
function validarValidacionIdentidad() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: VALIDAR_VALIDACION_IDENTIDAD,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    if (result.val.length > 0) {
      if (
        result.val[0].dedo1resultadovalidacion === "true" &&
        result.val[0].dedo2resultadovalidacion === "true"
      ) {
        saveAuditoria = false;
        cargarFingersAll();
      } else {
        saveAuditoria = true;
        // $(".selectdedos,.saveFinger").removeClass("hidden");
      }
    } else {
      saveAuditoria = false;
      cargarFingersAll();
    }
  };
  spinner("Validando Identidad ");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function scrollToAlert() {
  var alert = document.getElementById("iddivAlertCaptura");
  alert.scrollIntoView({ behavior: "smooth" });
}
function cargarTemporizador() {
  $(".divTmpValidador").removeClass("hidden");
  var time = timeMaxValidador * 60; // segundos
  timeOver = false;
  intervalTime = setInterval(function () {
    time--;
    if (time < 0) {
      clearInterval(intervalTime);
      $(".contenedorCaptura").addClass("hidden");
      $(".capturaDedo").remove(); // elimina el botón con el id "my-button"
      $(".faltaCaptura").html(
        "Por seguridad debe iniciar nuevamente el proceso de captura de huellas , porque ha finalizado el tiempo maximo para la validacion de identidad."
      );
    } else {
      // convierte los segundos restantes a minutos y segundos
      var minutes = Math.floor(time / 60);
      var seconds = time % 60;
      // formatea los minutos y segundos como cadenas de dos dígitos
      var formattedTime =
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds;
      // actualiza el valor del elemento con el id "timer"
      $(".tmpValidadorText").text(formattedTime);
      if (time <= 60) {
        $(".tmpValidador").addClass("last-minute");
      } else {
        $(".tmpValidador").removeClass("last-minute"); // elimina la clase "last-minute" si no es el último minuto
      }
      if (time === 0) {
        timeOver = true;
        $(".divTmpValidador,.divNutTranVali").addClass("hidden");
        $(".tmpValidador")
          .removeClass("last-minute")
          .addClass("last-minute-over");
        $(".validarServicio").remove();
        $(".divAlertCaptura").removeClass("hidden");
        scrollToAlert();
      }
    }
  }, 1000); // llama la función cada segundo (1000 ms)
  // elimina la clase "last-minute" cuando la animación termine
  $(".tmpValidador").on("animationend", function () {
    if ($(this).hasClass("last-minute")) {
      $(this).removeClass("last-minute");
    }
  });
}
function cargarFingersAll() {
  var finger1Select = randomFinger(dedosnum);
  var finger2Select = randomFinger(dedosnum);
  while (finger1Select === finger2Select && dedosnum.length >= 2) {
    finger2Select = randomFinger(dedosnum);
  }
  if (dedosnum.length < 2) {
    //        jAlert("Para la toma de huellas el ciudadano minimo debe tener dos dedos");
    //        location.reload();
    jAlert(
      "Para la toma de huellas el ciudadano minimo debe tener dos dedos",
      "Alerta de sistema",
      function () {
        return;
      }
    );
  }
  $(".selectdedos").html("");
  $(infoFingers).each(function (i, obj) {
    if (dedosnum.find((elemento) => elemento == obj.iddedo)) {
      var option = $("<option/>");
      option.val(obj.iddedo).html(obj.descripcion);
      $(".selectdedos").append(option);
    }
  });

  $(".selectdedos[finger='1']").val(finger1Select);
  $(".selectdedos[finger='2']").val(finger2Select);
  $(".textFinger[finger='1'],.dedoModalDefine[finger='1']")
    .html($(".selectdedos[finger='1']  option:selected").text())
    .removeClass("hidden");
  $(".textFinger[finger='2'],.dedoModalDefine[finger='2']")
    .html($(".selectdedos[finger='2']  option:selected").text())
    .removeClass("hidden");
  $(".selectdedos,.saveFinger").addClass("hidden");

  $(".saveFinger").click();
}
function agregarPersona() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var errores = [];
  if (parseInt(idTipoDoc) === 0 || idTipoDoc === null) {
    errores.push("- El tipo de documento es obligatorio");
  }

  if (
    (parseInt(idDocumento) === 0 || idDocumento === "") &&
    parseInt(idTipoDoc) > 0
  ) {
    errores.push("- El documento es obligatorio");
  }

  if (
    parseInt(idTipoDoc) === 1 ||
    parseInt(idTipoDoc) === 2 ||
    parseInt(idTipoDoc) === 5
  ) {
    if (/[^0-9]/g.test(idDocumento)) {
      errores.push("- El documento debe ser numerico");
    }
  } else {
    if (/[^0-9A-Za-z]/g.test(idDocumento)) {
      errores.push("- El documento debe ser alfanumerico");
    }
  }
  if (errores.length > 0) {
    jAlert(
      "La busqueda no se pudo realizar, se detectaron los siguientes errores:<br/><br/>" +
        errores.join("<br/>"),
      "Mensaje"
    );
    return false;
  }

  var parametros = {
    accion: VERIFICAR_CLIENTE,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return false;
    }
    var data = result.data;
    var tipoDocumento = data.idTipoDoc;
    var descripcionTipo = data.descripcionTipo;
    var documento = data.documento;
    var nombre = data.nombre;
    var email = data.email;
    var expedicion = data.expedida;
    var genero = data.genero;
    var domicilio = data.domicilio;
    var telefono = data.telefono;
    var celular = data.celular;
    var apellidos = data.apellidos;
    fingersDontHaveListLoaded = data.fingersDontHave;
    fingersVerifiedToday = data.fingersVerifiedToday;
    fingersVerifiedToday.length > 0
      ? $(".divImgFingersVerified").removeClass("hidden")
      : $(".divImgFingersVerified").addClass("hidden");
    updateFingersReactive();
    updateFingersValidateReactive();

    if (data.existeCliente === false) {
      clienteCargado = null;
      var parametros = encodeURIComponent(
        Aes.Ctr.encrypt(
          Base64.encode(
            "accion=99&idTipoDocumento=" +
              tipoDocumento +
              "&identificacion=" +
              documento
          ),
          securi,
          256
        )
      );
      var ruta =
        "../../modulos/tareasmenu/AdministrarClientes.php?q=" + parametros;
      var ventana = window.open(
        ruta,
        "Agregar Cliente",
        "toolbar=0,maximize=1,location=0,height=700,width=1000,directories=0,status=1,menubar=0,scrollbars=1,resizable=1,copyhistory=0"
      );
      return;
    }
    $(".divDatSigno,#buscar").addClass("hidden");
    $(".infoClienteCargado,.fingerstd").removeClass("hidden");
    $(".identificacionClienteCargado").html(descripcionTipo + " " + documento);
    $(".nombreClienteCargado").html(nombre);
    $(".apellidoClienteCargado").html(apellidos);
    $(".expedicionClienteCargado").html(expedicion);
    clienteCargado = data;
    var imgruta = "../../modulos/biometria/dedos/Fem-camara.png";
    if (genero === "t") {
      imgruta = "../../modulos/biometria/dedos/Mas-camara.png";
    }
    $("#fotoImg").attr("src", imgruta);
    $(".tratamientoText").html(data.plantillatratamientoTxt);
    $("#modalTratamiento").modal("show");
    $("#tiposDoc,#identificacion").attr("disabled", "disabled");
    //        validarValidacionIdentidad();
  };
  spinner("Verificando Cliente, por favor espere...");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}

function recibeCliente(data) {
  agregarPersona();
}
function actualizarSerial(dedodemano, dedoescogido) {
  spinner("Estableciendo comunicaci&oacute;n con el lector Biometrico");
  $.ajax({
    url: "http://127.0.0.1:5000/api/biometria/serial",
    type: "POST",
    dataType: "json",
    format: "json",
    success: function (json) {
      spinner(false);
      if (json.result === 0) {
        capturaHuella(dedodemano, dedoescogido);
      } else {
        jAlert(
          "No se ha asignado la llave correctamente , Verifique que el dispositivo este conectado correctamente",
          "Alerta del sistema"
        );
      }
    },
    error: function (error) {
      spinner(false);
      jAlert(
        "Verifique que se encuentre en ejecucion el servicio para la lectura biometrica",
        "Alerta del sistema"
      );
    },
  });
}
function capturaHuella(dedodemano, dedoescogido) {
  //   const infoDedoCaptura = infoFingers.filter(
  //     (objeto) => objeto.iddedo == dedodemano
  //   );
  //   const infoDedoCaptura = infoFingers.find(
  //     (objeto) => objeto.iddedo == dedodemano
  //   );
  //   console.log(dedodemano);
  //   var manoEscogida = "";
  //   if (infoDedoCaptura.iddedo > 0 && infoDedoCaptura.iddedo <= 5) {
  //     manoEscogida = "Mano derecha";
  //   } else {
  //     manoEscogida = "Mano izquierda";
  //   }
  var mano = dedoescogido == 1 ? "Izquierda" : "Derecha";
  var infoDedoCaptura = $(
    ".selectdedos[finger='" + dedoescogido + "'] option:selected"
  ).text();
	spinnerFinger(
		`Iniciando captura biometrica del dedo ${infoDedoCaptura} ...`, dedodemano
  );
  $.ajax({
    url: "http://127.0.0.1:5000/api/biometria/captura",
    type: "POST",
    dataType: "json",
    format: "json",
    success: function (json) {
		spinnerFinger(false);
      if (json.stringHuella !== "") {
        if (dedosCapturados.length === 0) {
          cargarTemporizador();
        }
        var obj = {
          huella: json.stringHuella,
          dedo: dedodemano,
          dedoescogido: dedoescogido,
        };
        dedosCapturados.push(obj);
        $(".divContenedorHuella[finger='" + dedoescogido + "']").addClass(
          "capturadaHuella"
        );
        $(".capturaDedo[finger='" + dedoescogido + "']")
          .after(
            "<div class='divCapturaRealizada' finger='" +
              dedoescogido +
              "'><span>Captura Realizada</span><img title='Eliminar captura del dedo " +
              dedoescogido +
              "' src='../../iconos/basura.png' finger='" +
              dedoescogido +
              "' class='imgTrashCaptura cursorPoint' style='width:16px; height:16px'></div>"
          )
          .remove();
        $(".imgTrashCaptura")
          .off()
          .on("click", function () {
            var dedo = $(this).attr("finger");
            $(".divCapturaRealizada[finger='" + dedo + "']")
              .after(
                "<button class='btn btn-blue capturaDedo' finger='" +
                  dedo +
                  "'>Iniciar Captura</button>"
              )
              .remove();
            $(".capturaDedo")
              .off()
              .on("click", function () {
                var dedoescogido = $(this).attr("finger");
                var dedodemano = $(
                  ".selectdedos[finger='" + dedoescogido + "']"
                ).val();
                actualizarSerial(dedodemano, dedoescogido);
              });
            $(".divContenedorHuella[finger='" + dedo + "']").removeClass(
              "capturadaHuella redCheck greenCheck"
            );
            var objaddCaptura = {
              captura: "Dedo " + dedo,
              valor: "" + dedo,
              toString: function () {
                return this.captura;
              },
            };
            captura.push(objaddCaptura);
            actualizarAlerta();
            $(".selectdedos[finger='" + dedo + "'").removeAttr("disabled");
            dedosCapturados = dedosCapturados.filter(
              (ded) => ded.dedoescogido !== dedo
            );
            $(".continuar").remove();
            $(".contInfoRta[finger='" + dedo + "'").addClass("hidden");
            $(".divTmpValidador").addClass("hidden");
            clearInterval(intervalTime);
          });
        captura = captura.filter((cap) => cap.valor !== dedoescogido);
        actualizarAlerta();
        $(".selectdedos[finger='" + dedoescogido + "'").attr(
          "disabled",
          "disabled"
        );
        dataSend = {
          addressM: json.mac,
          addressI: json.ip,
          serialD: json.serial,
        };
        $(".contInfoRta[finger='" + dedoescogido + "']").removeClass("hidden");
        $(".serialTxt[finger='" + dedoescogido + "']").html(json.serial);
        $(".ipTxt[finger='" + dedoescogido + "']").html(json.ip);
        $(".macTxt[finger='" + dedoescogido + "']").html(json.mac);
      } else {
        jAlert(json.result, "Alerta de sistema");
      }
    },
    error: function (error) {
		spinnerFinger(false);
      console.log("message Error" + JSON.stringify(error));
    },
  });
}
/*Foto Camaraa*/
function tieneSoporteUserMedia() {
  return !!(
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.mediaDevices.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.msGetUserMedia
  );
}

function _getUserMedia() {
  return (
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.mediaDevices.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.msGetUserMedia
  ).apply(navigator, arguments);
}
function actualizarAlerta() {
  $(".faltaCaptura").html(" Falta capturar " + captura.join(","));
  $(".divAlertCaptura").addClass("hidden");
  if (captura.length > 0) {
    if (captura.length === 1 && captura[0].valor == "foto") {
      $(".validarServicio").remove();
      $("#salir").before(
        "<button class='validarServicio btn btn-blue'>Validar Identidad</button>"
      );
    } else {
      $(".validarServicio").remove();
      $(".divAlertCaptura").removeClass("hidden");
    }
  } else if (captura.length === 0) {
    $(".validarServicio").remove();
    $("#salir").before(
      "<button class='validarServicio btn btn-blue'>Validar Identidad</button>"
    );
  }
  $(".validarServicio")
    .off()
    .on("click", function () {
      validarIdentidad();
    });
}

function validarIdentidad() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  if (!timeOver) {
    var parametros = {
      accion: VALIDACION_LOGIN_BIOMETRIA,
      idTipoDoc: idTipoDoc,
      idDocumento: idDocumento,
    };
    var miCallback = function (callbackParams, result, estado) {
      if (!estado || !result.success) {
        return;
      }
      var alertas=result.alertas;

      if (alertas.length > 0) {
        jAlert(
          "<b>Alerta :</b><br/><br/>" +
            alertas.join("<br/>"),
          "Advertencia"
        );
      }
      var respuesta = result.response;
      if(respuesta.token===null){
        jAlert(respuesta.information,"Alerta del sistema");
        clearInterval(intervalTime);
        $(".divTmpValidador").removeClass("hidden");
        cargarTemporizador();
        return false;
      }else{
        token = respuesta.token;
        validacionCaptura();
      }
    };
    spinner("Validando Identidad ");
    utilidadesjQuery.ajax(
      "../../modulos/biometria/BiosignoWeb.php",
      parametros,
      miCallback,
      null,
      this
    );
  }
}
function validacionCaptura() {
  $(".divTmpValidador").addClass("hidden");
  clearInterval(intervalTime);
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    accion: VALIDACION_HUELLA_BIOMETRIA,
    dataSend: JSON.stringify(dataSend),
    latitude: latitude,
    longitude: longitude,
    fotoCapturada: fotoCapturada,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
    dedosCapturados: JSON.stringify(dedosCapturados),
    token: token,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      $(".divTmpValidador").removeClass("hidden");
      cargarTemporizador();
      if($(".continuar").length>0){
        $(".continuar").remove();
      }
      return;
    }
    var respuesta = result.response.result;
    var dedosValidados = respuesta.fingers;
    var persona = respuesta.candidateDetail;
    var validations = result.validations;
    validationsGlobal = validations;
    var nut = respuesta.nut;
    var transactionId = result.response.transactionId;
    var fechaValidacion = result.response.timestamp;
    var statusCode = result.response.statusCode;
    if (
      dedosValidados.length === 0 &&
      statusCode === 200 &&
      trim(respuesta.information) === "CandidateNotFound"
    ) {
      jAlert(
        "El candidato no fue encontrado en la base de datos de la Registraduria Nacional del estado civil.",
        "Alerta del sistema"
      );
      return;
    }
    $(".datPostApi").removeClass("hidden");
    $(".tableValidacion").removeClass("w30").addClass("w100");
    $(".nombresObtain").html(persona.firstName1 + " " + persona.firstName2);
    $(".ideObtain").html(persona.nip);
    $(".tipoDocObtain").html(result.descTipoDoc);
    $(".apellidosObtain").html(persona.lastName1 + " " + persona.lastName2);
    $(".expedicionObtain").html(
      persona.expeditionPlace +
        " " +
        persona.expeditionDate +
        " " +
        persona.validity
    );

    $(".dedo1Obtain").html("Score " + dedosValidados[0].score);
    $(".dedo2Obtain").html("Score " + dedosValidados[1].score);
    $(".nutObtain").html(nut);
    $(".ideTransObtain").html(transactionId);
    $(".fechaValObtain").html(fechaValidacion);
    $(dedosValidados).each(function (i, obj) {
      var dedoPosicion = i + 1;
      var contenedor = $(".divContenedorHuella[finger='" + dedoPosicion + "']");
      var contenedorDivDedoValidate = $(
        ".divdedosValidate[finger='" + dedoPosicion + "']"
      );
      var spanDedoValidate = $(
        ".spanValidateDedo[finger='" + dedoPosicion + "']"
      );
      var claseColor = "redCheck";
      var clase = "redValidate";
      var claseInversa = "greenValidate";
      var claseInversaSpan = "Correcto";
      var claseSpan = "Incorrecto";
      if (obj.result) {
        claseColor = "greenCheck";
        clase = "greenValidate";
        claseInversa = "redValidate";
        claseSpan = "Correcto";
        claseInversaSpan = "Incorrecto";
      }
      contenedor.addClass(claseColor);
      contenedorDivDedoValidate.addClass(clase).removeClass(claseInversa);
      spanDedoValidate
        .addClass(claseSpan)
        .removeClass(claseInversaSpan)
        .text(claseSpan);
    });
    var erroresValidation = 0;
    for (let propiedad in validations) {
      var contenedor = $(".div" + validations[propiedad].nombre);
      var spanValidate = $(".spanValidate" + validations[propiedad].nombre);
      var span = $(".span" + validations[propiedad].nombre);

      if (validations[propiedad].valor) {
        var clase = "greenValidate";
        var textValidate = "Correcto";
      } else {
        var clase = "redValidate";
        var textValidate = "Incorrecto";
        if (!validations[propiedad].nombre === "expedicionValidate") {
          erroresValidation++;
        }
        span.addClass("alertCaptura");
      }
      contenedor.addClass(clase);
      spanValidate.text(textValidate).addClass(textValidate);
    }
    var erroresHuellas = 0;
    $($(".divContenedorHuella")).each(function (i, obj) {
      var este = $(this);
      if (este.hasClass("redCheck")) {
        erroresHuellas++;
      }
    });

    if (erroresValidation > 0 || erroresHuellas > 0) {
      $(".reloadInfo").remove();
      $("#salir").before(
        "<img title='Recargar datos' class='iconReload reloadInfo cursorPoint' src='../../iconos/ReloadN.png'>"
      );
      $(".reloadInfo").off().on("click", recargarInfo);
      // if (restartTime === "1") {
      // clearInterval(intervalTime);
      $(".divTmpValidador").removeClass("hidden");
        cargarTemporizador();
      // }
    } else {
      clearInterval(intervalTime);

      $(".divTmpValidador,.saveFinger,.imgCapturaFoto").addClass("hidden");
      $(".validarServicio,.imgTrashCaptura").remove();
      $("#salir").before(
        "<button class='btn btn-blue continuar'>Continuar</button>"
      );
      $(".reloadInfo").remove();
      idValidacionIdentidad = result.idValidacionIdentidad;
      validacionGl = idValidacionIdentidad;
      var nombres = result.nombres;
      var apellidos = result.apellidos;
      var descTipoDoc = result.descTipoDoc;
      var idDocumento = result.idDocumento;
      $(".tipoDocpaso2").html(descTipoDoc);
      $(".idepaso2").html(idDocumento);
      $(".nombrespaso2").html(nombres);
      $(".apellidopaso2").html(apellidos);
      $(".validacionBio").html(
        "<span valor='" +
          idValidacionIdentidad +
          "' class='LinkValidacionIdentidad'>" +
          idValidacionIdentidad +
          "</span>"
      );
      //            $(".infoPersonaTramiteNotarial").html("<span>" + nombres + " " + apellidos + "</span><span>" + descTipoDoc + " " + idDocumento + "</span><span>Validación Biométrica <span valor='" + idValidacionIdentidad + "' class='LinkValidacionIdentidad'>" + idValidacionIdentidad + "</span></span>");
      $(".continuar")
        .off()
        .on("click", function () {
          $(".divpaso2").removeClass("hidden");
			$("#defDedosManu,#defDedosManuSelect").addClass("hidden");
          $(".divpaso1").addClass("hidden");
          $(".textPaso").html("Paso 2 de 2: Tramite Notarial");
          $(this).addClass("hidden");
          $(".validarServicio").remove();
        });
      $(".selectTramite,.selectPlantilla")
        .off()
        .on("change", function () {
          $(".previsualizar").remove();
          if (
            $(".selectTramite").val() !== "0" &&
            $(".selectPlantilla").val() !== "0"
          ) {
            $(".continuar").after(
              "<button class='btn btn-blue previsualizar'>Previsualizar</button>"
            );
          } else {
            $(".registerTramite").remove();
          }
          $(".previsualizar")
            .off()
            .on("click", function () {
              previsualizar();
            });
        });
      $(".LinkValidacionIdentidad")
        .off()
        .on("click", function () {
          var valor = $(this).attr("valor");
          validacionGl = valor;
          cargarInfoValidacionIde(valor);
        });
    }
    searchStateFingers();
  };
  spinner("Validando Identidad ");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function recargarInfo() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
    accion: RECARGAR_INFO,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    var validations = result.validations;

    //         if (validations[propiedad].valor) {
    //                var clase = "greenValidate";
    //                var textValidate = "Correcto";
    //            } else {
    //                var clase = "redValidate";
    //                var textValidate = "Incorrecto";
    //                erroresValidation++;
    //                span.addClass("alertCaptura");
    //            }
    //            contenedor.addClass(clase);
    //            spanValidate.text(textValidate).addClass(textValidate);
    for (let propiedad in validations) {
      var clase = "";
      var contenedor = $(".divval" + validations[propiedad].nombre);
      contenedor.html(validations[propiedad].valor);
      if (validations[propiedad].nombre === "identificacionValidate") {
        contenedor.html(
          result.descTipoDoc + " " + validations[propiedad].valor
        );
      }
      if (
        validationsGlobal[propiedad].retornado === validations[propiedad].valor
      ) {
        contenedor.removeClass("alertCaptura");
        clase = "greenValidate";
      } else {
        clase = "redValidate";
        //                var textValidate = "Incorrecto";
      }
      contenedor.addClass(clase);
    }
  };
  spinner("Recargando información");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function cargarInfoValidacionIde(validacion) {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var parametros = {
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
    accion: VALIDACION_IDENTIDAD_INFO,
    validacion: validacion,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    var data = result.data;
    for (let propiedad in data) {
      $(".divResult" + propiedad).html(data[propiedad]);
    }
    $(".selectdedos").each(function (i, o) {
      var element = $(o);
      var finger = element.attr("finger");
      var valSelect = $(
        ".selectdedos[finger='" + finger + "']  option:selected"
      );
      $(".divContDedo" + finger).html(valSelect.text());
    });
    $("#modalResultValidate").modal("show");
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function previsualizar() {
  var tramite = $(".selectTramite").val();
  var plantilla = $(".selectPlantilla").val();
  var parametros = {
    tramite: tramite,
    plantilla: plantilla,
    accion: PREVISUALIZAR,
    validacion: validacionGl,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    $(".plantillaInfoDiv").removeClass("hidden");
    $(".plantillaTxtInfo").html(result.minuta);
    //        $(".plantillaTxtInfo table tbody tr:eq(0) td:eq(0)").html("<div class='divImgPrev'><img class='imgPrevDoc' src='" + fotoCapturada + "'></div>")
    $(".previsualizar")
      .after("<button class='btn btn-blue registerTramite'>Registrar</button>")
      .remove();
    $(".registerTramite")
      .off()
      .on("click", function () {
        registrarTramite();
      });
  };
  spinner("Previsualizando documento");
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}

function registrarTramite() {
  var idTipoDoc = $("#tiposDoc").val();
  var idDocumento = $("#identificacion").val();
  var tramite = $(".selectTramite").val();
  var plantilla = $(".selectPlantilla").val();
  var minutaHtml = $(".plantillaTxtInfo").html();
  var parametros = {
    tramite: tramite,
    plantilla: plantilla,
    accion: REGISTRAR_TRAMITE,
    validacion: validacionGl,
    idTipoDoc: idTipoDoc,
    idDocumento: idDocumento,
  };
  var miCallback = function (callbackParams, result, estado) {
    if (!estado || !result.success) {
      return;
    }
    location.href = "../general/downfile.php?downfile=" + result.rutaPdf;
    setTimeout(function () {
      location.reload();
    }, 3000);
  };
  utilidadesjQuery.ajax(
    "../../modulos/biometria/BiosignoWeb.php",
    parametros,
    miCallback,
    null,
    this
  );
}
function initGeoCoder() {
  geocoder = new google.maps.Geocoder();
}

function geocodeLatLng(geocoder, lat, lng, callback) {
  var retorno = {};
  const latlng = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };
  geocoder.geocode({ location: latlng }, (results, status) => {
    retorno.status = status;
    if (status === "OK") {
      arGeocoder = results;
      var arPostalCode = results.find((x) => {
        return x.types.find((y) => y == "postal_code") !== undefined;
      });
      if (arPostalCode !== undefined) {
        var arAddresComponents = arPostalCode.address_components;
        var objPostalCode = arAddresComponents.find((x) => {
          return x.types.find((y) => y == "postal_code") !== undefined;
        });
        var objDepartamento = arAddresComponents.find((x) => {
          return (
            x.types.find((y) => y == "administrative_area_level_1") !==
            undefined
          );
        });
        var objPais = arAddresComponents.find((x) => {
          return x.types.find((y) => y == "country") !== undefined;
        });

        retorno.departamento = objDepartamento.long_name;
        retorno.pais = objPais.long_name;
        retorno.codigopostal = objPostalCode.long_name;
        retorno.direccion = arPostalCode.formatted_address;
      } else {
        retorno.status = "No se encontro direccion";
      }
    }
    callback.call(this, retorno);
  });
}

function validarLocation() {
  navigator.permissions
    .query({ name: "geolocation" })
    .then(function (permissionStatus) {
      if (
        permissionStatus.state.trim() === "prompt" ||
        permissionStatus.state.trim() === "denied"
      ) {
        jAlert(
          "Por favor habilite los permisos en el navegador",
          "Alerta del Sistema"
        );
        return;
      }
    });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(validarPocision);
  } else {
    jAlert(
      "Geolocalizacion no es soportada por este Navegador",
      "Alerta del Sistema"
    );
    return false;
  }
}

function validarPocision(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
}
function activarCapturaDedoAccion() {
  $(".capturaDedo").on("click", function () {
    var dedoescogido = $(this).attr("finger");
    var dedodemano = $(".selectdedos[finger='" + dedoescogido + "']").val();
    actualizarSerial(dedodemano, dedoescogido);
  });
}
function validateSession() {
  intervalTimeSession = setInterval(function () {
    var parametros = { accion: VALIDATE_SESSION, ventana: window.name };
    var miCallback = function (callbackParams, result, estado) {
      if (!estado || !result.success) {
        location.href = "../../modulos/principal/menu.php";
        return;
      }
      if (result.finalizoSesion) {
        clearInterval(intervalTimeSession);
        jAlert(
          "Su sesion para Biosigno web ha finalizado,por favor ingrese nuevamente ",
          "Alerta de sistema",
          function () {
            cerrarSesiones(false);
            location.href = "../../modulos/principal/menu.php";
            return;
          }
        );
      }
    };
    utilidadesjQuery.ajax(
      "../../modulos/biometria/BiosignoWeb.php",
      parametros,
      miCallback,
      null,
      this,
      true,
      "",
      true
    );
  }, 5000);
}
function updateFingersReactive() {
  if (fingersDontHave.length > 0) {
    $(".selectdedos").each(function (i, obj) {
      $(fingersDontHave).each(function (j, objInt) {
        $(obj)
          .find("option[value='" + objInt.iddedo + "']")
          .remove();
        const idsARemover = fingersDontHave.map((objeto) => objeto.iddedo);
        dedosnum = dedosnum.filter((valor) => !idsARemover.includes(valor));
        //                console.log(dedosnum);
      });
    });
  }
  cargarFingersAll();
}
function updateFingersValidateReactive() {
  if (fingersVerifiedToday.length > 0) {
    $(".selectdedos").each(function (i, obj) {
      $(fingersVerifiedToday).each(function (j, objInt) {
        $(obj)
          .find("option[value='" + objInt.iddedo + "']")
          .remove();
        const idsARemover = fingersVerifiedToday.map((objeto) => objeto.iddedo);
        dedosnum = dedosnum.filter((valor) => !idsARemover.includes(valor));
      });
    });
  }
  cargarFingersAll();
}
function verificarLectorBiometrico(url) {
  spinner("Estableciendo comunicaci&oacute;n con el lector Biometrico");
  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    format: "json",
    success: function (json) {
      if (json.result !== 0) {
        $(".intCapturaDiv").removeClass("success").addClass("noSuccess");
        $(".checkmark").addClass("hidden");
        $(".crossmark").removeClass("hidden");
        $(".spantextcapture")
          .text(json.msg)
          .addClass("colorNoSuccess")
          .removeClass("colorSuccess");
      } else {
        $(".checkmark").removeClass("hidden");
        $(".crossmark").addClass("hidden");
        $(".intCapturaDiv").removeClass("noSuccess").addClass("success");
        $(".spantextcapture")
          .text("El capturador se encuentra vinculado correctamente")
          .addClass("colorSuccess")
          .removeClass("colorNoSuccess");
      }
      spinner(false);
    },
    error: function (error) {
      spinner(false);
      $(".checkmark").addClass("hidden");
      $(".crossmark").removeClass("hidden");
      $(".intCapturaDiv").removeClass("success").addClass("noSuccess");
      $(".spantextcapture")
        .text("No se encuentra vinculado el capturador")
        .addClass("colorNoSuccess")
        .removeClass("colorSuccess");
    },
  });
}
