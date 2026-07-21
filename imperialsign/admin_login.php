<?php

session_start();

$con = mysqli_connect("localhost","root","","imperial_db");

$email = $_POST['email'];
$password = md5($_POST['password']);

$sql = "SELECT * FROM admin 
        WHERE email='$email' 
        AND password='$password'";

$result = mysqli_query($con,$sql);

if(mysqli_num_rows($result) > 0)
{
    $_SESSION['admin'] = $email;
    header("Location: admin_dashboard.php");
}
else
{
    echo "Only Admin can login";
}

?>