<?php
require "../../clases/Framework.php";
require "../../modulos/publico/funciones_signo.php";
require "../../modulos/publico/html2pdf_v4/utilidadesPDF2011.php";
$miFramework = new FrameWork("signo");
/**
 * Description of ConsultaBiosignoWeb
 *
 * @author jorge.suspe
 */
class ConsultaBiosignoWeb extends InterfazBase{
    const CARGAR_ID_PERSONAS = 101;
    const CONSULTAR_REGISTROS_BIOSIGNOWEB = 102;
    const DESCARGAR_REGISTROS_BIOSIGNOWEB = 103;
    const CARGAR_DEDOS = 105;
    const CARGAR_SERVICIOS = 106;

        public function __construct(ArrayObject $args = NULL, FrameWork $frameWork = NULL) {
        parent::__construct($args, $frameWork);
        $accion = $this->getInt('accion');
        switch ($accion) {
            case ConsultaBiosignoWeb::CARGAR_ID_PERSONAS: {
                $this->consultaTipoDocumentoPersonas();
                break;
            }
            case ConsultaBiosignoWeb::CONSULTAR_REGISTROS_BIOSIGNOWEB: {
                $this->consultarRegistrosBiosignoWeb();
                break;
            }
            case ConsultaBiosignoWeb::DESCARGAR_REGISTROS_BIOSIGNOWEB: {
                $this->descargarRegistrosBiosignoWeb();
                break;
            }
            case ConsultaBiosignoWeb::CARGAR_DEDOS: {
                $this->consultarDedos();
                break;
            }
            case ConsultaBiosignoWeb::CARGAR_SERVICIOS: {
                $this->consultarServicios();
                break;
            }
            default: {
                echo json_encode($this->retorno);
            }
        }
    }
    
    public function consultarRegistrosBiosignoWeb(){
        $datos = $this->getString('datos');
        $dateValidacionIdentidadDesde = $datos['dateValidacionIdentidadDesde'];
        $dateValidacionIdentidadHasta = $datos['dateValidacionIdentidadHasta'];
        $tipoIdentificacion = $datos['tipoIdentificacion'];
        $numeroIdentificacion = $datos['numeroIdentificacion'];
        $nombre = $datos['nombre'];
        $apellido = $datos['apellido'];
        $idTransaccion = $datos['idTransaccion'];
        $idNut = $datos['idNut'];
        $idDedo = $datos['idDedo'];
        $validacionDedo = $datos['validacionDedo'];
        $servicio = $datos['servicio'];
        
        $condiciones = [];
        if(!empty($dateValidacionIdentidadDesde)){
            $condiciones[] = "biosignowebvalidacionidentidad.fecharegistro >= '{$dateValidacionIdentidadDesde} 00:00:00'";
        }
        if(!empty($dateValidacionIdentidadHasta)){
            $condiciones[] = "biosignowebvalidacionidentidad.fecharegistro <= '{$dateValidacionIdentidadHasta} 23:59:59'";
        }
        if(!empty($tipoIdentificacion)){
            $condiciones[] = "biosignowebvalidacionidentidad.tipo_documento = $tipoIdentificacion";
        }
        if(!empty($numeroIdentificacion)){
            $condiciones[] = "biosignowebvalidacionidentidad.id_documento = $numeroIdentificacion";
        }
        if(!empty($nombre)){
            $condiciones[] = "persona.nombre_usuario ilike '%" . pg_escape_string($nombre) . "%'";
        }
        if(!empty($apellido)){
            $condiciones[] = "persona.apellidos_usuario ilike '%" . pg_escape_string($apellido) . "%'";
        }
        if(!empty($idTransaccion)){
            $condiciones[] = "biosignowebvalidacionidentidad.transaccionid = $idTransaccion";
        }
        if(!empty($idNut)){
            $condiciones[] = "biosignowebvalidacionidentidad.nut = $idNut";
        }
        if(!empty($idDedo)){
            $condiciones[] = "(biosignowebvalidacionidentidad.dedo1finger IN ('$idDedo') or biosignowebvalidacionidentidad.dedo2finger IN ('$idDedo'))";
        }
        if(!empty($validacionDedo)){
            if ($validacionDedo === '0'){
                $condiciones[] = "(biosignowebvalidacionidentidad.dedo1resultadovalidacion = 'true' or biosignowebvalidacionidentidad.dedo1resultadovalidacion = 'false')"
                        . "(biosignowebvalidacionidentidad.dedo2resultadovalidacion = 'true' or biosignowebvalidacionidentidad.dedo2resultadovalidacion = 'false')";
            }else if($validacionDedo === '1'){
                $condiciones[] = "(biosignowebvalidacionidentidad.dedo1resultadovalidacion = 'true' or biosignowebvalidacionidentidad.dedo2resultadovalidacion = 'true')";
            }else{
                $condiciones[] = "(biosignowebvalidacionidentidad.dedo1resultadovalidacion = 'false' or biosignowebvalidacionidentidad.dedo1resultadovalidacion = 'false')";
            }
        }
        if(!empty($servicio)){
            $condiciones[] = "biosignowebservicio.idactosnr826 in ('$servicio')";
        }
        
        $join = "join persona on biosignowebvalidacionidentidad.tipo_documento = persona.tipo_documento and biosignowebvalidacionidentidad.id_documento = persona.id_documento 
                join biosignowebatdp on persona.tipo_documento = biosignowebatdp.tipo_documento and persona.id_documento = biosignowebatdp.id_documento 
                join biosignowebservicio using (idvalidacionidentidad)
                join actossnrr826 on biosignowebservicio.idactosnr826 = actossnrr826.idactosnrr826 
                join tipodocumento on biosignowebvalidacionidentidad.tipo_documento = tipodocumento.tipo_documento 
                join dedos d1 on biosignowebvalidacionidentidad.dedo1finger = d1.iddedo 
                join dedos d2 on biosignowebvalidacionidentidad.dedo2finger = d2.iddedo ";
        $where = count($condiciones) > 0 ? " WHERE " . implode(" AND ", $condiciones): "";
        $sql = "fecharegistro, apellidos_usuario ||' '|| nombre_usuario as nombrecompleto, descripcion_tipo ||' '||  biosignowebvalidacionidentidad.id_documento as document, transaccionid, nut, codigoestado, mensajeestado, codigoinformacion, informacion,
                dedo1finger, dedo1resultadovalidacion, dedo1score, dedo2finger, dedo2resultadovalidacion, dedo2score, idactosnr826, nombre, biosignowebservicio.fecha,
                (select date(fecha) as fecha from biosignowebatdp where id_documento = biosignowebvalidacionidentidad.id_documento  and tipo_documento = biosignowebvalidacionidentidad.tipo_documento  and fecha >=  biosignowebvalidacionidentidad.fecharegistro 
                and acteptotdp = true order by fecha desc limit 1) as fechabiosignowebatdp, d1.descripcion as dedo1, d2.descripcion as dedo2, idvalidacionidentidad";
        $groupby = "group by fecharegistro, transaccionid, nombrecompleto,descripcion_tipo, biosignowebvalidacionidentidad.id_documento, nut, codigoestado, mensajeestado, codigoinformacion, informacion, dedo1finger,
                    dedo1resultadovalidacion, dedo1score,dedo2finger, dedo2resultadovalidacion, dedo2score, idactosnr826, nombre, fechabiosignowebatdp, biosignowebservicio.fecha, dedo1, dedo2, idvalidacionidentidad";
        
        $rtaConsulta = BiosignoWebValidacionIdentidad::listar(RecordSet::FORMATO_ARRAY, $join . " " . $where . " " . $groupby, $sql);
        $datos = [];
        foreach ($rtaConsulta as $value) {
            $dedo1 = ($value->dedo1resultadovalidacion === 'true' ? 'Exitoso': 'Fallido' );
            $dedo2 = ($value->dedo2resultadovalidacion === 'true' ? 'Exitoso': 'Fallido' );
            $value->fecharegistro = fechaFormatoConHora($value->fecharegistro, false);
            $value->codigoestado = "(" .$value->codigoestado . " - " .$value->mensajeestado . " - " . $value->codigoinformacion . " - " .$value->informacion .")";
            $value->dedo1 .= " - " .$dedo1 ." (score " . $value->dedo1score .")" ;
            $value->dedo2 .= " - " .$dedo2 ." (score " . $value->dedo2score .")" ;
            $value->servicio = $value->idactosnr826 . " - " . $value->nombre . " (" . $value->fecha . ")";
            $idx = array_search($value->nut, array_column($datos, 'nut'));
            if ($idx === false) {
                $datos[] = (array) $value;
            } else {
                $datos[$idx]['servicio'] .= "<br>". $value->idactosnr826 . " - " . $value->nombre . " (" . $value->fecha . ")";
            }
        }
        $this->retorno->msg = "";
        $this->retorno->datos = $datos ;
        echo json_encode($this->retorno);
    }


    public function consultarServicios(){
        $rtaConsulta = ActosSNR_R826::listar(RecordSet::FORMATO_ARRAY, "where biosignoweb = true order by nombre asc", "idactosnrr826, nombre");
        $this->retorno->msg = "";
        $this->retorno->servicios = $rtaConsulta;
        echo json_encode($this->retorno);
    }
    
    public function consultarDedos(){
        $rtaConsulta = Dedos::Listar(RecordSet::FORMATO_ARRAY);
        $this->retorno->msg = "";
        $this->retorno->dedos = $rtaConsulta;
        echo json_encode($this->retorno);
    }
    
    public function consultaTipoDocumentoPersonas(){
        $rtaConsulta = TipoDocumento::listar(RecordSet::FORMATO_ARRAY, "where aplica_persona = true", "tipo_documento, descripcion_tipo");
        $this->retorno->msg = "";
        $this->retorno->tipoDocumentos = $rtaConsulta;
        echo json_encode($this->retorno);
    }
    
    public function descargarRegistrosBiosignoWeb(){
        $datos = $this->getString('datos');
        $data = json_decode($datos);
        $tipo = $this->getString('tipo');
        if (isset($tipo) && $tipo !== "") {
            $idUsuario = FrameWork::getIdUsuario();
            $rutaCSV = "";
            $rutaPDF = "";
            $conexion = $this->frameWork->getConexion();
            $spool = FrameWork::getSpool();
            if ($tipo === 'PDF') {
                $rutaPDF = "tmp/ConsultaBiosignoWeb-$idUsuario.pdf";
                validarEscritura($spool . $rutaPDF);
                $html2pdf = iniciarPDF($conexion, "", "Consulta de identidad registradas en BIOSIGNO WEB", array("orientacion" => 'P', "cuadricula" => true));
                obtenerMargenes($html2pdf);
                $unidadPorcentual = $html2pdf->margins["widthAvailable"] / 100;
                $html2pdf->pdf->SetFontSize(12);
                /* Seccion de descripcion de los datos iniciales */

                $html2pdf->pdf->SetTextColor(77, 77, 78);
                $html2pdf->pdf->SetFont("", "B");
                $html2pdf->pdf->SetLineStyle(array("width" => 0.20, "color" => array(179, 177, 178)));
                $html2pdf->pdf->SetFontSize(12);

                $html2pdf->pdf->SetCellPadding(0.5);
                $html2pdf->pdf->SetDrawColor(255);
                /* Tabla de la descripcion de cada item */
                $html2pdf->pdf->Ln(5);
                $html2pdf->pdf->SetDrawColor(0);
                $html2pdf->pdf->SetLineStyle(array("width" => 0.20, "color" => array(179, 177, 178)));
                $arrayTPDF = Array("Fecha validación identidad", "Persona", "Datos de la validación", "Datos del servicio");
                $arrayWT = Array(
                    $unidadPorcentual * 25,
                    $unidadPorcentual * 25,
                    $unidadPorcentual * 25,
                    $unidadPorcentual * 25);
                estiloTH($html2pdf);
                $html2pdf->pdf->SetFontSize(12);
                $html2pdf->pdf->SetFont("", "B");
                $html2pdf->pdf->SetFillColor(217, 217, 217);
                $tituloP = "Consulta de identidad registradas en BIOSIGNO WEB";
                $html2pdf->pdf->MultiCell($unidadPorcentual * 100, 3, strtoupper($tituloP), "", "C", 0, 1, "", "", false, 0, true, true, 0);
                $html2pdf->pdf->Ln(4);
                $html2pdf->pdf->SetFontSize(7);
                escribirTituloTabla($html2pdf, $arrayWT, $arrayTPDF);
                $html2pdf->pdf->SetFillColor(0);
                estiloNormal($html2pdf, 7);
                $html2pdf->pdf->SetFontSize(7);
                //$nData=count($cantRegistros);
                $wFecha = $unidadPorcentual * 25;
                $wPersona = $unidadPorcentual * 25;
                $wDatosValidacion = $unidadPorcentual * 25;
                $wDatosServicio = $unidadPorcentual * 25;
                for ($i = 0; $i < count($data); $i++) {
                    $mmH = 35   ;
                    /* validar que salte pagina */
                    if ($html2pdf->pdf->GetY() + $mmH >= $html2pdf->margins["heightAvailable"]) {
                        $html2pdf->pdf->AddPage($html2pdf->orientacion, $html2pdf->papel);
                    }
                    $html2pdf->pdf->SetTextColor(0);
                    $html2pdf->pdf->SetFontSize(7);
                    $posX = $html2pdf->pdf->GetX();
                    $posY = $html2pdf->pdf->GetY();
                    $posYdespuesObse = $html2pdf->pdf->GetY();
                    if ($posYdespuesObse > ($posY + $mmH)) {
                        $mmH = $posYdespuesObse - $posY;
                    }
                                        
                    $html2pdf->pdf->MultiCell($wFecha, $mmH, $data[$i]->fecharegistro, $html2pdf->cuadricula/* border */, 'L'/* align */, 0/* Fondo */, 0/* BR */, $posX, $posY, true, 0, false, true, $mmH, 'M');
                    $html2pdf->pdf->MultiCell($wPersona, $mmH, $data[$i]->nombrecompleto ."<br>" .$data[$i]->document . "<br> Acepto tratamiento de datos personales " . $data[$i]->fechabiosignowebatdp , $html2pdf->cuadricula/* border */, 'L'/* align */, 0/* Fondo */, 0/* BR */, '', '', true, 0, true, true, $mmH, 'M');
                    $html2pdf->pdf->MultiCell($wDatosValidacion, $mmH, "Id Transacción      " . $data[$i]->transaccionid ."<br> NUT     " . $data[$i]->nut . "<br> Información validación       " .$data[$i]->codigoestado . "<br>Dedo 1        " .$data[$i]->dedo1 . "<br>Dedo 2       " .$data[$i]->dedo2, $html2pdf->cuadricula/* border */, 'L'/* align */, 0/* Fondo */, 0/* BR */, '', '', true, 0, true, true, $mmH, 'M');
                    $html2pdf->pdf->MultiCell($wDatosServicio, $mmH, $data[$i]->servicio, $html2pdf->cuadricula/* border */, 'L'/* align */, 0/* Fondo */, 1/* BR */, '', '', true, 0, true, true, $mmH, 'M');
                }
                estiloNormal($html2pdf, 7);
                $html2pdf->pdf->Ln(5);
                finalizarPDF($html2pdf, $spool . $rutaPDF);
                $this->retorno->msg = "";
                $this->retorno->rutaPDF = $rutaPDF;
                echo json_encode($this->retorno);
                exit();               
            }
            if ($tipo === "CSV") {
                $rutaCSV = "tmp/ConsultaBiosignoWeb-$idUsuario.csv";
                $f = fopen($spool . $rutaCSV, "w+");
                $arrayT = Array("Fecha validación identidad", "Persona", "Datos de la validación", "Datos del servicio");
                fwrite($f, "\"" . implode("\";\"", $arrayT) . "\"\n");
                for ($i = 0; $i < count($data); $i++) {
                    $persona = $data[$i]->nombrecompleto ." " .$data[$i]->document . " Acepto tratamiento de datos personales " . $data[$i]->fechabiosignowebatdp;
                    $arrayFila3 = array(
                        $data[$i]->fecharegistro,
                        $persona,
                        $data[$i]->nombre,
                        $data[$i]->idactosnr826
                    );
                    fwrite($f, implode(";", $arrayFila3) . "\n");
                }
                fclose($f);
                $this->retorno->msg = "";
                $this->retorno->rutaCSV = $rutaCSV;
                echo json_encode($this->retorno);
                exit();
            }
        }
    }
}
$interfaz = new ConsultaBiosignoWeb(new ArrayObject(array_merge($_POST, $_GET)), $miFramework);
$interfaz->cerrar();
