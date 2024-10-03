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
                            // Mova a verificação de erros para fora da validação da linha
                            $rowErrors = []; 
                            if (!$this->validateRow($row, $rowErrors, $rowNumber)) {
                                foreach ($rowErrors as &$error) {
                                    $error = "Linha $rowNumber: $error"; // Adiciona o prefixo aqui
                                }
                                $errors = array_merge($errors, $rowErrors); // Mescla erros específicos da linha com os erros gerais
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

    private function validateRow($row, &$rowErrors, $rowNumber) // Validação dos dados de cada linha
    {
        $errorPrefix = ""; // Remova o prefixo aqui
        $cpf = trim($row[7]);
        $cnpj = trim($row[6]);
        $hasCnpj = !empty($cnpj) && preg_match('/^\d{14}$/', str_replace(['.', '/', '-'], '', $cnpj));
        $hasCpf = !empty($cpf) && preg_match('/^\d{11}$/', str_replace(['.', '-', ' '], '', $cpf));

        // Verificando se CNPJ ou CPF estão preenchidos
        if (empty($cpf) && empty($cnpj)) {
            $rowErrors[] = "CNPJ ou CPF é obrigatório.";
        } elseif (!$hasCnpj && !empty($cnpj)) {
            $rowErrors[] = "CNPJ inválido: " . $cnpj;
        } elseif (!$hasCpf && !empty($cpf)) {
            $rowErrors[] = "CPF inválido: " . $cpf;
        }

        // Validação do dia de vencimento
        if (empty($row[1])) {
            $rowErrors[] = "O dia de vencimento é obrigatório.";
        } elseif ($row[1] < 1 || $row[1] > 31) {
            $rowErrors[] = "O dia de vencimento deve ser entre 1 e 31.";
        }

        // Validação dos e-mails
        $emails = explode(';', $row[10]);
        foreach ($emails as $email) {
            if (!filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
                $rowErrors[] = "E-mail de financeiro inválido: " . trim($email);
            }
        }

        // Validação do companyId (ID da Unidade)
        if (!is_numeric($row[49]) || intval($row[49]) <= 0) {
            $rowErrors[] = "ID da Unidade inválido.";
        }

        // Validação do estado civil
        $validMaritalStatuses = ['C', 'S', 'D', 'V'];
        if (!in_array(trim($row[47]), $validMaritalStatuses)) {
            $rowErrors[] = "Estado civil inválido. Valores permitidos: C (Casado), S (Solteiro), D (Divorciado), V (Viúvo).";
        }

        // Validação do formato de data de nascimento ou fundação (dd/mm/aaaa)
        if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $row[5])) {
            $rowErrors[] = "Data de nascimento ou fundação inválida. Use o formato dd/mm/aaaa.";
        }

        // Verificação de campos obrigatórios
        $requiredFields = [
            'Dia de vencimento' => $row[1],        // Coluna 1
            'Nome completo' => $row[2],            // Coluna 2
            'Rua' => $row[17],                      // Coluna 17
            'Número' => $row[18],                   // Coluna 18
            'Complemento' => $row[19],              // Coluna 19
            'Bairro' => $row[20],                   // Coluna 20
            'CEP' => $row[21],                      // Coluna 21
            'Cidade' => $row[22],                   // Coluna 22
            'Estado (UF)' => trim($row[23]),        // Coluna 23
            'Celular' => trim($row[13]),            // Coluna 13
            'E-mail de financeiro' => trim($row[10]), // Coluna 10
        ];

        foreach ($requiredFields as $fieldName => $value) {
            if (empty(trim($value))) {
                $rowErrors[] = "$fieldName é obrigatório.";
            }
        }

        return empty($rowErrors); // Retorna TRUE se nenhum erro foi encontrado
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
