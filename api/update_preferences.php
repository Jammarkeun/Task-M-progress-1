<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

require_once './config/Database.php';
require_once './api/UserPreferences.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $preferences = new UserPreferences($db);

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->user_id)) {
        if ($preferences->updatePreferences($data->user_id, $data)) {
            http_response_code(200);
            echo json_encode(["message" => "Preferences updated successfully"]);
        } else {
            throw new Exception("Failed to update preferences");
        }
    } else {
        throw new Exception("Missing user ID");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
