<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Task.php';
require_once '../api/Tag.php';
require_once '../api/Attachment.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $task = new Task($db);
    $tag = new Tag($db);
    $attachment = new Attachment($db);

    $task_id = isset($_GET['task_id']) ? $_GET['task_id'] : die();
    
    $task_details = $task->getDetails($task_id);
    $tags = $tag->getTaskTags($task_id);
    $attachments = $attachment->getTaskAttachments($task_id);

    $response = [
        'task' => $task_details,
        'tags' => $tags,
        'attachments' => $attachments
    ];

    http_response_code(200);
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
