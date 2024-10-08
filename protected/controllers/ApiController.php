<?php

class ApiController extends Controller
{
    private $apiUrl = 'https://coworkingmodelo.conexa.app/index.php/api/v2';
    private $username = 'davi.borges'; 
    private $password = 'tYcSa12mluca.'; 


    public function actionAuthenticate()
    {
        $url = $this->apiUrl . '/auth';


        $postData = json_encode([
            'username' => $this->username,
            'password' => $this->password
        ]);


        $response = $this->makeRequest($url, $postData);

        if ($response && isset($response['accessToken'])) {

            echo json_encode(['accessToken' => $response['accessToken']]);
        } else {

            echo json_encode(['error' => 'Falha na autenticação']);
        }
    }

    public function getBeaterToken() 
    { 
        
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {

            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (!empty($authHeader)) { 
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) { 
                $bearerToken = $matches[1];

                return $bearerToken;
            }
        }
        return null;
    }


    public function actionCustomer()
    {
        $accessToken = $this->getBeaterToken();
        $clientes = json_decode(file_get_contents('php://input'), true);
        
        if ($accessToken && !empty($clientes)) { 
            $url = $this->apiUrl . '/customer';
            

            $response = $this->makeRequest($url, json_encode($clientes), $accessToken);

            if (isset($response['error'])) {

                echo json_encode(['error' => $response['error']]);
            } else {
                echo json_encode(['success' => 'Cliente cadastrado com sucesso', 'id' => $response['id']]);
            }
        } else {
            echo json_encode(['error' => 'Token de acesso ou dados de cliente ausentes']);
        }
    }


    private function makeRequest($url, $postData, $accessToken = null)
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            $accessToken ? 'Authorization: Bearer ' . $accessToken : ''
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);


        $decodedResponse = json_decode($response, true);

        if ($httpCode == 200 || $httpCode == 201) {
            return $decodedResponse;
        } elseif ($httpCode == 400) {

            return ['error' => isset($decodedResponse['error']) ? $decodedResponse['error'] : 'Requisição inválida. Verifique se os dados (CPF/CNPJ) enviados estão corretos.'];

        } elseif ($httpCode == 401) {

            return ['error' => 'Não autorizado. Verifique as credenciais ou token de acesso.'];
        } elseif ($httpCode == 404) {

            return ['error' => 'Cliente não encontrado. Verifique a URL ou o ID do recurso.'];
        } elseif ($httpCode == 422) {
            return ['error' => isset($decodedResponse['details']['message']) ? $decodedResponse['details']['message'] : 'Não foi possível processar sua solicitação / O cliente não pode pertencer a mais de um grupo, podendo ser apenas pessoa física ou jurídica ou estrangeiro'];
        } elseif ($httpCode == 500) {
            return ['error' => 'Erro interno no servidor. Tente novamente mais tarde.'];
        } else {
            return ['error' => 'Erro desconhecido. Código HTTP: ' . $httpCode];
        }
        return null;
    }
}
