<?php

require_once "../../clases/Framework.php";
require_once "../../modulos/publico/funciones_informes.php";
require_once "../../modulos/publico/constantes_signo.php";
require_once "../../modulos/publico/funciones_consultas.php";
require_once "../../modulos/publico/funciones_signo.php";
require_once '../../modulos/publico/ConexionAPI.php';
require_once "../../modulos/publico/html2pdf_v4/utilidadesPDF2011.php";
require_once('../../modulos/publico/phpqrcode/phpqrcode.php');
$miFramework = new FrameWork("signo", "configuracion/config.cfg", $cambiarmanejadorDeErrores = true, $creacionSesion = true, $iniciarTransaccion = true);

/**
 * Description of BiosignoWeb
 *
 * @author jairo.pabon
 */
class BiosignoWeb extends InterfazBase
{

	const CARGAR_INFO = 100;
	const VERIFICAR_CLIENTE = 101;
	const VALIDACION_LOGIN_BIOMETRIA = 102;
	const VALIDACION_HUELLA_BIOMETRIA = 103;
	const RECARGAR_INFO = 104;
	const VALIDACION_IDENTIDAD_INFO = 105;
	const PREVISUALIZAR = 106;
	const REGISTRAR_TRAMITE = 107;
	const VALIDAR_VALIDACION_IDENTIDAD = 108;
	const GUARDAR_AUDITORIA_FINGER = 109;
	const VALIDAR_SESION = 110;
	const ACEPT_TERMS = 111;
	const REJECT_TERMS = 112;
	const DEFINIR_DEDOS_MANU = 113;
	const DIE_SESION = 114;
	const REGISTRAR_DEDO_NO_TIENE = 115;
	const BORRAR_DEDO_NO_TIENE = 116;
	const SEARCH_STATE_FINGERS = 117;

	public function __construct(ArrayObject $args = NULL, FrameWork $frameWork = NULL)
	{

		parent::__construct($args, $frameWork);
		$accion = $this->getInt('accion');
		switch ($accion) {
			case BiosignoWeb::CARGAR_INFO: {
					$this->cargarInfo();
					break;
				}
			case BiosignoWeb::VERIFICAR_CLIENTE: {
					$this->verificarCliente();
					break;
				}
			case BiosignoWeb::VALIDACION_LOGIN_BIOMETRIA: {
					$this->validacionLoginBiometria();
					break;
				}
			case BiosignoWeb::VALIDACION_HUELLA_BIOMETRIA: {
					$this->validacionHuellaBiometrica();
					break;
				}
			case BiosignoWeb::RECARGAR_INFO: {
					$this->recargarInfo();
					break;
				}
			case BiosignoWeb::VALIDACION_IDENTIDAD_INFO: {
					$this->validacionIdentidadInfo();
					break;
				}
			case BiosignoWeb::PREVISUALIZAR: {
					$this->previsualizar();
					break;
				}
			case BiosignoWeb::REGISTRAR_TRAMITE: {
					$this->registrarTramite();
					break;
				}
			case BiosignoWeb::VALIDAR_VALIDACION_IDENTIDAD: {
					$this->validarValidacionIdentidad();
					break;
				}
			case BiosignoWeb::GUARDAR_AUDITORIA_FINGER: {
					$this->guardarAuditoriaFinger();
					break;
				}
			case BiosignoWeb::VALIDAR_SESION: {
					$this->validarSesion(true);
					break;
				}
			case BiosignoWeb::ACEPT_TERMS: {
					$this->aceptTerms();
					break;
				}
			case BiosignoWeb::REJECT_TERMS: {
					$this->rejectTerms();
					break;
				}
			case BiosignoWeb::DEFINIR_DEDOS_MANU: {
					$this->definirDedosManu();
					break;
				}
			case BiosignoWeb::DIE_SESION: {
					$this->dieSesion();
					break;
				}
			case BiosignoWeb::REGISTRAR_DEDO_NO_TIENE: {
					$this->registerFingersDontHave();
					break;
				}
			case BiosignoWeb::BORRAR_DEDO_NO_TIENE: {
					$this->deleteFingersDontHave();
					break;
				}
			case BiosignoWeb::SEARCH_STATE_FINGERS: {
					$this->searchStateFingers();
					break;
				}

			default: {
					echo json_encode($this->retorno);
					break;
				}
		}
	}

	protected function dieSesion()
	{
		$conexion = $this->frameWork->getConexion();
		$ventana = $this->getString("ventana");
		$conexion->begin();
		//        if (isset($_SESSION['session_key_biosigno'])) {
		$hoy = time();
		$fecha_actual = date("Y-m-d H:i:s", $hoy);
		if (isset($_SESSION['session_key_biosigno'])) {
			$conexion->ejecutar("delete from biosignowebsesion  where   session_key='" . $_SESSION['session_key_biosigno'] . "';");
			unset($_SESSION['session_key_biosigno']);
		} else {
			$conexion->ejecutar("delete from biosignowebsesion  where ventana='$ventana';");
		}

		$conexion->commit();

		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function registerFingersDontHave()
	{
		$finger = $this->getString("finger");
		$idTipoDoc = $this->getString("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");

		$iIdUsuario = $_SESSION['iIDUsuario'];
		$usuario = Usuario::crear($iIdUsuario);

		$tipoDocObj = TipoDocumento::crear($idTipoDoc);
		$personaObj = Persona::crearPersonaXTipoDocumento($tipoDocObj, $idDocumento);
		$nombreCompleto = $personaObj->getNombreCompleto();
		$descripcionDoc = $tipoDocObj->getDescripcion();

		$dedo = Dedos::crear($finger);
		$dedoDes = $dedo->getDescripcion();

		$descripcionAud = "Se informa que el ciudadano " . $nombreCompleto . " identificado con " . $descripcionDoc . " $idDocumento no tiene el dedo " . $dedoDes;

		$auditoria = new Auditoria();
		$accionAuditable = AccionAuditable::crear(AccionAuditable::Modificacion);
		$auditoria->setAccionAuditable($accionAuditable);
		$tarea = Tarea::crear(840);
		$auditoria->setTarea($tarea);
		$auditoria->setUsuario($usuario);
		$auditoria->setDescripcion($descripcionAud);
		$auditoria->guardarObjeto();

		$auditoriaPrincipal = new AuditoriaPrincipal();
		$auditoriaPrincipal->setIdEvento(841);
		$auditoriaPrincipal->setIdUsuario($iIdUsuario);
		$auditoriaPrincipal->setFecha(date("Y-m-d H:i:s"));
		$auditoriaPrincipal->setDescripcion($descripcionAud);
		$auditoriaPrincipal->guardarObjeto($auditoria);

		$biosignowebsindedos = new BioSignoWebCiudadanoSinDedos();
		$biosignowebsindedos->setId_documento($idDocumento);
		$biosignowebsindedos->setTipo_documento($idTipoDoc);
		$biosignowebsindedos->setIddedo($finger);
		$biosignowebsindedos->guardarObjeto($auditoria);

		$fingersDontHave = BioSignoWebCiudadanoSinDedos::listar("where id_documento='$idDocumento' and tipo_documento=$idTipoDoc", RecordSet::FORMATO_ARRAY, "*");
		foreach ($fingersDontHave as $finger) {
			$fingerVal = $finger->iddedo;
			$objFinger = Dedos::crear($fingerVal);
			$finger->description = $objFinger->getDescripcion();
		}

		$this->retorno->msg = "";
		$this->retorno->fingersDontHave = $fingersDontHave;
		echo json_encode($this->retorno);
	}

	protected function deleteFingersDontHave()
	{
		$finger = $this->getString("finger");
		$idTipoDoc = $this->getString("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");

		$iIdUsuario = $_SESSION['iIDUsuario'];
		$usuario = Usuario::crear($iIdUsuario);

		$tipoDocObj = TipoDocumento::crear($idTipoDoc);
		$personaObj = Persona::crearPersonaXTipoDocumento($tipoDocObj, $idDocumento);
		$nombreCompleto = $personaObj->getNombreCompleto();
		$descripcionDoc = $tipoDocObj->getDescripcion();

		$dedo = Dedos::crear($finger);
		$dedoDes = $dedo->getDescripcion();

		$descripcionAud = "Se elimina el registro del ciudadano $nombreCompleto identificado con $descripcionDoc $idDocumento donde se indicaba que no tiene el dedo $dedoDes";

		$auditoria = new Auditoria();
		$accionAuditable = AccionAuditable::crear(AccionAuditable::Modificacion);
		$auditoria->setAccionAuditable($accionAuditable);
		$tarea = Tarea::crear(840);
		$auditoria->setTarea($tarea);
		$auditoria->setUsuario($usuario);
		$auditoria->setDescripcion($descripcionAud);
		$auditoria->guardarObjeto();

		$auditoriaPrincipal = new AuditoriaPrincipal();
		$auditoriaPrincipal->setIdEvento(841);
		$auditoriaPrincipal->setIdUsuario($iIdUsuario);
		$auditoriaPrincipal->setFecha(date("Y-m-d H:i:s"));
		$auditoriaPrincipal->setDescripcion($descripcionAud);
		$auditoriaPrincipal->guardarObjeto($auditoria);

		//        $biosignowebsindedos=BioSignoWebCiudadanoSinDedos::crear($idDocumento, $idTipoDoc, $finger);
		$biosignowebsindedos = new BioSignoWebCiudadanoSinDedos(array($idDocumento, $idTipoDoc, $finger));
		$biosignowebsindedos->borrarObjeto($auditoria);

		$fingersDontHave = BioSignoWebCiudadanoSinDedos::listar("where id_documento='$idDocumento' and tipo_documento=$idTipoDoc", RecordSet::FORMATO_ARRAY, "*");
		foreach ($fingersDontHave as $finger) {
			$fingerVal = $finger->iddedo;
			$objFinger = Dedos::crear($fingerVal);
			$finger->description = $objFinger->getDescripcion();
		}

		$this->retorno->msg = "";
		$this->retorno->fingersDontHave = $fingersDontHave;
		echo json_encode($this->retorno);
	}

	protected function searchStateFingers()
	{
		$idTipoDoc = $this->getString("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];
		$dia = $fechaExplode[2];

		$fingersDontHave = $this->funcionFingersDontHave($idDocumento, $idTipoDoc);

		//aa continuacion validaciones para ver que por dia , haya validado la maxima cantidad
		$fingersVerifiedToday = $this->funcionFingersValidate($idDocumento, $idTipoDoc, "200", "$anio-$mes-$dia 00:00:00", "$anio-$mes-$dia 23:59:59");

		$this->retorno->msg = "";
		$this->retorno->fingersDontHave = $fingersDontHave;
		$this->retorno->fingersVerifiedToday = $fingersVerifiedToday;
		echo json_encode($this->retorno);
	}

	protected function aceptTerms()
	{
		$iModo = $this->frameWork->getModo();
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$tratamientoText = $this->getString("tratamientoText");
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];

		$rutaPDF = "tmp/BiometriaTerminos_" . $fechaActual . "_$idDocumento.pdf";
		$conexion = $this->frameWork->getConexion();
		$spool = FrameWork::getSpool();
		validarEscritura($spool . $rutaPDF);
		$iqual = 5;
		$configPDF = array(
			"cuadricula" => true,
			"orientacion" => 'P',
			"encabezado_doc" => false,
			"mLeft" => $iqual,
			"mTop" => 2,
			"mRight" => 15,
			"mBottom" => $iqual,
			"num_pags" => false,
		);
		$html2pdf = iniciarPDF($conexion, "", "", $configPDF, true, true);
		obtenerMargenes($html2pdf);
		$unidadPorcentual = $html2pdf->margins["widthAvailable"] / 100;
		/* Seccion de descripcion de los datos iniciales */
		$html2pdf->pdf->SetLineStyle(array("width" => 0.20, "color" => array(179, 177, 178)));
		$html2pdf->pdf->SetTextColor(77, 77, 78);
		//        var_dump($biosignoServicio->getMinuta());
		$explodeTexto = explode("<table", $tratamientoText, 2);
		$strPdf = $explodeTexto[0];
		$bandera = true;
		$html2pdf->pdf->Rect(0, 0, $html2pdf->pdf->getPageWidth(), $html2pdf->pdf->getPageHeight());
		while ($bandera && isset($explodeTexto[1])) {
			//           busca final de la tabla
			$explodeTexto2 = explode("</table>", $explodeTexto[1], 2);
			//                busca tr incial
			$explodeTr = explode("<tr", $explodeTexto2[0], 2);
			//           busca tr final
			$explodeTr2 = explode("</tr>", $explodeTr[1], 2);
			//           cuenta los td que existan en el primer tr de la tabla
			$totalTD = substr_count($explodeTr2[0], "<td");
			//            divido el 100% en el numero de tds de la tabla
			$valorWidth = (100 / $totalTD);
			//            le asigno el estilo con el valor que tendra el width
			$calculoWidth = "style='width:" . number_format($valorWidth, 2, '.', ',') . "%;'";
			//            remplazo a las etiquetas td el td con el tamaño de width calculado
//            var_dump($explodeTexto2[0]);
			$posicion_coincidencia = strpos($explodeTexto2[0], "border: 0px none;");
			if ($posicion_coincidencia === false) {

			} else {
				$calculoWidth = "style='width:" . number_format($valorWidth, 2, '.', ',') . "%;border: 0px none;'";
			}
			$nuevo = str_replace("<td", "<td " . $calculoWidth, $explodeTexto2[0]);
			//            asigno a la etiqueta table el el string dentro de la tabla con los td con estilo ya reemplazado
			$strPdf .= "<table" . $nuevo . "</table>";
			$explodeSig = explode("<table", $explodeTexto2[1], 2);
			if (count($explodeSig) > 1) {
				//                si existe una siguiente tabla
				$strPdf .= $explodeSig[0];
				$explodeTexto[1] = $explodeSig[1];
			} else {
				//                si no existen mas tablas
				$strPdf .= (isset($explodeTexto2[1]) ? $explodeTexto2[1] : '');
				$bandera = false;
			}
		}

		$html2pdf->writeHTML("<div class='brIni'>" . $strPdf . "<br><span>Aceptado por el compareciente el " . fechaFormatoConHora($fechaActual, false) . "</span></div>");
		finalizarPDF($html2pdf, $spool . $rutaPDF);

		$bio = new BiosignoWebATDP();
		$bio->setFecha($fechaActual);
		$bio->setTipo_documento($idTipoDoc);
		$bio->setId_documento($idDocumento);
		$bio->setActeptotdp('t');
		$bio->guardarObjeto();
		$idBiosigno = $bio->getIdbiosignowebatdp();

		if ($iModo == FrameWork::LOCAL) {
			$directorioBiometricoTerminos = $this->frameWork->getRootPath() . "../imagenes/biosignoweb/atdp/" . $anio . "/" . $mes . "/" . $idBiosigno . ".pdf";
		} else {
			$directorioBiometricoTerminos = $this->frameWork->getCarpetaNotarial() . "imagenes/biosignoweb/atdp/" . $anio . "/" . $mes . "/" . $idBiosigno . ".pdf";
		}
		$this->copiarArchivo($directorioBiometricoTerminos, base64_encode(file_get_contents($spool . $rutaPDF)));

		$this->retorno->msg = "";
		$this->retorno->rutaPdf = $rutaPDF;
		echo json_encode($this->retorno);
	}

	protected function rejectTerms()
	{
		$iModo = $this->frameWork->getModo();
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];

		$bio = new BiosignoWebATDP();
		$bio->setFecha($fechaActual);
		$bio->setTipo_documento($idTipoDoc);
		$bio->setId_documento($idDocumento);
		$bio->setActeptotdp('f');
		$bio->guardarObjeto();

		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function definirDedosManu()
	{
		$fecha = date("Y-m-d H:i:s");
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$usuario = Usuario::crear($iIdUsuario);
		$dedo1Sel = $this->getString("dedo1Sel");
		$dedo2Sel = $this->getString("dedo2Sel");
		$dedo1definido = $this->getString("dedo1definido");
		$dedo2definido = $this->getString("dedo2definido");
		$motivocambio = $this->getString("motivocambio");
		$cliente = $this->getString("cliente");
		$cambioDedo1 = false;
		$cambioDedo2 = false;
		$msg = "";
		$objdedo1 = Dedos::crear($dedo1definido);
		$objdedo2 = Dedos::crear($dedo2definido);
		if (($dedo1Sel !== $dedo1definido) && $dedo1definido !== '0') {
			$cambioDedo1 = true;
			$objdedo1Val = $objdedo1->getDescripcion();
		}
		if (($dedo2Sel !== $dedo2definido) && $dedo2definido !== '0') {
			$cambioDedo2 = true;
			$objdedo2Val = $objdedo2->getDescripcion();
		}
		if (($cambioDedo1 && $dedo1definido !== '0') && ($cambioDedo2 && $dedo2definido !== '0')) {
			$msg = "Se ha seleccionado manualmente capturar el dedo1: $objdedo1Val y dedo 2: $objdedo2Val para la validación de identidad del cliente con identificación $cliente por el motivo: $motivocambio";
		}
		if ($cambioDedo1 && !$cambioDedo2) {
			$msg = "Se ha seleccionado manualmente capturar el dedo 1: $objdedo1Val para la validación de identidad del cliente con identificación $cliente por el motivo: $motivocambio";
		} else if (!$cambioDedo1 && $cambioDedo2) {
			$msg = "Se ha seleccionado manualmente capturar el dedo 2: $objdedo2Val para la validación de identidad del cliente con identificación $cliente por el motivo: $motivocambio";
		}

		$auditoria = new Auditoria();
		$accionAuditable = AccionAuditable::crear(AccionAuditable::Modificacion);
		$auditoria->setAccionAuditable($accionAuditable);
		$tarea = Tarea::crear(840);
		$auditoria->setTarea($tarea);
		$auditoria->setUsuario($usuario);
		$auditoria->setDescripcion($msg);
		$auditoria->guardarObjeto();

		$auditoriaPrincipal = new AuditoriaPrincipal();
		$auditoriaPrincipal->setIdEvento(841);
		$auditoriaPrincipal->setIdUsuario($iIdUsuario);
		$auditoriaPrincipal->setFecha($fecha);
		$auditoriaPrincipal->setDescripcion($msg);
		$auditoriaPrincipal->guardarObjeto($auditoria);
		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function validarValidacionIdentidad()
	{
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$dateActual = date("Y-m-d");

		$biovalidate = BiosignoWebValidacionIdentidad::listar(RecordSet::FORMATO_ARRAY, "where tipo_documento=$idTipoDoc and id_documento='$idDocumento' and fecharegistro BETWEEN '$dateActual 00:00:00' AND '$dateActual 23:59:59'", "*");
		$this->retorno->val = $biovalidate;
		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function guardarAuditoriaFinger()
	{
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$usuario = Usuario::crear($iIdUsuario);
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$dedoDesc = $this->getString("dedoDesc");
		$fecha = date("Y-m-d H:i:s");

		$tipoDocumento = TipoDocumento::crear($idTipoDoc);
		$descdoc = $tipoDocumento->getDescripcion();

		$desc = "Se ha seleccionado manualmente capturar el dedo $dedoDesc para la validación de identificad del cliente con identificación $descdoc $idDocumento";
		$auditoria = new Auditoria();
		$accionAuditable = AccionAuditable::crear(AccionAuditable::Modificacion);
		$auditoria->setAccionAuditable($accionAuditable);
		$tarea = Tarea::crear(840);
		$auditoria->setTarea($tarea);
		$auditoria->setUsuario($usuario);
		$auditoria->setDescripcion($desc);
		$auditoria->guardarObjeto();

		$auditoriaPrincipal = new AuditoriaPrincipal();
		$auditoriaPrincipal->setIdEvento(841);
		$auditoriaPrincipal->setIdUsuario($iIdUsuario);
		$auditoriaPrincipal->setFecha($fecha);
		$auditoriaPrincipal->setDescripcion($desc);
		$auditoriaPrincipal->guardarObjeto($auditoria);
		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function cargarInfo()
	{
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$db = $this->frameWork->getConexion();
		$nombreVentana = $this->getString("ventana");
		$_SESSION["ventanabiosigno"] = $nombreVentana;
		$fecActual = date("Y-m-d H:i:s");
		$sql = " select session_key,ventana,fecha_expiracion from biosignowebsesion where id_usuario='$iIdUsuario'";
		$rsDatos = $db->consultar($sql);
		$resultDatos = $rsDatos->getRegistros();

		if (count($resultDatos) > 0) {
			if ($resultDatos[0]->fecha_expiracion < $fecActual) {
				$sqlDelete = "delete from biosignowebsesion where id_usuario='$iIdUsuario' and fecha_expiracion <'" . $fecActual . "'";
				$db->ejecutar($sqlDelete);
			}
			$rsDatos = $db->consultar($sql);
			$resultDatosPost = $rsDatos->getRegistros();
			//            var_dump($resultDatosPost);
			if (count($resultDatosPost) > 0 && $resultDatosPost[0]->ventana !== $nombreVentana) {
				throw new AppException("se ha detectado una sesion activa para este usuario, continue en esa ventana el proceso Biometrico");
			} else if (count($resultDatosPost) > 0 && $resultDatosPost[0]->ventana === $nombreVentana) {
				//                var_dump($resultDatosPost);
//                var_dump($nombreVentana);
				throw new AppException("se ha detectado una ventana ya abierta para esta sesion");
			}
		}

		$tiposDoc = TipoDocumento::listar(RecordSet::FORMATO_ARRAY, "where estado and aplica_persona and descripcion_tipo in('C.C.','CC')", "tipo_documento,descripcion_tipo,nombre_extendido");
		$dedos = Dedos::Listar(RecordSet::FORMATO_ARRAY, "", "*");

		$tramiteNotarial = ACTOSSNRR826::listar("where biosignoweb ='t'", RecordSet::FORMATO_ARRAY, "*");
		$plantillas = PlantillaDocumento::listar(RecordSet::FORMATO_ARRAY, "where idplantilladocumentocategoria =26;", "*");

		$timeMaxValidador = VariableEntorno::crear(455)->getValorVariable();
		$timeMaxInactividad = VariableEntorno::crear(457)->getValorVariable();
		$restartTime = VariableEntorno::crear(456)->getValorVariable();
		$sesionState = $this->validarSesion();

		$this->retorno->msg = "";
		$this->retorno->tiposDoc = $tiposDoc;
		$this->retorno->tramiteNotarial = $tramiteNotarial;
		$this->retorno->plantillas = $plantillas;
		$this->retorno->dedos = $dedos;
		$this->retorno->timeMaxValidador = $timeMaxValidador;
		$this->retorno->timeMaxInactividad = $timeMaxInactividad;
		$this->retorno->restartTime = $restartTime;
		$this->retorno->sesionState = $sesionState;
		$this->retorno->securi = $this->frameWork->getSecureuripswd();
		echo json_encode($this->retorno);
	}

	protected function validarSesion($ajax = null)
	{
		$db = $this->frameWork->getConexion();
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$hoy = time();
		$fecha_actual = date("Y-m-d H:i:s", $hoy);
		$timeMaxValidador = VariableEntorno::crear(457)->getValorVariable();
		$fechaExpiracion = date("Y-m-d H:i:s", $hoy + ($timeMaxValidador * 60));
		$finalizoSesion = false;
		$sql = " select session_key,ventana from biosignowebsesion where id_usuario='$iIdUsuario'";
		$rsDatos = $db->consultar($sql);
		$resultDatos = $rsDatos->getRegistros();
		$ventana = $_SESSION["ventanabiosigno"];
		if (count($resultDatos) > 0) {
			if ($resultDatos[0]->ventana !== $ventana) {
				throw new AppException("Se ha detectado otra sesion activa para su usuario");
			}
			$_SESSION['session_key_biosigno'] = $resultDatos[0]->session_key;
		}

		if (!isset($_SESSION['session_key_biosigno'])) {
			$_SESSION['session_key_biosigno'] = $hoy;
			$db->ejecutar("insert into biosignowebsesion (id_usuario,session_key,fecha_expiracion,activo,ventana) values ($iIdUsuario,'" . $_SESSION['session_key_biosigno'] . "','" . $fechaExpiracion . "','t','" . $ventana . "');");
		}
		if ($ajax) {
			$this->retorno->finalizoSesion = $finalizoSesion;
			$this->retorno->sesion = isset($_SESSION['session_key_biosigno']) ? $_SESSION['session_key_biosigno'] : "";
			$this->retorno->msg = "";
			$this->userWithSesion = null;
			echo json_encode($this->retorno);
		} else {
			return $finalizoSesion;
		}
	}

	protected function verificarCliente()
	{
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$plantillatratamientoTxt = "";
		$tipoDocumento = TipoDocumento::crear($idTipoDoc);
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];
		$dia = $fechaExplode[2];

		$existeCliente = true;
		$respueta = new stdClass();
		try {
			$cliente = Persona::crearPersona($idTipoDoc, $idDocumento);
		} catch (Exception $exc) {
			$existeCliente = false;
		}

		if (!$existeCliente) {
			if ((empty($idDocumento) || trim($idDocumento) == "") && ($idTipoDoc == -2 || $idTipoDoc == -1)) {
				$nextvalNoPresento = TipoDocumento::nextvalNoPresento();
				$idDocumento = "N_" . $nextvalNoPresento;
			}
		} else {
			$respueta->nombre = $cliente->getNombres();
			$respueta->apellidos = $cliente->getApellidos();
			$respueta->domicilio = $cliente->getDomicilio();
			$respueta->telefono = $cliente->getTelefonos();
			$respueta->celular = $cliente->getCelular();
			$respueta->actividad = $cliente->getActividad();
			$respueta->email = $cliente->getEmail();
			$respueta->mensaje = "";
			$respueta->expedida = $cliente->getLugarExpedicion();
			$respueta->genero = $cliente->getSexo();
			$respueta->nombreCompleto = $cliente->getNombres() . " " . $cliente->getApellidos() . " " . $tipoDocumento->getDescripcion() . " " . $idDocumento;
			$plantillatratamiento = PlantillaDocumento::crear(9999)->getMinuta();
			VariableDocumento::agregarVariable("[:vINFOBIOSIGNO:]", $respueta->nombreCompleto);
			$plantillatratamientoTxt = VariableDocumento::getTextoArea($plantillatratamiento, TRUE);
		}

		//verificar si usuario no tiene dedos en la lista 
		$fingersDontHave = $this->funcionFingersDontHave($idDocumento, $idTipoDoc);

		//aa continuacion validaciones para ver que por dia , haya validado la maxima cantidad
		// $fingersVerifiedToday = $this->funcionFingersValidate($idDocumento, $idTipoDoc, "200", "$anio-$mes-$dia 00:00:00", "$anio-$mes-$dia 23:59:59");
		$fingersVerifiedToday=[];
		$respueta->idTipoDoc = $idTipoDoc;
		$respueta->descripcionTipo = $tipoDocumento->getDescripcion();
		$respueta->documento = $idDocumento;
		$respueta->existeCliente = $existeCliente;
		$respueta->plantillatratamientoTxt = $plantillatratamientoTxt;
		$respueta->fingersDontHave = $fingersDontHave;
		$respueta->fingersVerifiedToday = $fingersVerifiedToday;

		$this->retorno->data = $respueta;
		$this->retorno->msg = "";
		echo json_encode($this->retorno);
	}

	protected function validacionLoginBiometria()
	{
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];
		$dia = $fechaExplode[2];
		$BiometriaGseUrlLOGIN = VariableEntorno::crear(445)->getValorVariable();
		$BiometriaGseUser = VariableEntorno::crear(447)->getValorVariable();
		$BiometriaGseClave = VariableEntorno::crear(448)->getValorVariable();

		if (empty($BiometriaGseUrlLOGIN) || empty($BiometriaGseUser) || empty($BiometriaGseClave)) {
			throw new AppException("No se ha parametrizado correctamente los datos de conexion para Biometria");
		}

		$funcionFingersDontHave = $this->funcionFingersDontHave($idDocumento, $idTipoDoc);
		$funcionFingersValidate = $this->funcionFingersValidate($idDocumento, $idTipoDoc, "200", "$anio-$mes-$dia 00:00:00", "$anio-$mes-$dia 23:59:59");
		$objTipodoc = TipoDocumento::crear($idTipoDoc);
		$objpersona = Persona::crearPersonaXTipoDocumento($objTipodoc, $idDocumento);
		$nombrePersona = Validador::esTrue($objTipodoc->getAplicaPersona()) ? $objpersona->getNombreCompleto() : $objpersona->getNombre_empresa();
		$identificacion = $objTipodoc->getDescripcion() . " " . $idDocumento;
		$alertas=array();
		if (empty($funcionFingersDontHave)) {
			if (count($funcionFingersValidate) > 5) {
				$alertas[]="El ciudadano $nombrePersona $identificacion ha superado (5) el m&aacute;ximo de validaciones de identidad admitidas por d&iacute;a para un total de 10.";
			}
		} else {
			$dedosNotiene = count($funcionFingersDontHave);
			$maximovalidaciones = floor((10 - $dedosNotiene) / 2);
			if (count($funcionFingersValidate) > $maximovalidaciones) {
				$alertas[]="El ciudadano $nombrePersona $identificacion ha superado ($maximovalidaciones) el m&aacute;ximo de validaciones de identidad admitidas por d&iacute;a para un total de " . (10 - $dedosNotiene);

			}
		}

		$arrayHeaderCurl = array(
			'Content-Type: application/json',
		);
		$objLink = array(
			"user" => $BiometriaGseUser,
			"password" => $BiometriaGseClave,
			"encrypted" => true,
		);
		$conexionLinkPago = new ConexionAPI($BiometriaGseUrlLOGIN, true);
		$conexionLinkPago->agregarHeadersCurl($arrayHeaderCurl);
		$conexionLinkPago->setParametrosJson($objLink);
		$conexionLinkPago->realizarSolicitud();
		$response = $conexionLinkPago->getObjectRespuesta();

		$this->retorno->msg = "";
		$this->retorno->alertas=$alertas;
		$this->retorno->response = $response->result;
		echo json_encode($this->retorno);
	}

	protected function funcionFingersValidate($idDocumento, $idTipoDoc, $codeStatus, $fechaInicial, $fechaFinal)
	{
		$whereVal = "where id_documento ='$idDocumento' and tipo_documento=$idTipoDoc and codigoestado='$codeStatus' and fecharegistro between '$fechaInicial' and '$fechaFinal'";
		$sqlBiosignoValCantidad = BiosignoWebValidacionIdentidad::listar(RecordSet::FORMATO_ARRAY, $whereVal, " DISTINCT unnest(array[dedo1finger, dedo2finger]) AS iddedo");

		foreach ($sqlBiosignoValCantidad as $finger) {
			$finger->id_documento = $idDocumento;
			$finger->tipo_documento = $idDocumento;
			$fingerVal = $finger->iddedo;
			$objFinger = Dedos::crear($fingerVal);
			$finger->description = $objFinger->getDescripcion();
		}

		return $sqlBiosignoValCantidad;
	}

	protected function funcionFingersDontHave($idDocumento, $idTipoDoc)
	{
		$fingersDontHave = BioSignoWebCiudadanoSinDedos::listar("where id_documento='$idDocumento' and tipo_documento=$idTipoDoc", RecordSet::FORMATO_ARRAY, "*");
		foreach ($fingersDontHave as $finger) {
			$fingerVal = $finger->iddedo;
			$objFinger = Dedos::crear($fingerVal);
			$finger->description = $objFinger->getDescripcion();
		}
		return $fingersDontHave;
	}

	protected function validacionHuellaBiometrica()
	{
		$iModo = $this->frameWork->getModo();
		$iIdUsuario = $_SESSION['iIDUsuario'];
		$usuario = Usuario::crear($iIdUsuario);
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$dedosCapturados = $this->getString("dedosCapturados");
		$fotoCapturada = $this->getString("fotoCapturada");
		$jsonDedos = json_decode($dedosCapturados);
		$token = $this->getString("token");
		$latitude = $this->getString("latitude");
		$longitude = $this->getString("longitude");
		$dataSend = json_decode($this->getString("dataSend"));
		$fechaActual = date("Y-m-d H:i:s");
		$fechaExplode = explode(" ", $fechaActual);
		$fechaExplode = explode("-", $fechaExplode[0]);
		$anio = $fechaExplode[0];
		$mes = $fechaExplode[1];
		$dia = $fechaExplode[2];

		$tipoDocumento = TipoDocumento::crear($idTipoDoc);
		$cliente = Persona::crearPersona($idTipoDoc, $idDocumento);
		$nombreCliente = $cliente->getNombres();
		$apellidoCliente = $cliente->getApellidos();
		$expedicion = $cliente->getLugarExpedicion();

		$validacionIdentidad = VariableEntorno::crear(446)->getValorVariable();
		$BiometriaGseUser = VariableEntorno::crear(447)->getValorVariable();
		$clientId = VariableEntorno::crear(452)->getValorVariable();
		$businessUnitCode = VariableEntorno::crear(453)->getValorVariable();
		$typeProcessCode = VariableEntorno::crear(454)->getValorVariable();

		if (empty($validacionIdentidad) || empty($BiometriaGseUser) || empty($clientId) || empty($businessUnitCode) || empty($typeProcessCode)) {
			throw new AppException("No ha parametrizado los datos para la integracion Biometrica");
		}

		//aa continuacion validaciones para ver que por dia , haya validado la maxima cantidad
//        $this->funcionFingersValidate($idDocumento, $idTipoDoc, "200", "$anio-$mes-$dia 00:00:00", "$anio-$mes-$dia 23:59:59");



		$urlGse = parse_url($validacionIdentidad);
		$base_url = $urlGse['scheme'] . "://" . $urlGse['host'];
		$arrayHeaderCurl = array(
			'Content-Type: application/json',
			'Authorization:Bearer ' . $token
		);
		$arrayDedos = array();
		foreach ($jsonDedos as $dedo) {
			$objDedo = new stdClass();
			$objDedo->number = $dedo->dedo;
			$objDedo->format = "ISO-FMR";
			$objDedo->template = $dedo->huella;
			$arrayDedos[] = $objDedo;
		}
		//        $objDedo = new stdClass();
//        $objDedo->number = "1";
//        $objDedo->format = "ISO-FMR";
//        $objDedo->template = "4p5YtuhD1GJX1Xv5EVPNwtoQ+7M5SAF5q2dtttufTKsKKuodtbWSYIJFpQwkcqqeAtIyNulSoPJlEH+F0PJUtP7q7zQrFrxYeYISs8L3/IHj14M7VydWHn3XyVX913JTq4EDRhXmatr4XEIIJxXVOLscFmcU9htEUu3ALGvecRgCR5a0I0nAXWeuap5ryNyZeBSie0LW1rT3O6el3jubZ6Kf9mI6m2vDz932tTkxTZIdKR7Trg+py8efW4HoF7pREDm5VnYBEUS7+2rcQ9thkIbcq4SkwQmtBMU0Dag16Sz+zmnU0six2Y6VVm62sL217J1XJbUrnAdmxOXw+Fr1wmMrFw4YkV7bedgW/vdcj6s=";
//        $arrayDedos[] = $objDedo;
//        $objDedo = new stdClass();
//        $objDedo->number = "2";
//        $objDedo->format = "ISO-FMR";
//        $objDedo->template = "7YhX7w7hxHooyHdgpAVoWtBx7HxE0XvBzEFlmjorOCEvwzszn/jZT26cLDt1Vz6w/IXm1EriVX8VFwuB/YmREL3z4uGsiJS/DNRB99AWNORGUZNpcwDnb2dqmJ2laQwRRKh/imTYLlcU09rNqG5ps2FH4HuT9PT7DiZtWA3z33cXrQQuLvTNjlYdGJxC4XZKpAGxks1bxoZiCSgBtROaC3O8qv55p+UsT2ybYRGO2DTg+Na9hITsPpfpL1ZCyDmAqP9ax5t2WopCF9tQusGDT0kPZFUdFPe/XRW4TVInYxHkkGQJ+25UvfrCynan8P5smAXSMJjmgkUJRuSZW9M8fNiqeK4ctcU8AAA=";
//        $arrayDedos[] = $objDedo;
//        esto va a ser los de prueba 

		$objCandidate = new stdClass();
		$objCandidate->NIP = $idDocumento;
		$objCandidate->firstName = $nombreCliente;
		$objCandidate->lastName = $apellidoCliente;
		$objLink = array(
			"clientId" => $clientId,
			"businessUnitCode" => $businessUnitCode,
			"typeProcessCode" => $typeProcessCode,
			"ip" => $dataSend->addressI,
			"mac" => $dataSend->addressM,
			"serial" => $dataSend->serialD,
			"user" => $BiometriaGseUser,
			"latitude" => $latitude,
			"longitude" => $longitude,
			"fingers" => $arrayDedos,
			"candidate" => $objCandidate,
		);
		// var_dump($validacionIdentidad);
		$conexionLinkPago = new ConexionAPI($validacionIdentidad, true);
		$conexionLinkPago->agregarHeadersCurl($arrayHeaderCurl);
		// var_dump($arrayHeaderCurl);
		// var_dump(json_encode($objLink, JSON_UNESCAPED_SLASHES));
		$conexionLinkPago->setParametrosJson($objLink);
		$conexionLinkPago->realizarSolicitud();
		$response = $conexionLinkPago->getObjectRespuesta();
		// var_dump($response);
		try {
			$result = $response->result;
			$datosPersona = $result->candidateDetail;
			$fingers = $result->fingers;
		} catch (Exception $ex) {
			throw new AppException("Ha ocurrido un error intentelo de nuevo".$ex->getMessage());
		}
		if ($response->statusCode === 400) {
			throw new AppException("Ha ocurrido un error. Se obtuvo como respuesta " . $response->result->information . " se debe Realizar parametrizaci&oacute;n correcta en " . $base_url);
		}
		$valApellido = !empty($datosPersona->lastName2) ? $datosPersona->lastName1 . " " . $datosPersona->lastName2 : $datosPersona->lastName1;
		$valNombre = !empty($datosPersona->firstName2) ? $datosPersona->firstName1 . " " . $datosPersona->firstName2 : $datosPersona->firstName1;
		$arrayResultValidate = array();
		$identificacionValidate = $idDocumento === $datosPersona->nip;
		$nombreValidate = $nombreCliente === $valNombre;
		$apellidosValidate = $apellidoCliente === $valApellido;
		$expedicionValidate = $expedicion === $datosPersona->expeditionPlace;

		$objValidate = new stdClass();
		$objValidate->valor = $identificacionValidate;
		$objValidate->nombre = "identificacionValidate";
		$objValidate->retornado = $datosPersona->nip;
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $nombreValidate;
		$objValidate->nombre = "nombreValidate";
		$objValidate->retornado = $valNombre;
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $apellidosValidate;
		$objValidate->nombre = "apellidosValidate";
		$objValidate->retornado = $valApellido;
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $expedicionValidate;
		$objValidate->nombre = "expedicionValidate";
		$objValidate->retornado = $datosPersona->expeditionPlace;
		$arrayResultValidate[] = $objValidate;

		$maxid = BiosignoWebValidacionIdentidad::maxId() + 1;
		$directorioBiometricoFoto = '';
		if (!empty($fotoCapturada)) {
			$contenidoImagen = explode(",", $fotoCapturada);
			if ($iModo == FrameWork::LOCAL) {
				$directorioBiometricoFoto = $this->frameWork->getRootPath() . "../imagenes/biosignoweb/" . $anio . "/" . $mes . "/" . $dia . "/" . $maxid . ".jpg";
			} else {
				$directorioBiometricoFoto = $this->frameWork->getCarpetaNotarial() . "imagenes/biosignoweb/" . $anio . "/" . $mes . "/" . $dia . "/" . $maxid . ".jpg";
			}
			$this->copiarArchivo($directorioBiometricoFoto, $contenidoImagen[1]);
		}

		$biosignoRetorno = new BiosignoWebValidacionIdentidad();
		$biosignoRetorno->setFecharegistro(date("Y-m-d H:i:s"));
		$biosignoRetorno->setId_usuario($iIdUsuario);
		$biosignoRetorno->setTipo_documento($idTipoDoc);
		$biosignoRetorno->setId_documento($idDocumento);
		$biosignoRetorno->setTransaccionid($response->transactionId);
		$biosignoRetorno->setFechavalidacion($response->timestamp);
		$biosignoRetorno->setCodigoestado($response->statusCode);
		$biosignoRetorno->setMensajeestado($response->statusMessage);
		$biosignoRetorno->setCodigoinformacion($result->informationCode);
		$biosignoRetorno->setInformacion($result->information);
		$biosignoRetorno->setNut($result->nut);
		$biosignoRetorno->setIdentificacion($result->candidateDetail->nip);
		$biosignoRetorno->setPrimernombre($result->candidateDetail->firstName1);
		$biosignoRetorno->setSegundonombre($result->candidateDetail->firstName2);
		$biosignoRetorno->setParticula($result->candidateDetail->particle);
		$biosignoRetorno->setPrimerapellido($result->candidateDetail->lastName1);
		$biosignoRetorno->setSegundoapellido($result->candidateDetail->lastName2);
		$biosignoRetorno->setLugarexpedicion($result->candidateDetail->expeditionPlace);
		$biosignoRetorno->setFechaexpedicion($result->candidateDetail->expeditionDate);
		$biosignoRetorno->setValidez($result->candidateDetail->validity);
		if (!empty($result->fingers)) {
			$biosignoRetorno->setDedo1finger($result->fingers[0]->finger);
			$biosignoRetorno->setDedo1resultadovalidacion($result->fingers[0]->result ? "true" : "false");
			$biosignoRetorno->setDedo1score($result->fingers[0]->score);
			$biosignoRetorno->setDedo2finger($result->fingers[1]->finger);
			$biosignoRetorno->setDedo2resultadovalidacion($result->fingers[1]->result ? "true" : "false");
			$biosignoRetorno->setDedo2score($result->fingers[1]->score);
		}
		$biosignoRetorno->setFotografia($directorioBiometricoFoto);
		$biosignoRetorno->guardarObjeto();
		$idValidacionIdentidad = $biosignoRetorno->getIdvalidacionidentidad();
		//                
		$this->retorno->msg = "";
		$this->retorno->response = $response;
		$this->retorno->validations = $arrayResultValidate;
		$this->retorno->idValidacionIdentidad = $idValidacionIdentidad;
		$this->retorno->nombres = $nombreCliente;
		$this->retorno->apellidos = $apellidoCliente;
		$this->retorno->descTipoDoc = $tipoDocumento->getDescripcion();
		$this->retorno->idDocumento = $idDocumento;
		echo json_encode($this->retorno);
	}

	protected function recargarInfo()
	{
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$arrayResultValidate = array();

		$tipoDocumento = TipoDocumento::crear($idTipoDoc);
		$cliente = Persona::crearPersona($idTipoDoc, $idDocumento);
		$nombreCliente = $cliente->getNombres();
		$apellidoCliente = $cliente->getApellidos();
		$expedicion = $cliente->getLugarExpedicion();

		$objValidate = new stdClass();
		$objValidate->valor = $idDocumento;
		$objValidate->nombre = "identificacionValidate";
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $nombreCliente;
		$objValidate->nombre = "nombreValidate";
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $apellidoCliente;
		$objValidate->nombre = "apellidosValidate";
		$arrayResultValidate[] = $objValidate;
		$objValidate = new stdClass();
		$objValidate->valor = $expedicion;
		$objValidate->nombre = "expedicionValidate";
		$arrayResultValidate[] = $objValidate;

		$this->retorno->msg = "";
		$this->retorno->validations = $arrayResultValidate;
		$this->retorno->descTipoDoc = $tipoDocumento->getDescripcion();
		echo json_encode($this->retorno);
	}

	protected function validacionIdentidadInfo()
	{
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$idvalidacion = $this->getString("validacion");

		$objPerson = Persona::crearPersonaXTipoDocumento(TipoDocumento::crear($idTipoDoc), $idDocumento);

		$obj = new stdClass();
		$obj->IdeSign = TipoDocumento::crear($idTipoDoc)->getDescripcion() . " " . $idDocumento;
		$obj->NomSign = $objPerson->getNombres();
		$obj->ApellSign = $objPerson->getApellidos();
		$obj->expSign = $objPerson->getLugarExpedicion();
		$objBiometriaValidacion = BiosignoWebValidacionIdentidad::crear($idvalidacion);
		$obj->Nombre = !empty($objBiometriaValidacion->getSegundonombre()) ? $objBiometriaValidacion->getPrimernombre() . " " . $objBiometriaValidacion->getSegundonombre() : $objBiometriaValidacion->getPrimernombre();
		$obj->Apellido = !empty($objBiometriaValidacion->getSegundoapellido()) ? $objBiometriaValidacion->getPrimerapellido() . " " . $objBiometriaValidacion->getSegundonombre() : $objBiometriaValidacion->getPrimerapellido();
		$obj->Expedicion = $objBiometriaValidacion->getLugarexpedicion() . " " . $objBiometriaValidacion->getFechaexpedicion() . " " . $objBiometriaValidacion->getValidez();
		$resultdedo1 = $objBiometriaValidacion->getDedo1resultadovalidacion() === "true" ? "Exitoso" : "Fallido";
		$resultdedo2 = $objBiometriaValidacion->getDedo2resultadovalidacion() === "true" ? "Exitoso" : "Fallido";
		$obj->Dedo1 = "Score " . " " . $objBiometriaValidacion->getDedo1score() . " Resultado " . $resultdedo1;
		$obj->Dedo2 = "Score " . " " . $objBiometriaValidacion->getDedo2score() . " Resultado " . $resultdedo2;
		$obj->Nut = $objBiometriaValidacion->getNut();
		$obj->IdeTrans = $objBiometriaValidacion->getTransaccionid();
		$obj->FechaVal = $objBiometriaValidacion->getFechavalidacion();
		$obj->infoAdic = $objBiometriaValidacion->getCodigoestado() . "-" . $objBiometriaValidacion->getMensajeestado() . "-" . $objBiometriaValidacion->getCodigoinformacion() . "-" . $objBiometriaValidacion->getInformacion();
		$obj->Ide = $objBiometriaValidacion->getId_documento();
		$usuarioObj = Usuario::crear($objBiometriaValidacion->getId_usuario());
		$obj->User = $usuarioObj->getNombreCompleto();
		$fechaRegistro = fechaFormatoConHora($objBiometriaValidacion->getFecharegistro(), false);
		$obj->msjEncabezado = "Resultado de validación de identidad $idvalidacion realizada el $fechaRegistro";

		$this->retorno->msg = "";
		$this->retorno->data = $obj;
		echo json_encode($this->retorno);
	}

	protected function previsualizar()
	{
		$spool = $this->frameWork->getSpool();
		$idUsuario = FrameWork::getIdUsuario();
		$tramite = $this->getString("tramite");
		$plantilla = $this->getString("plantilla");
		$idvalidacion = $this->getString("validacion");

		$fotoSRC = BiosignoWebValidacionIdentidad::crear($idvalidacion)->getFotografia();

		$plantillaDoc = PlantillaDocumento::crear($plantilla);
		$foto = "";
		if (!empty($fotoSRC)) {
			$data = file_get_contents($fotoSRC);
			$type = pathinfo($fotoSRC, PATHINFO_EXTENSION);
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
			$foto = "";
			if (!empty($base64)) {
				$foto = " <img style=\"width:200px\" id=\"fotografiaTramite\" src=\"$base64\" />";
			}
		}

//        QRCode::png("aca", null);
//        $imageString = base64_encode(ob_get_contents());
//        ob_end_clean();
//
//        $rutaQR = "tmp/qr-$idUsuario.jpeg";
//        $fpQR = fopen($spool . $rutaQR, "w+");
//        fwrite($fpQR, base64_decode($imageString));
//        fclose($fpQR);
//        $dataqr = file_get_contents($spool . "" . $rutaQR);
//        $typeqr = pathinfo($spool . "" . $rutaQR, PATHINFO_EXTENSION);
//        $base64qr = 'data:image/' . $typeqr . ';base64,' . base64_encode($dataqr);

		$qr = "";
		//        if (!empty($base64qr)) {
//            $qr = " <img style=\"width:200px\" id=\"fotografiaTramite\" src=\"$base64qr\" />";
//        }

		VariableDocumento::agregarVariable("[:vFOTOBIOMETRIA:]", $foto);
		VariableDocumento::agregarVariable("[:vIDVALIDACIONIDENTIDAD:]", $idvalidacion);
		VariableDocumento::agregarVariable("[:vQRBIOMETRIA:]", $qr);
		$plantilalminuta = $plantillaDoc->getMinuta();
		$minuta = VariableDocumento::getTextoArea($plantilalminuta, TRUE);

		$this->retorno->msg = "";
		$this->retorno->minuta = $minuta;
		echo json_encode($this->retorno);
	}

	protected function registrarTramite()
	{
		$spool = $this->frameWork->getSpool();
		$idUsuario = FrameWork::getIdUsuario();
		$usuario = Usuario::crear($idUsuario);

		$tramite = $this->getString("tramite");
		$plantilla = $this->getString("plantilla");
		$idvalidacion = $this->getString("validacion");
		$idTipoDoc = $this->getInt("idTipoDoc");
		$idDocumento = $this->getString("idDocumento");
		$fotoCapturada = $this->getString("fotoCapturada");
		$fecha = date("Y-m-d H:i:s");
		$fotoSRC = BiosignoWebValidacionIdentidad::crear($idvalidacion)->getFotografia();

		$plantillaDoc = PlantillaDocumento::crear($plantilla);
		$foto = "";
		if (!empty($fotoSRC)) {
			$data = file_get_contents($fotoSRC);
			$type = pathinfo($fotoSRC, PATHINFO_EXTENSION);
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
			$foto = "";
			if (!empty($base64)) {
				$foto = "<img id=\"fotografiaTramite\" src=\"$base64\" />";
			}
		}





		$biosignoServicio = new BiosignoWebServicio();
		$biosignoServicio->setFecha($fecha);
		$biosignoServicio->setTipo_documento($idTipoDoc);
		$biosignoServicio->setId_documento($idDocumento);
		$biosignoServicio->setIdvalidacionidentidad($idvalidacion);
		$biosignoServicio->setIdactosnr826($tramite);
		$biosignoServicio->setIdplantilladocumento($plantilla);
		$biosignoServicio->setMinuta("");
		$biosignoServicio->setEstado('t');
		$biosignoServicio->setMinuta("");
		$idBiosignoservicio = $biosignoServicio->guardarObjeto();

		$persona = Persona::crearPersona($idTipoDoc, $idDocumento);
		$nombresPerson = $persona->getNombres();
		$apellidosPerson = $persona->getApellidos();

		$arDatosQR = array();
		$arDatosQR[] = "Numero servicio: " . $idBiosignoservicio;
		$arDatosQR[] = "Fecha servicio: " . $fecha;
		$arDatosQR[] = "Código servicio: " . $tramite;
		$arDatosQR[] = "Documento: " . $idDocumento;
		$arDatosQR[] = "Nombres: " . $nombresPerson;
		$arDatosQR[] = "Apellidos: " . $apellidosPerson;

		$QRData = implode("\n", $arDatosQR);
		ob_start();
		QRCode::png($QRData, null);
		$imageString = base64_encode(ob_get_contents());
		ob_end_clean();

		$rutaQR = "tmp/qr-$idUsuario.jpeg";
		$fpQR = fopen($spool . $rutaQR, "w+");
		fwrite($fpQR, base64_decode($imageString));
		fclose($fpQR);
		$dataqr = file_get_contents($spool . "" . $rutaQR);
		$typeqr = pathinfo($spool . "" . $rutaQR, PATHINFO_EXTENSION);
		$base64qr = 'data:image/' . $typeqr . ';base64,' . base64_encode($dataqr);

		$qr = "";
		if (!empty($base64qr)) {
			$qr = "<img id=\"qrTramite\" src=\"$base64qr\" />";
		}


		VariableDocumento::agregarVariable("[:vFOTOBIOMETRIA:]", $foto);
		VariableDocumento::agregarVariable("[:vIDVALIDACIONIDENTIDAD:]", $idvalidacion);
		VariableDocumento::agregarVariable("[:vQRBIOMETRIA:]", $qr);
		$plantilalminuta = $plantillaDoc->getMinuta();
		$minuta = VariableDocumento::getTextoArea($plantilalminuta, TRUE);

		$biosignoServicio->setMinuta($minuta);
		$biosignoServicio->guardarObjeto();

		$desc = "Se registra servicio con validación biometrica $idBiosignoservicio para el cliente " . TipoDocumento::crear($idTipoDoc)->getDescripcion() . " $idDocumento, código de servicio $tramite y validación de identidad $idvalidacion";

		$auditoria = new Auditoria();
		$accionAuditable = AccionAuditable::crear(AccionAuditable::Insercion);
		$auditoria->setAccionAuditable($accionAuditable);
		$tarea = Tarea::crear(840);
		$auditoria->setTarea($tarea);
		$auditoria->setUsuario($usuario);
		$auditoria->setDescripcion($desc);
		$auditoria->guardarObjeto();

		$auditoriaPrincipal = new AuditoriaPrincipal();
		$auditoriaPrincipal->setIdEvento(840);
		$auditoriaPrincipal->setIdUsuario($idUsuario);
		$auditoriaPrincipal->setFecha($fecha);
		$auditoriaPrincipal->setDescripcion($desc);
		$auditoriaPrincipal->guardarObjeto($auditoria);

		$rutaPDF = "tmp/BiometriaServicio_" . $fecha . "_" . "$idDocumento.pdf";
		$conexion = $this->frameWork->getConexion();
		$spool = FrameWork::getSpool();
		validarEscritura($spool . $rutaPDF);
		$iqual = 5;
		$configPDF = array(
			"cuadricula" => true,
			"orientacion" => 'P',
			"encabezado_doc" => false,
			"mLeft" => $iqual,
			"mTop" => 2,
			"mRight" => 15,
			"mBottom" => $iqual,
			"num_pags" => false,
		);
		$html2pdf = iniciarPDF($conexion, "", "", $configPDF, true, true);
		obtenerMargenes($html2pdf);
		$unidadPorcentual = $html2pdf->margins["widthAvailable"] / 100;
		/* Seccion de descripcion de los datos iniciales */
		$html2pdf->pdf->SetLineStyle(array("width" => 0.20, "color" => array(179, 177, 178)));
		$html2pdf->pdf->SetTextColor(77, 77, 78);
		//        var_dump($biosignoServicio->getMinuta());
		$explodeTexto = explode("<table", $biosignoServicio->getMinuta(), 2);
		$strPdf = $explodeTexto[0];
		$bandera = true;
		$html2pdf->pdf->Rect(0, 0, $html2pdf->pdf->getPageWidth(), $html2pdf->pdf->getPageHeight());
		while ($bandera && isset($explodeTexto[1])) {
			//           busca final de la tabla
			$explodeTexto2 = explode("</table>", $explodeTexto[1], 2);
			//                busca tr incial
			$explodeTr = explode("<tr", $explodeTexto2[0], 2);
			//           busca tr final
			$explodeTr2 = explode("</tr>", $explodeTr[1], 2);
			//           cuenta los td que existan en el primer tr de la tabla
			$totalTD = substr_count($explodeTr2[0], "<td");
			//            divido el 100% en el numero de tds de la tabla
			$valorWidth = (100 / $totalTD);
			//            le asigno el estilo con el valor que tendra el width
			$calculoWidth = "style='width:" . number_format($valorWidth, 2, '.', ',') . "%;'";
			//            remplazo a las etiquetas td el td con el tamaño de width calculado
//            var_dump($explodeTexto2[0]);
			$posicion_coincidencia = strpos($explodeTexto2[0], "border: 0px none;");
			if ($posicion_coincidencia === false) {

			} else {
				$calculoWidth = "style='width:" . number_format($valorWidth, 2, '.', ',') . "%;border: 0px none;'";
			}
			$nuevo = str_replace("<td", "<td " . $calculoWidth, $explodeTexto2[0]);
			//            asigno a la etiqueta table el el string dentro de la tabla con los td con estilo ya reemplazado
			$strPdf .= "<table" . $nuevo . "</table>";
			$explodeSig = explode("<table", $explodeTexto2[1], 2);
			if (count($explodeSig) > 1) {
				//                si existe una siguiente tabla
				$strPdf .= $explodeSig[0];
				$explodeTexto[1] = $explodeSig[1];
			} else {
				//                si no existen mas tablas
				$strPdf .= (isset($explodeTexto2[1]) ? $explodeTexto2[1] : '');
				$bandera = false;
			}
		}
		$xd = '
      <style type="text/css">
      table{width:100%;}
      table, table td, table th{
          border-collapse: collapse;
      
      }
      table td,
      table th {
          font-size: 11px;
          padding: 3px;
          line-height: 1.2;
          font-family:arial;
          vertical-align:middle
      }
      table img{
        width:100%
      }
      #qrTramite{
        padding:70px;
      }
      #fotografiaTramite{
        padding:30px;
      }
      .brIni{
        border-radius: 20px;
        border: 1px solid #ccc;
        padding: 15px;
      }
      </style>
      ';
		$html2pdf->writeHTML($xd . "<div class='brIni'>" . $strPdf . "</div>");
		finalizarPDF($html2pdf, $spool . $rutaPDF);

		$this->retorno->msg = "";
		$this->retorno->rutaPdf = $rutaPDF;
		echo json_encode($this->retorno);
	}

	protected function copiarArchivo($destino, $contenidoArchivo)
	{
		$this->rmkdir($destino);
		file_put_contents($destino, base64_decode($contenidoArchivo));
	}

	protected function rmkdir($destino)
	{
		$path = dirname($destino);
		$arrayPaths = array();
		while (!file_exists($path)) {
			$arrayPaths[] = $path;
			$path = dirname($path);
		}
		$arrayPaths = array_reverse($arrayPaths);
		foreach ($arrayPaths as $path) {
			mkdir($path);
		}
	}

}

$interfaz = new BiosignoWeb(new ArrayObject(array_merge($_POST, $_GET)), $miFramework);
$interfaz->cerrar();