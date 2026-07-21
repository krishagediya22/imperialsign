<?php

$host="localhost";
$user="root";
$pass="";
$dbname="imperial_db";

$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$company = $_POST['company'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = md5($_POST['password']);

$sql = "INSERT INTO users
(first_name, last_name, company, email, phone, password)
VALUES ('$firstName','$lastName','$company','$email','$phone','$password')";
$con=mysqli_connect($host,$user,$pass,$dbname);
mysqli_query($con,$sql);

if($con) 
	{
		echo 'connect';
	}
	else
	{
		echo 'not connect';
	}
    


?>