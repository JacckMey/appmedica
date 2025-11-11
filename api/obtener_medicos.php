<?php
// Activar el reporte de errores para desarrollo
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

try {
    // Configuración de la conexión a la base de datos
    $servidor = "localhost";
    $puerto = "3306";
    $usuario = "root";
    $contrasena = "";
    $basededatos = "appmedica";

    // Crear conexión con el puerto especificado
    $dsn = "mysql:host=$servidor;port=$puerto;dbname=$basededatos;charset=utf8mb4";
    $opciones = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $conexion = new PDO($dsn, $usuario, $contrasena, $opciones);
    
    // Consulta SQL para obtener los médicos con sus especialidades
    $consulta = $conexion->query("SELECT m.*, 
                                 COALESCE(e.nombre, 'Sin especialidad') as nombre_especialidad 
                                 FROM medico m 
                                 LEFT JOIN especialidad e ON m.especialidad_id = e.id 
                                 WHERE m.estado = 1");
    $medicos = $consulta->fetchAll();
    
    // Establecer las cabeceras solo si no hay errores
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Devolver los resultados como JSON
    echo json_encode([
        'success' => true,
        'data' => $medicos
    ], JSON_UNESCAPED_UNICODE);
    
} catch(PDOException $e) {
    // Registrar el error en el log
    error_log("Error en obtener_medicos.php: " . $e->getMessage());
    
    // Limpiar cualquier salida anterior
    if (ob_get_length()) ob_clean();
    
    // Enviar respuesta de error en formato JSON
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al conectar con la base de datos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch(Exception $e) {
    // En caso de error, devolver un mensaje de error
    echo json_encode([
        'success' => false,
        'error' => 'Error al conectar con la base de datos: ' . $e->getMessage()
    ]);
}
?>
