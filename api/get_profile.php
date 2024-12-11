<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php'; // Correct path to Database.php
include_once '../models/User.php'; // Correct path to User.php

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die(json_encode(array("message" => "User ID is required.")));

$user->id = $user_id;

if ($user->getProfile()) {
    $user_arr = array(
        "id" => $user->id,
        "fullname" => $user->fullname,
        "email" => $user->email,
        "theme" => $user->theme,
        "timezone" => $user->timezone,
        "email_notifications" => $user->email_notifications,
        "web_notifications" => $user->web_notifications,
        "profile_image" => $user->profile_image
    );

    http_response_code(200);
    echo json_encode($user_arr);
} else {
    error_log("User not found for ID: " . $user_id); // Log the user ID that was not found
    http_response_code(404);
    echo json_encode(array("message" => "User not found."));
}
