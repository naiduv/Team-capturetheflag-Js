<?php
echo "its up";

$url = '127.0.0.1:5001';
$ch = curl_init();

curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch,CURLOPT_POST,$_POST);

$result = curl_exec($ch);
?>