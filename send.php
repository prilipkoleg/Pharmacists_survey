<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

if(isset($_POST['data'])) {
    $data = $_POST['data'];

    $to = 'olegbrab@gmail.com,ni@rainpartners.ua,ec@rainpartners.ua';

    if ( !is_dir('./output') )
        mkdir('./output');

    $now = new DateTime();
    $fp = fopen('./output/data'.$now->format('Y-m-d_H:i:s').'.json', 'w');
    fwrite($fp, json_encode($data));
    fclose($fp);

    $subject = 'Pharmacists survey';

    $headers = "From: Survey of person\r\n";
    $headers .= "Reply-To: ni@rainpartners.ua\r\n";
    $headers .= "CC: susan@example.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $output = '<html><body>
    <h1>1 Check Person form</h1>
    <hr>';

    foreach ($data['checkPerson'] as $index => $item){
        $output .= "<h3>".$item['question']."</h3>";

        foreach ($item['answers'] as $ind => $answer ) {
            $output .= "<p>$ind - <em>".$answer['id']."::".$answer['type']."</em> <b>".$answer['value']."</b></p>\r\n";
        }

        $output .= "-------------------------------<br>";
    }

    $output .= '
    <h1>2 Survey Steps</h1>
    <hr>';

    foreach ($data['surveySteps'] as $stepId => $step){
        $output .= "<h2>".$stepId."</h2>";

        foreach ($step as $index => $item){
            $output .= "<h3>".$item['question']."</h3>";

            foreach ($item['answers'] as $ind => $answer ) {
                $output .= "<p>$ind - <em>".$answer['id']."::".$answer['type']."</em> <b>".$answer['value']."</b></p>\r\n";
            }

            $output .= "-------------------------------<br>";
        }
    }

    $output .= '</body></html>';

    $message = $output;

    $status = mail($to, $subject, $message, $headers);
    if ($status) {
        echo "All good!!!";
    } else {
        echo "Mail send falled!!";
    };
}else {
    die('Something Wrong!');
}
