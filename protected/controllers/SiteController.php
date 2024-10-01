<?php

class SiteController extends Controller
{
    public function actionUpload()
    {
        header('Content-Type: application/json');
        $errors = [];
        $rowNumber = 3;

        if (isset($_FILES['csv_file'])) {
            $file = CUploadedFile::getInstanceByName('csv_file');

            if ($file && $file->getExtensionName() === 'csv') {
                $filePath = Yii::getPathOfAlias('webroot') . '/uploads/' . $file->getName();

                if ($file->saveAs($filePath)) {
                    $data = [];
                    if (($handle = fopen($filePath, 'r')) !== false) {
                        fgetcsv($handle, 1000, ",");
                        fgetcsv($handle, 1000, ",");

                        while (($row = fgetcsv($handle, 1000, ",")) !== false) {
                            if (!$this->validateRow($row, $errors, $rowNumber)) {
                                foreach ($errors as &$error) {
                                    $error = "Linha $rowNumber: $error";
                                }
                            }
                            $data[] = $row;
                            $rowNumber++;
                        }
                        fclose($handle);
                    }
                    echo json_encode(empty($errors) ? $data : ['errors' => $errors]);
                    Yii::app()->end();
                } else {
                    echo json_encode(['error' => 'Falha ao salvar o arquivo.']);
                }
            } else {
                echo json_encode(['error' => 'Arquivo CSV inválido.']);
            }
        } else {
            echo json_encode(['error' => 'Nenhum arquivo foi enviado.']);
        }
    }

    private function validateRow($row, &$errors, $rowNumber) // Validação dos dados de cada linha
{
    $errorPrefix = "Linha $rowNumber: ";
    $cpf = trim($row[7]);
    $cnpj = trim($row[6]);
    $hasCnpj = !empty($cnpj) && preg_match('/^\d{14}$/', str_replace(['.', '/', '-'], '', $cnpj));
    $hasCpf = !empty($cpf) && preg_match('/^\d{11}$/', str_replace(['.', '-', ' '], '', $cpf));

    // Verificando se CNPJ ou CPF estão preenchidos
    if (empty($cpf) && empty($cnpj)) {
        $errors[] = $errorPrefix . "CNPJ ou CPF é obrigatório.";
    } elseif (!$hasCnpj && !empty($cnpj)) {
        $errors[] = $errorPrefix . "CNPJ inválido: " . $cnpj;
    } elseif (!$hasCpf && !empty($cpf)) {
        $errors[] = $errorPrefix . "CPF inválido: " . $cpf;
    }

    // Validação do dia de vencimento
    if (empty($row[1])) {
        $errors[] = $errorPrefix . "O dia de vencimento é obrigatório.";
    } elseif ($row[1] < 1 || $row[1] > 31) {
        $errors[] = $errorPrefix . "O dia de vencimento deve ser entre 1 e 31.";
    }

    // Validação dos e-mails
    $emails = explode(';', $row[10]);
    foreach ($emails as $email) {
        if (!filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
            $errors[] = $errorPrefix . "E-mail de financeiro inválido: " . trim($email);
        }
    }

    // Validação do companyId (ID da Unidade)
    if (!is_numeric($row[49]) || intval($row[49]) <= 0) {
        $errors[] = $errorPrefix . "ID da Unidade inválido.";
    }

    // Validação do estado civil
    $validMaritalStatuses = ['C', 'S', 'D', 'V'];
    if (!in_array(trim($row[47]), $validMaritalStatuses)) {
        $errors[] = $errorPrefix . "Estado civil inválido. Valores permitidos: C (Casado), S (Solteiro), D (Divorciado), V (Viúvo).";
    }

    // Validação do formato de data de nascimento ou fundação (dd/mm/aaaa)
    if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $row[5])) {
        $errors[] = $errorPrefix . "Data de nascimento ou fundação inválida. Use o formato dd/mm/aaaa.";
    }

    // Verificação de campos obrigatórios
    $requiredFields = [
        'Dia de vencimento' => $row[1],        // Coluna 1
        'Nome completo' => $row[2],            // Coluna 2
        'Rua' => $row[17],                      // Coluna 17
        'Número' => $row[18],                   // Coluna 18
        'Bairro' => $row[20],                   // Coluna 20
        'CEP' => $row[21],                      // Coluna 21
        'Cidade' => $row[22],                   // Coluna 22
        'Estado (UF)' => trim($row[23]),        // Coluna 23
        'Celular' => trim($row[13]),            // Coluna 13
    ];

    foreach ($requiredFields as $fieldName => $value) {
        if (empty(trim($value))) {
            $errors[] = $errorPrefix . "$fieldName é obrigatório.";
        }
    }
    return empty($errors); // Retorna TRUE se nenhum erro foi encontrado
}
    public function actionIndex()
    {
        $this->render('upload');
    }

    public function actionError()
    {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }
}
