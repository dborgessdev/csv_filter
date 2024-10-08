<?php

class ApiController extends Controller
{
    private $apiUrl = 'https://coworkingmodelo.conexa.app/index.php/api/v2'; // URL da API externa
    private $username = 'davi.borges'; // Usuário da API externa
    private $password = 'tYcSa12mluca.'; // Senha da API externa

    // Ação para autenticar e obter o token de acesso
    public function actionAuthenticate()
    {
        $url = $this->apiUrl . '/auth';

        // Dados para autenticação
        $postData = json_encode([
            'username' => $this->username,
            'password' => $this->password
        ]);

        // Faz a requisição para a API externa
        $response = $this->makeRequest($url, $postData);

        if ($response && isset($response['accessToken'])) {
            // Retorna o token de acesso para o front-end
            echo json_encode(['accessToken' => $response['accessToken']]);
        } else {
            // Retorna erro caso não consiga autenticar
            echo json_encode(['error' => 'Falha na autenticação']);
        }
    }

    public function getBeaterToken() // Função para obter o token de acesso
    {
        // Verifica se o cabeçalho Authorization está presente
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            // Alternativa em caso de redirecionamento de cabeçalhos
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (!empty($authHeader)) { // Verifica se o token começa com "Bearer "
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $bearerToken = $matches[1];
                // Agora você pode utilizar o token conforme necessário
                return $bearerToken;
            }
        }
        return null;
    }

    // Ação para cadastrar clientes na API externa
    public function actionCustomer()
    {
        $accessToken = $this->getBeaterToken();
        $clientes = json_decode(file_get_contents('php://input'), true); // Dados do cliente
        
        if ($accessToken && !empty($clientes)) { // Verifica se o token de acesso e os dados de cliente foram fornecidos
            $url = $this->apiUrl . '/customer';
            
            // Faz a requisição para a API externa com os dados do cliente
            $response = $this->makeRequest($url, json_encode($clientes), $accessToken);

            if (isset($response['error'])) {
                // Retorna a mensagem de erro detalhada se houver
                echo json_encode(['error' => $response['error']]);
            } else {
                echo json_encode(['success' => 'Cliente cadastrado com sucesso', 'id' => $response['id']]);
            }
        } else {
            echo json_encode(['error' => 'Token de acesso ou dados de cliente ausentes']);
        }
    }

    // Função auxiliar para fazer requisições à API externa
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

        // Tenta decodificar a resposta da API
        $decodedResponse = json_decode($response, true);

        if ($httpCode == 200 || $httpCode == 201) {
            return $decodedResponse;
        } elseif ($httpCode == 400) {
            // Bad Request: A solicitação tem dados inválidos
            return ['error' => isset($decodedResponse['error']) ? $decodedResponse['error'] : 'Requisição inválida. Verifique se os dados (CPF/CNPJ) enviados estão corretos.'];

        } elseif ($httpCode == 401) {
            // Unauthorized: Falha de autenticação, token inválido ou expirado
            return ['error' => 'Não autorizado. Verifique as credenciais ou token de acesso.'];
        } elseif ($httpCode == 404) {
            // Not Found: O recurso solicitado não foi encontrado
            return ['error' => 'Cliente não encontrado. Verifique a URL ou o ID do recurso.'];
        } elseif ($httpCode == 422) {
            // Unprocessable Entity: Erros de validação dos dados enviados
            return ['error' => isset($decodedResponse['details']['message']) ? $decodedResponse['details']['message'] : 'Não foi possível processar sua solicitação / O cliente não pode pertencer a mais de um grupo, podendo ser apenas pessoa física ou jurídica ou estrangeiro'];
        } elseif ($httpCode == 500) {
            // Internal Server Error: Erro interno do servidor na API
            return ['error' => 'Erro interno no servidor. Tente novamente mais tarde.'];
        } else {
            // Outros códigos de erro
            return ['error' => 'Erro desconhecido. Código HTTP: ' . $httpCode];
        }

        return null;
    }
}
